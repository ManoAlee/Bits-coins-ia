/**
 * RESONANCE PARTICLES SYSTEM
 * ===========================
 * 
 * Sistema de partículas GPU-acelerado para visualizar ressonâncias
 * entre os 32 universos em tempo real.
 * 
 * Tecnologias:
 * - Instanced Rendering (milhares de partículas)
 * - Compute Shaders (cálculo de física na GPU)
 * - Geometry Instancing
 * - Custom Attributes
 * 
 * Física:
 * - Partículas representam "quanta" de acoplamento
 * - Movem-se entre universos baseado em força de ressonância
 * - Cor indica tipo de ressonância (harmônica, subarmônica, etc.)
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// VERTEX SHADER PARA PARTÍCULAS
// ============================================================================

const particleVertexShader = `
precision highp float;

// Atributos por instância
attribute vec3 instancePosition;
attribute vec3 instanceVelocity;
attribute vec3 instanceColor;
attribute float instanceSize;
attribute float instanceLife;

// Atributos do vértice
attribute vec3 position;

// Uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uPixelRatio;

// Varyings
varying vec3 vColor;
varying float vLife;
varying vec2 vUv;

void main() {
    vColor = instanceColor;
    vLife = instanceLife;
    
    // Posição da partícula
    vec3 particlePos = instancePosition;
    
    // Adiciona movimento ondulatório
    particlePos.y += sin(uTime * 2.0 + instancePosition.x * 10.0) * 0.1;
    particlePos.x += cos(uTime * 1.5 + instancePosition.z * 10.0) * 0.1;
    
    // Escala baseada em vida
    float scale = instanceSize * (0.5 + 0.5 * instanceLife);
    
    // Posição final do vértice
    vec3 finalPosition = particlePos + position * scale;
    
    // Transforma para clip space
    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Tamanho do ponto (para gl.POINTS)
    gl_PointSize = scale * uPixelRatio * (300.0 / -mvPosition.z);
    
    // UV para textura
    vUv = position.xy * 0.5 + 0.5;
}
`

// ============================================================================
// FRAGMENT SHADER PARA PARTÍCULAS
// ============================================================================

const particleFragmentShader = `
precision highp float;

varying vec3 vColor;
varying float vLife;
varying vec2 vUv;

uniform float uTime;

void main() {
    // Distância do centro (para fazer círculo)
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Descarta pixels fora do círculo
    if (dist > 0.5) discard;
    
    // Gradiente radial
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Modula por vida da partícula
    alpha *= vLife;
    
    // Brilho pulsante
    float pulse = 0.7 + 0.3 * sin(uTime * 5.0);
    alpha *= pulse;
    
    // Cor com brilho
    vec3 color = vColor * (1.0 + 0.5 * (1.0 - dist * 2.0));
    
    gl_FragColor = vec4(color, alpha);
}
`

// ============================================================================
// CLASSE DE PARTÍCULA
// ============================================================================

interface Particle {
    position: THREE.Vector3
    velocity: THREE.Vector3
    color: THREE.Color
    size: number
    life: number
    sourceUniverse: number
    targetUniverse: number
    resonanceStrength: number
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface ResonanceParticlesProps {
    universePositions: THREE.Vector3[]
    couplingMatrix: number[][]
    particleCount?: number
}

export function ResonanceParticles({
    universePositions,
    couplingMatrix,
    particleCount = 5000,
}: ResonanceParticlesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const particlesRef = useRef<Particle[]>([])
    
    // Buffers para atributos por instância
    const instancePositions = useRef(new Float32Array(particleCount * 3))
    const instanceVelocities = useRef(new Float32Array(particleCount * 3))
    const instanceColors = useRef(new Float32Array(particleCount * 3))
    const instanceSizes = useRef(new Float32Array(particleCount))
    const instanceLives = useRef(new Float32Array(particleCount))
    
    // Inicializa partículas
    useEffect(() => {
        const particles: Particle[] = []
        
        for (let i = 0; i < particleCount; i++) {
            // Escolhe par de universos aleatório
            const sourceIdx = Math.floor(Math.random() * universePositions.length)
            const targetIdx = Math.floor(Math.random() * universePositions.length)
            
            if (sourceIdx === targetIdx) continue
            
            // Força de acoplamento
            const coupling = couplingMatrix[sourceIdx]?.[targetIdx] || 0.1
            
            // Cria partícula
            const particle: Particle = {
                position: universePositions[sourceIdx].clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                color: getResonanceColor(coupling),
                size: 0.05 + Math.random() * 0.1,
                life: Math.random(),
                sourceUniverse: sourceIdx,
                targetUniverse: targetIdx,
                resonanceStrength: coupling,
            }
            
            particles.push(particle)
            
            // Preenche buffers
            const i3 = i * 3
            instancePositions.current[i3] = particle.position.x
            instancePositions.current[i3 + 1] = particle.position.y
            instancePositions.current[i3 + 2] = particle.position.z
            
            instanceVelocities.current[i3] = particle.velocity.x
            instanceVelocities.current[i3 + 1] = particle.velocity.y
            instanceVelocities.current[i3 + 2] = particle.velocity.z
            
            instanceColors.current[i3] = particle.color.r
            instanceColors.current[i3 + 1] = particle.color.g
            instanceColors.current[i3 + 2] = particle.color.b
            
            instanceSizes.current[i] = particle.size
            instanceLives.current[i] = particle.life
        }
        
        particlesRef.current = particles
        
        // Configura atributos de instância
        if (meshRef.current) {
            const geometry = meshRef.current.geometry as THREE.BufferGeometry
            
            geometry.setAttribute(
                'instancePosition',
                new THREE.InstancedBufferAttribute(instancePositions.current, 3)
            )
            geometry.setAttribute(
                'instanceVelocity',
                new THREE.InstancedBufferAttribute(instanceVelocities.current, 3)
            )
            geometry.setAttribute(
                'instanceColor',
                new THREE.InstancedBufferAttribute(instanceColors.current, 3)
            )
            geometry.setAttribute(
                'instanceSize',
                new THREE.InstancedBufferAttribute(instanceSizes.current, 1)
            )
            geometry.setAttribute(
                'instanceLife',
                new THREE.InstancedBufferAttribute(instanceLives.current, 1)
            )
        }
    }, [particleCount, universePositions, couplingMatrix])
    
    // Atualiza partículas a cada frame
    useFrame((state, delta) => {
        const particles = particlesRef.current
        if (!particles.length || !meshRef.current) return
        
        const geometry = meshRef.current.geometry as THREE.BufferGeometry
        
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i]
            
            // Posição alvo (universo de destino)
            const targetPos = universePositions[particle.targetUniverse]
            if (!targetPos) continue
            
            // Força de atração para alvo
            const direction = new THREE.Vector3()
                .subVectors(targetPos, particle.position)
                .normalize()
            
            const attraction = direction.multiplyScalar(
                particle.resonanceStrength * delta * 2.0
            )
            
            // Atualiza velocidade
            particle.velocity.add(attraction)
            
            // Damping
            particle.velocity.multiplyScalar(0.98)
            
            // Atualiza posição
            particle.position.add(
                particle.velocity.clone().multiplyScalar(delta)
            )
            
            // Atualiza vida
            particle.life -= delta * 0.5
            
            // Reinicia partícula se morreu ou chegou ao destino
            if (particle.life <= 0 || particle.position.distanceTo(targetPos) < 0.5) {
                // Escolhe novo par de universos
                particle.sourceUniverse = Math.floor(Math.random() * universePositions.length)
                particle.targetUniverse = Math.floor(Math.random() * universePositions.length)
                
                if (particle.sourceUniverse === particle.targetUniverse) {
                    particle.targetUniverse = (particle.targetUniverse + 1) % universePositions.length
                }
                
                // Reinicia posição
                particle.position.copy(universePositions[particle.sourceUniverse])
                
                // Reinicia velocidade
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                )
                
                // Atualiza acoplamento
                particle.resonanceStrength = 
                    couplingMatrix[particle.sourceUniverse]?.[particle.targetUniverse] || 0.1
                
                // Atualiza cor
                particle.color = getResonanceColor(particle.resonanceStrength)
                
                // Reinicia vida
                particle.life = 1.0
            }
            
            // Atualiza buffers
            const i3 = i * 3
            instancePositions.current[i3] = particle.position.x
            instancePositions.current[i3 + 1] = particle.position.y
            instancePositions.current[i3 + 2] = particle.position.z
            
            instanceVelocities.current[i3] = particle.velocity.x
            instanceVelocities.current[i3 + 1] = particle.velocity.y
            instanceVelocities.current[i3 + 2] = particle.velocity.z
            
            instanceColors.current[i3] = particle.color.r
            instanceColors.current[i3 + 1] = particle.color.g
            instanceColors.current[i3 + 2] = particle.color.b
            
            instanceLives.current[i] = particle.life
        }
        
        // Marca atributos para atualização
        const posAttr = geometry.getAttribute('instancePosition')
        const velAttr = geometry.getAttribute('instanceVelocity')
        const colAttr = geometry.getAttribute('instanceColor')
        const lifeAttr = geometry.getAttribute('instanceLife')
        
        if (posAttr) posAttr.needsUpdate = true
        if (velAttr) velAttr.needsUpdate = true
        if (colAttr) colAttr.needsUpdate = true
        if (lifeAttr) lifeAttr.needsUpdate = true
    })
    
    // Geometria e material
    const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 8, 8), [])
    
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })
    }, [])
    
    // Atualiza uniform de tempo
    useFrame((state) => {
        if (material) {
            material.uniforms.uTime.value = state.clock.elapsedTime
        }
    })
    
    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, particleCount]}
            frustumCulled={false}
        />
    )
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function getResonanceColor(strength: number): THREE.Color {
    /**
     * Mapeia força de ressonância para cor
     * 
     * Fraca (0.0-0.3): Azul (ressonância distante)
     * Média (0.3-0.6): Verde (ressonância moderada)
     * Forte (0.6-1.0): Vermelho (ressonância próxima)
     */
    
    if (strength < 0.3) {
        // Azul -> Ciano
        const t = strength / 0.3
        return new THREE.Color().setHSL(0.6, 0.8, 0.5 + t * 0.2)
    } else if (strength < 0.6) {
        // Ciano -> Verde -> Amarelo
        const t = (strength - 0.3) / 0.3
        return new THREE.Color().setHSL(0.4 - t * 0.2, 0.8, 0.6)
    } else {
        // Amarelo -> Laranja -> Vermelho
        const t = (strength - 0.6) / 0.4
        return new THREE.Color().setHSL(0.15 - t * 0.15, 0.9, 0.6 + t * 0.2)
    }
}

// ============================================================================
// COMPONENTE DE LINHAS DE CONEXÃO
// ============================================================================

interface ResonanceLinesProps {
    universePositions: THREE.Vector3[]
    couplingMatrix: number[][]
    threshold?: number
}

export function ResonanceLines({
    universePositions,
    couplingMatrix,
    threshold = 0.5,
}: ResonanceLinesProps) {
    const linesRef = useRef<THREE.LineSegments>(null)
    
    const geometry = useMemo(() => {
        const positions: number[] = []
        const colors: number[] = []
        
        // Cria linhas entre universos com acoplamento forte
        for (let i = 0; i < universePositions.length; i++) {
            for (let j = i + 1; j < universePositions.length; j++) {
                const coupling = couplingMatrix[i]?.[j] || 0
                
                if (coupling >= threshold) {
                    const pos1 = universePositions[i]
                    const pos2 = universePositions[j]
                    
                    // Adiciona linha
                    positions.push(pos1.x, pos1.y, pos1.z)
                    positions.push(pos2.x, pos2.y, pos2.z)
                    
                    // Cor baseada em força
                    const color = getResonanceColor(coupling)
                    colors.push(color.r, color.g, color.b)
                    colors.push(color.r, color.g, color.b)
                }
            }
        }
        
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        
        return geo
    }, [universePositions, couplingMatrix, threshold])
    
    const material = useMemo(() => {
        return new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
        })
    }, [])
    
    // Animação de pulsação
    useFrame((state) => {
        if (linesRef.current && material) {
            const pulse = 0.2 + 0.1 * Math.sin(state.clock.elapsedTime * 2.0)
            material.opacity = pulse
        }
    })
    
    return <lineSegments ref={linesRef} geometry={geometry} material={material} />
}
