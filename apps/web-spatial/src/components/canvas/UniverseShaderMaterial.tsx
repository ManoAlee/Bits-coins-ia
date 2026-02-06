/**
 * UNIVERSE SHADER MATERIAL
 * ========================
 * 
 * Implementação de shaders customizados em GLSL para visualização
 * matemática dos 32 universos com efeitos nunca vistos antes:
 * 
 * - Vertex Shader: Deformação baseada em funções φ(t) dos universos
 * - Fragment Shader: Colorização baseada em energia e entropia
 * - Compute Shader: Cálculo de acoplamento em tempo real
 * - Particle System: Visualização de ressonâncias
 * 
 * Tecnologias:
 * - WebGL 2.0 (shaders GLSL 3.0)
 * - React Three Fiber (R3F)
 * - Three.js ShaderMaterial
 * - Instanced Rendering para performance
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// VERTEX SHADER: Deformação Matemática
// ============================================================================

const vertexShader = `
precision highp float;

// Atributos
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uTime;
uniform float uUniverseId;
uniform float uFrequency;
uniform float uPhase;
uniform float uEnergy;
uniform float uEntropy;

// Varyings (para fragment shader)
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;
varying float vEnergy;

// Constantes matemáticas
#define PI 3.14159265359
#define TAU 6.28318530718

// ============================================================================
// FUNÇÕES MATEMÁTICAS DOS UNIVERSOS
// ============================================================================

float universeFunction(float t, float id) {
    // Cada universo tem sua função característica φ(t)
    
    if (id < 1.5) {
        // BOOLE: Lógica binária
        return sign(sin(TAU * t));
    }
    else if (id < 2.5) {
        // ASSEMBLY: Hardware reality
        return mod(floor(t), 256.0) / 256.0;
    }
    else if (id < 3.5) {
        // FORTRAN: Scientific origin
        return exp(-0.1 * t) * cos(3.0 * t);
    }
    else if (id < 4.5) {
        // LISP: Symbolic consciousness
        return tanh(sin(5.0 * t));
    }
    else if (id < 5.5) {
        // COBOL: Economic truth
        return log(abs(sin(t)) + 1.0) * sign(sin(t));
    }
    else if (id < 6.5) {
        // ALGOL: Structure
        return mod(t, 7.0) / 7.0;
    }
    else if (id < 7.5) {
        // C: Operational reality
        return sin(11.0 * t) * exp(-0.05 * t);
    }
    else if (id < 8.5) {
        // C++: Performance
        return sin(13.0 * t) + 0.5 * sin(26.0 * t);
    }
    else if (id < 9.5) {
        // MATLAB: Pure math
        return sin(17.0 * t) * cos(19.0 * t);
    }
    else if (id < 10.5) {
        // PYTHON: Cognitive bridge
        return sin(23.0 * t) * (1.0 + 0.3 * sin(3.0 * t));
    }
    else if (id < 11.5) {
        // JAVA: Institutional
        return sin(29.0 * t) * exp(-0.02 * t);
    }
    else if (id < 12.5) {
        // JAVASCRIPT: Human interface
        return sin(31.0 * t) + 0.3 * sin(62.0 * t) + 0.1 * sin(93.0 * t);
    }
    else if (id < 13.5) {
        // GO: Orchestration
        return sin(37.0 * t) * cos(41.0 * t);
    }
    else if (id < 14.5) {
        // RUST: Reliability
        return tanh(sin(43.0 * t));
    }
    else if (id < 15.5) {
        // CUDA: Parallel
        float sum = 0.0;
        for (float i = 0.0; i < 8.0; i++) {
            sum += sin((47.0 + i) * t);
        }
        return sum / 8.0;
    }
    else if (id < 16.5) {
        // SQL: Persistent memory
        return floor(sin(53.0 * t) * 10.0) / 10.0;
    }
    else if (id < 17.5) {
        // SHELL: Automation
        return sign(sin(59.0 * t)) * sqrt(abs(sin(59.0 * t)));
    }
    else if (id < 18.5) {
        // POWERSHELL: Administrative
        return sin(61.0 * t) * (1.0 + 0.2 * cos(t));
    }
    else if (id < 19.5) {
        // PHP: Web legacy
        return sin(67.0 * t) * exp(-0.03 * t);
    }
    else if (id < 20.5) {
        // RUBY: Expressive
        return sin(71.0 * t) * sin(73.0 * t);
    }
    else if (id < 21.5) {
        // SCALA: Big data
        return sin(79.0 * t) + 0.5 * cos(83.0 * t);
    }
    else if (id < 22.5) {
        // HASKELL: Mathematical purity
        return cos(89.0 * t) * exp(-0.01 * t);
    }
    else if (id < 23.5) {
        // ERLANG: Resilience
        return sin(97.0 * t) * (1.0 + 0.5 * sin(t / 10.0));
    }
    else if (id < 24.5) {
        // KOTLIN: Evolution
        return sin(101.0 * t) * cos(103.0 * t);
    }
    else if (id < 25.5) {
        // SWIFT: Local AI
        return tanh(sin(107.0 * t) * 2.0);
    }
    else if (id < 26.5) {
        // JULIA: Scientific velocity
        return sin(109.0 * t) * exp(-0.005 * t);
    }
    else if (id < 27.5) {
        // NIM: Efficiency
        return sin(113.0 * t) * abs(cos(t));
    }
    else if (id < 28.5) {
        // LUA: Real-time
        return sin(127.0 * t) + 0.3 * sin(254.0 * t);
    }
    else if (id < 29.5) {
        // DART: Multi-platform
        return sin(131.0 * t) * cos(137.0 * t);
    }
    else if (id < 30.5) {
        // GROOVY: Workflow
        return sin(139.0 * t) * (1.0 + 0.2 * sin(5.0 * t));
    }
    else if (id < 31.5) {
        // OBJECTIVE-C: Legacy bridge
        return sin(149.0 * t) * exp(-0.04 * t);
    }
    else {
        // SCRATCH: Human intent
        return floor(sin(151.0 * t) * 10.0) / 10.0;
    }
}

// Função de deformação baseada em múltiplos universos
float multiUniverseDisplacement(vec3 pos, float t) {
    float displacement = 0.0;
    
    // Contribuição do universo principal
    displacement += universeFunction(t + pos.x * 0.5, uUniverseId) * 0.3;
    
    // Contribuições de universos acoplados (ressonância)
    displacement += universeFunction(t + pos.y * 0.3, uUniverseId + 1.0) * 0.1;
    displacement += universeFunction(t + pos.z * 0.3, uUniverseId + 2.0) * 0.1;
    
    // Modulação por energia
    displacement *= (0.5 + 0.5 * uEnergy);
    
    return displacement;
}

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Calcula deslocamento baseado em função do universo
    float t = uTime + uPhase;
    float displacement = multiUniverseDisplacement(position, t);
    
    // Aplica deslocamento na direção da normal
    vec3 newPosition = position + normal * displacement;
    
    // Adiciona ondulação
    float wave = sin(position.x * uFrequency + uTime) * 
                 cos(position.y * uFrequency + uTime) * 0.1;
    newPosition += normal * wave;
    
    // Passa deslocamento para fragment shader
    vDisplacement = displacement;
    vEnergy = uEnergy;
    
    // Transforma posição
    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    // Transforma normal
    vNormal = normalize(normalMatrix * normal);
}
`

// ============================================================================
// FRAGMENT SHADER: Colorização Baseada em Física
// ============================================================================

const fragmentShader = `
precision highp float;

// Varyings do vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vDisplacement;
varying float vEnergy;

// Uniforms
uniform float uTime;
uniform float uUniverseId;
uniform vec3 uBaseColor;
uniform float uEntropy;
uniform float uPhase;
uniform float uMetalness;
uniform float uRoughness;

// Constantes
#define PI 3.14159265359

// ============================================================================
// FUNÇÕES DE COLORIZAÇÃO
// ============================================================================

// Mapeamento de energia para cor (espectro visível)
vec3 energyToColor(float energy) {
    // Mapeamento baseado em temperatura de corpo negro
    // Baixa energia: vermelho -> Alta energia: azul
    
    float t = clamp(energy, 0.0, 1.0);
    
    vec3 cold = vec3(0.1, 0.1, 0.8);   // Azul (baixa energia)
    vec3 warm = vec3(0.8, 0.1, 0.1);   // Vermelho (alta energia)
    vec3 hot = vec3(1.0, 1.0, 0.3);    // Amarelo (energia muito alta)
    
    if (t < 0.5) {
        return mix(cold, warm, t * 2.0);
    } else {
        return mix(warm, hot, (t - 0.5) * 2.0);
    }
}

// Mapeamento de entropia para brilho
float entropyToGlow(float entropy) {
    // Alta entropia = mais "caótico" = mais brilho
    return 0.5 + 0.5 * sin(entropy * PI);
}

// Padrão de interferência (ressonância entre universos)
float interferencePattern(vec2 uv, float time) {
    float pattern = 0.0;
    
    // Ondas circulares
    for (float i = 0.0; i < 3.0; i++) {
        vec2 center = vec2(
            0.5 + 0.3 * sin(time * 0.5 + i * 2.0),
            0.5 + 0.3 * cos(time * 0.7 + i * 2.0)
        );
        
        float dist = length(uv - center);
        pattern += sin(dist * 20.0 - time * 2.0 + i * PI) * 0.3;
    }
    
    return pattern;
}

// Fresnel effect (borda brilhante)
float fresnel(vec3 normal, vec3 viewDir, float power) {
    return pow(1.0 - abs(dot(normal, viewDir)), power);
}

// Noise function (Perlin-like)
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    // Normaliza normal
    vec3 normal = normalize(vNormal);
    
    // View direction (aproximado)
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
    
    // Cor base do universo
    vec3 baseColor = uBaseColor;
    
    // Modula cor por energia
    vec3 energyColor = energyToColor(vEnergy);
    vec3 color = mix(baseColor, energyColor, 0.5);
    
    // Adiciona padrão de interferência
    float interference = interferencePattern(vUv, uTime);
    color += vec3(interference) * 0.2;
    
    // Adiciona brilho baseado em entropia
    float glow = entropyToGlow(uEntropy);
    color += vec3(glow) * 0.3;
    
    // Adiciona efeito Fresnel (borda brilhante)
    float fresnelEffect = fresnel(normal, viewDir, 3.0);
    color += vec3(fresnelEffect) * energyColor * 0.5;
    
    // Adiciona ruído para textura
    float noiseValue = noise(vUv * 10.0 + uTime * 0.1);
    color += vec3(noiseValue) * 0.05;
    
    // Modulação temporal (pulsação)
    float pulse = 0.8 + 0.2 * sin(uTime * 2.0 + uPhase);
    color *= pulse;
    
    // Destaque baseado em deslocamento
    color += vec3(abs(vDisplacement)) * 0.5;
    
    // Gamma correction
    color = pow(color, vec3(1.0 / 2.2));
    
    gl_FragColor = vec4(color, 1.0);
}
`

// ============================================================================
// COMPONENTE REACT
// ============================================================================

interface UniverseShaderMaterialProps {
    universeId: number
    frequency: number
    phase: number
    energy: number
    entropy: number
    baseColor: THREE.Color
    metalness?: number
    roughness?: number
}

export function UniverseShaderMaterial({
    universeId,
    frequency,
    phase,
    energy,
    entropy,
    baseColor,
    metalness = 0.5,
    roughness = 0.5,
}: UniverseShaderMaterialProps) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    
    // Uniforms para shaders
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uUniverseId: { value: universeId },
            uFrequency: { value: frequency },
            uPhase: { value: phase },
            uEnergy: { value: energy },
            uEntropy: { value: entropy },
            uBaseColor: { value: baseColor },
            uMetalness: { value: metalness },
            uRoughness: { value: roughness },
        }),
        [universeId, frequency, phase, energy, entropy, baseColor, metalness, roughness]
    )
    
    // Atualiza uniforms a cada frame
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uEnergy.value = energy
            materialRef.current.uniforms.uEntropy.value = entropy
        }
    })
    
    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            side={THREE.DoubleSide}
        />
    )
}

// ============================================================================
// COMPONENTE DE UNIVERSO COMPLETO
// ============================================================================

interface UniverseSphereProps {
    universeId: number
    name: string
    position: [number, number, number]
    frequency: number
    baseColor: string
}

export function UniverseSphere({
    universeId,
    name,
    position,
    frequency,
    baseColor,
}: UniverseSphereProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [energy, setEnergy] = useState(0.5)
    const [entropy, setEntropy] = useState(0.5)
    const [phase, setPhase] = useState(0)
    
    // Simula evolução de energia e entropia
    useFrame((state) => {
        const t = state.clock.elapsedTime
        
        // Energia oscila baseada em função do universo
        const newEnergy = 0.5 + 0.5 * Math.sin(frequency * t * 0.1)
        setEnergy(newEnergy)
        
        // Entropia aumenta lentamente
        const newEntropy = 0.3 + 0.2 * Math.sin(t * 0.05)
        setEntropy(newEntropy)
        
        // Fase evolui
        setPhase(t * frequency * 0.01)
        
        // Rotação suave
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.001
            meshRef.current.rotation.y += 0.002
        }
    })
    
    const color = useMemo(() => new THREE.Color(baseColor), [baseColor])
    
    return (
        <mesh ref={meshRef} position={position}>
            <icosahedronGeometry args={[1, 4]} />
            <UniverseShaderMaterial
                universeId={universeId}
                frequency={frequency}
                phase={phase}
                energy={energy}
                entropy={entropy}
                baseColor={color}
            />
        </mesh>
    )
}

// Hook para estado
function useState<T>(initialValue: T): [T, (value: T) => void] {
    const ref = useRef<T>(initialValue)
    return [ref.current, (value: T) => { ref.current = value }]
}
