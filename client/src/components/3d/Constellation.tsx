import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'

const nodeCount = 40
const minRadius = 3
const maxRadius = 8

export interface Constellation3DProps {
  className?: string
}

export function Constellation3D({ className }: Constellation3DProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    // Gentle rotation of the entire constellation
    let animationId: number

    function animate() {
      // Pass rotation state to nodes via shared state
      ;(animationId) = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [reducedMotion])

  return (
    <Canvas
      camera={{ position: [0, 0, 16], fov: 40 }}
      style={{ width: '100%', height: '400px', background: '#10152F' }}
      className={className}
    >
      <ambientLight intensity={0.4} color="#1a1f3e" />
      <directionalLight
        position={[4, 4, 4]}
        intensity={0.6}
        color="#4338CA"
      />
      <directionalLight
        position={[-4, -4, -4]}
        intensity={0.4}
        color="#22D3EE"
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
      />

      {reducedMotion && (
        <mesh>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#10152F" />
        </mesh>
      )}

      {Array.from({ length: nodeCount }).map((_, i) => {
        const theta = (i / nodeCount) * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const radius = minRadius + Math.random() * (maxRadius - minRadius)
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)

        const glowIntensity = 0.3 + Math.random() * 0.4
        const nodeColor = Math.random() > 0.7
          ? '#7C3AED'
          : '#4338CA'

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.3 + Math.random() * 0.3]} />
            <meshStandardMaterial
              color={nodeColor}
              emissive={nodeColor}
              emissiveIntensity={glowIntensity}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {reducedMotion ? null : (
        <>{/* Lines are rendered in 3D, not reduced motion fallback */}</>
      )}
    </Canvas>
  )
}