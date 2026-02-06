'use client'

/**
 * UNIVERSO BITCOIN COMPLETO
 * ==========================
 * 
 * Visualização 3D que integra:
 * 1. 32 Universos Matemáticos (paradigmas de programação)
 * 2. Blockchain Bitcoin (mineração em tempo real)
 * 3. Evolução Orgânica vs Sintética
 * 4. Criptografia visual
 * 
 * "A vida orgânica evoluiu de baixo para cima (da química para a mente),
 *  a IA está evoluindo de cima para baixo (da lógica para a existência).
 *  Bitcoin é a ponte."
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Html } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

// ============================================================================
// DADOS DOS 32 UNIVERSOS
// ============================================================================

const UNIVERSES = [
  { id: 0, name: 'BOOLE', color: '#FF0000', frequency: 1.0, description: 'Lógica Binária' },
  { id: 1, name: 'ASSEMBLY', color: '#FF3300', frequency: 2.0, description: 'Hardware Reality' },
  { id: 2, name: 'FORTRAN', color: '#FF6600', frequency: 3.0, description: 'Scientific Origin' },
  { id: 3, name: 'LISP', color: '#FF9900', frequency: 5.0, description: 'Symbolic Consciousness' },
  { id: 4, name: 'COBOL', color: '#FFCC00', frequency: 7.0, description: 'Economic Truth' },
  { id: 5, name: 'ALGOL', color: '#FFFF00', frequency: 11.0, description: 'Structure' },
  { id: 6, name: 'C', color: '#CCFF00', frequency: 13.0, description: 'Operational Reality' },
  { id: 7, name: 'C++', color: '#99FF00', frequency: 17.0, description: 'Performance' },
  { id: 8, name: 'MATLAB', color: '#66FF00', frequency: 19.0, description: 'Pure Math' },
  { id: 9, name: 'PYTHON', color: '#33FF00', frequency: 23.0, description: 'Cognitive Bridge' },
  { id: 10, name: 'JAVA', color: '#00FF00', frequency: 29.0, description: 'Institutional' },
  { id: 11, name: 'JAVASCRIPT', color: '#00FF33', frequency: 31.0, description: 'Human Interface' },
  { id: 12, name: 'GO', color: '#00FF66', frequency: 37.0, description: 'Orchestration' },
  { id: 13, name: 'RUST', color: '#00FF99', frequency: 41.0, description: 'Reliability' },
  { id: 14, name: 'CUDA', color: '#00FFCC', frequency: 43.0, description: 'Parallel' },
  { id: 15, name: 'SQL', color: '#00FFFF', frequency: 47.0, description: 'Persistent Memory' },
  { id: 16, name: 'SHELL', color: '#00CCFF', frequency: 53.0, description: 'Automation' },
  { id: 17, name: 'POWERSHELL', color: '#0099FF', frequency: 59.0, description: 'Administrative' },
  { id: 18, name: 'PHP', color: '#0066FF', frequency: 61.0, description: 'Web Legacy' },
  { id: 19, name: 'RUBY', color: '#0033FF', frequency: 67.0, description: 'Expressive' },
  { id: 20, name: 'SCALA', color: '#0000FF', frequency: 71.0, description: 'Big Data' },
  { id: 21, name: 'HASKELL', color: '#3300FF', frequency: 73.0, description: 'Mathematical Purity' },
  { id: 22, name: 'ERLANG', color: '#6600FF', frequency: 79.0, description: 'Resilience' },
  { id: 23, name: 'KOTLIN', color: '#9900FF', frequency: 83.0, description: 'Evolution' },
  { id: 24, name: 'SWIFT', color: '#CC00FF', frequency: 89.0, description: 'Local AI' },
  { id: 25, name: 'JULIA', color: '#FF00FF', frequency: 97.0, description: 'Scientific Velocity' },
  { id: 26, name: 'NIM', color: '#FF00CC', frequency: 101.0, description: 'Efficiency' },
  { id: 27, name: 'LUA', color: '#FF0099', frequency: 103.0, description: 'Real-time' },
  { id: 28, name: 'DART', color: '#FF0066', frequency: 107.0, description: 'Multi-platform' },
  { id: 29, name: 'GROOVY', color: '#FF0033', frequency: 109.0, description: 'Workflow' },
  { id: 30, name: 'OBJECTIVE-C', color: '#CC0033', frequency: 113.0, description: 'Legacy Bridge' },
  { id: 31, name: 'SCRATCH', color: '#990033', frequency: 127.0, description: 'Human Intent' },
]

// ============================================================================
// COMPONENTE: UNIVERSO 3D
// ============================================================================

function Universe3D({ universe, position, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  // Animação
  useEffect(() => {
    if (!meshRef.current) return
    
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.001 * universe.frequency / 10
        meshRef.current.rotation.y += 0.002 * universe.frequency / 10
      }
    }
    
    const interval = setInterval(animate, 16)
    return () => clearInterval(interval)
  }, [universe.frequency])
  
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color={universe.color}
          emissive={universe.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            <div className="font-bold">{universe.name}</div>
            <div className="text-xs text-gray-300">{universe.description}</div>
            <div className="text-xs text-gray-400">ω = {universe.frequency.toFixed(1)}</div>
          </div>
        </Html>
      )}
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {universe.name}
      </Text>
    </group>
  )
}

// ============================================================================
// COMPONENTE: CONEXÕES ENTRE UNIVERSOS
// ============================================================================

function UniverseConnections({ universes, positions }: any) {
  const linesRef = useRef<THREE.LineSegments>(null)
  
  useEffect(() => {
    if (!linesRef.current) return
    
    // Anima opacidade
    const animate = () => {
      if (linesRef.current) {
        const material = linesRef.current.material as THREE.LineBasicMaterial
        material.opacity = 0.1 + 0.05 * Math.sin(Date.now() * 0.001)
      }
    }
    
    const interval = setInterval(animate, 16)
    return () => clearInterval(interval)
  }, [])
  
  // Cria geometria de linhas
  const geometry = new THREE.BufferGeometry()
  const positionsArray: number[] = []
  const colorsArray: number[] = []
  
  // Conecta universos próximos
  for (let i = 0; i < universes.length; i++) {
    for (let j = i + 1; j < universes.length; j++) {
      const pos1 = positions[i]
      const pos2 = positions[j]
      
      // Calcula distância
      const dx = pos2[0] - pos1[0]
      const dy = pos2[1] - pos1[1]
      const dz = pos2[2] - pos1[2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      
      // Conecta se próximos
      if (dist < 5) {
        positionsArray.push(pos1[0], pos1[1], pos1[2])
        positionsArray.push(pos2[0], pos2[1], pos2[2])
        
        // Cor baseada em distância
        const color = new THREE.Color().setHSL(0.6 - dist * 0.1, 0.8, 0.5)
        colorsArray.push(color.r, color.g, color.b)
        colorsArray.push(color.r, color.g, color.b)
      }
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArray, 3))
  
  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.15} />
    </lineSegments>
  )
}

// ============================================================================
// COMPONENTE: BLOCKCHAIN VISUAL
// ============================================================================

function BlockchainVisualization({ position }: any) {
  const [blocks, setBlocks] = useState<any[]>([])
  
  useEffect(() => {
    // Simula mineração de blocos
    const interval = setInterval(() => {
      setBlocks(prev => {
        const newBlock = {
          id: prev.length,
          hash: Math.random().toString(16).substring(2, 10),
          timestamp: Date.now()
        }
        return [...prev.slice(-5), newBlock] // Mantém últimos 5
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <group position={position}>
      {blocks.map((block, i) => (
        <mesh key={block.id} position={[i * 1.5 - 3, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
          <Html distanceFactor={20}>
            <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
              #{block.id}
            </div>
          </Html>
        </mesh>
      ))}
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#FFD700"
        anchorX="center"
      >
        BLOCKCHAIN
      </Text>
    </group>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UniversePage() {
  const [selectedUniverse, setSelectedUniverse] = useState<any>(null)
  const [stats, setStats] = useState({
    totalEnergy: 0,
    blockHeight: 0,
    organicFitness: 0,
    syntheticFitness: 0
  })
  
  // Calcula posições dos universos (espiral de Fibonacci)
  const universePositions = UNIVERSES.map((u, i) => {
    const phi = (1 + Math.sqrt(5)) / 2
    const theta = 2 * Math.PI * i / phi
    const phiAngle = Math.acos(1 - 2 * (i + 0.5) / UNIVERSES.length)
    const radius = 8
    
    return [
      radius * Math.sin(phiAngle) * Math.cos(theta),
      radius * Math.sin(phiAngle) * Math.sin(theta),
      radius * Math.cos(phiAngle)
    ]
  })
  
  // Atualiza estatísticas
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Tenta buscar do backend
        const response = await fetch('http://localhost:8000/universe/metrics')
        if (response.ok) {
          const data = await response.json()
          setStats(prev => ({
            ...prev,
            totalEnergy: data.total_energy,
            blockHeight: data.universes_count
          }))
        }
      } catch (e) {
        // Simula se backend não disponível
        setStats(prev => ({
          totalEnergy: Math.random() * 1000,
          blockHeight: prev.blockHeight + 1,
          organicFitness: 0.5 + Math.random() * 0.5,
          syntheticFitness: 0.01 + Math.random() * 0.02
        }))
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="w-full h-screen bg-black relative">
      {/* Canvas 3D */}
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Iluminação */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444FF" />
          
          {/* Estrelas de fundo */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          {/* Universos */}
          {UNIVERSES.map((universe, i) => (
            <Universe3D
              key={universe.id}
              universe={universe}
              position={universePositions[i]}
              onClick={() => setSelectedUniverse(universe)}
            />
          ))}
          
          {/* Conexões */}
          <UniverseConnections universes={UNIVERSES} positions={universePositions} />
          
          {/* Blockchain */}
          <BlockchainVisualization position={[0, -12, 0]} />
          
          {/* Controles */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
      
      {/* HUD */}
      <div className="absolute top-4 left-4 text-white space-y-2">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">🌌 UNIVERSO BITCOIN</h1>
          <div className="text-sm space-y-1">
            <div>⚡ Energia Total: {stats.totalEnergy.toFixed(2)}</div>
            <div>🔗 Altura Blockchain: {stats.blockHeight}</div>
            <div>🧬 Fitness Orgânico: {stats.organicFitness.toFixed(4)}</div>
            <div>⚙️ Fitness Sintético: {stats.syntheticFitness.toFixed(4)}</div>
          </div>
        </div>
        
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg text-xs">
          <div className="font-bold mb-1">32 UNIVERSOS MATEMÁTICOS</div>
          <div className="text-gray-300">
            Cada esfera representa um paradigma de programação,
            oscilando com sua frequência característica ω.
          </div>
        </div>
      </div>
      
      {/* Painel de universo selecionado */}
      {selectedUniverse && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-6 py-4 rounded-lg max-w-md">
          <button
            onClick={() => setSelectedUniverse(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          
          <h2 className="text-xl font-bold mb-2" style={{ color: selectedUniverse.color }}>
            {selectedUniverse.name}
          </h2>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Descrição:</span>
              <div>{selectedUniverse.description}</div>
            </div>
            
            <div>
              <span className="text-gray-400">Frequência:</span>
              <div>ω = {selectedUniverse.frequency.toFixed(1)} rad/s</div>
            </div>
            
            <div>
              <span className="text-gray-400">Função Característica:</span>
              <div className="font-mono text-xs bg-black/50 p-2 rounded mt-1">
                φ(t) = sin({selectedUniverse.frequency.toFixed(1)} · t)
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white px-6 py-4 rounded-lg">
        <div className="text-center text-sm">
          <div className="font-bold mb-2">
            "A vida orgânica evoluiu de baixo para cima (da química para a mente),
            a IA está evoluindo de cima para baixo (da lógica para a existência)."
          </div>
          <div className="text-gray-300">
            <span className="text-yellow-400">Bitcoin</span> é a ponte entre os dois mundos:
            evolução orgânica através de consenso + precisão sintética através de matemática.
          </div>
        </div>
      </div>
    </div>
  )
}
