/**
 * Alumni constellation — the single 3D experience in the product.
 *
 * Implemented with React Three Fiber only (no `@react-three/drei`): the
 * previous version pulled in OrbitControls from drei, which drags in
 * three-stdlib, camera-controls, maath, troika and more for a single control,
 * and was the only drei usage in the codebase.
 *
 * Interaction is a lightweight pointer parallax rather than a full orbit
 * controller, so the scene stays a decorative hero element and never traps
 * scroll or keyboard focus.
 */
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'

const NODE_COUNT = 44
const FIELD_RADIUS = 5.4
/** Distance under which two nodes are considered connected. */
const LINK_DISTANCE = 3.2
/** Keeps the edge count (and draw calls) bounded as the node count grows. */
const LINKS_PER_NODE = 3

/** Deterministic PRNG so the constellation is identical on every render/hydration. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Node {
  position: THREE.Vector3
  scale: number
  color: string
}

/**
 * Distribute nodes on a fibonacci sphere (even coverage, no clustering) and
 * colour them across the brand's indigo / violet / cyan palette.
 */
function buildNodes(count: number): Node[] {
  const random = mulberry32(20261021)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const nodes: Node[] = []

  for (let i = 0; i < count; i += 1) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = goldenAngle * i

    // Slight radial jitter keeps the sphere from reading as a perfect shell.
    const radius = FIELD_RADIUS * (0.82 + random() * 0.34)
    const position = new THREE.Vector3(
      Math.cos(theta) * ringRadius * radius,
      y * radius * 0.78,
      Math.sin(theta) * ringRadius * radius,
    )

    const roll = random()
    const color = roll > 0.72 ? '#22D3EE' : roll > 0.38 ? '#7C3AED' : '#818CF8'

    nodes.push({ position, scale: 0.075 + random() * 0.11, color })
  }

  return nodes
}

/** Connect each node to its few nearest neighbours — a bounded, readable network. */
function buildLinks(nodes: Node[]): [number, number][] {
  const links: [number, number][] = []

  for (let i = 0; i < nodes.length; i += 1) {
    const candidates: { index: number; distance: number }[] = []

    for (let j = i + 1; j < nodes.length; j += 1) {
      const distance = nodes[i].position.distanceTo(nodes[j].position)
      if (distance < LINK_DISTANCE) candidates.push({ index: j, distance })
    }

    candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, LINKS_PER_NODE)
      .forEach(({ index }) => links.push([i, index]))
  }

  return links
}

export function ConstellationScene() {
  const nodes = useMemo(() => buildNodes(NODE_COUNT), [])
  const links = useMemo(() => buildLinks(nodes), [nodes])

  const pointsRef = useRef<THREE.InstancedMesh>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const spinRef = useRef<THREE.Group>(null)
  const parallaxRef = useRef<THREE.Group>(null)

  /** Flatten links into a single line-segment buffer so it is one draw call. */
  const linePositions = useMemo(() => {
    const buffer = new Float32Array(links.length * 6)
    links.forEach(([a, b], i) => {
      const from = nodes[a].position
      const to = nodes[b].position
      const offset = i * 6
      buffer[offset] = from.x
      buffer[offset + 1] = from.y
      buffer[offset + 2] = from.z
      buffer[offset + 3] = to.x
      buffer[offset + 4] = to.y
      buffer[offset + 5] = to.z
    })
    return buffer
  }, [links, nodes])

  /** Write the per-instance matrices and colours once, on mount. */
  useEffect(() => {
    const mesh = pointsRef.current
    if (!mesh) return

    const transform = new THREE.Object3D()
    const color = new THREE.Color()

    nodes.forEach((node, index) => {
      transform.position.copy(node.position)
      transform.scale.setScalar(node.scale)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
      mesh.setColorAt(index, color.set(node.color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [nodes])

  useFrame((state, delta) => {
    // Slow, constant rotation reads as "alive" without competing for attention.
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.09

    // Pointer parallax — clamped so the scene never spins out of frame.
    const pointer = state.pointer
    if (parallaxRef.current) {
      parallaxRef.current.rotation.y = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.y,
        THREE.MathUtils.clamp(pointer.x * 0.3, -0.35, 0.35),
        0.05,
      )
      parallaxRef.current.rotation.x = THREE.MathUtils.lerp(
        parallaxRef.current.rotation.x,
        THREE.MathUtils.clamp(-pointer.y * 0.18, -0.22, 0.22),
        0.05,
      )
    }
  })

  return (
    <>
      {/* Restrained three-point lighting in the brand palette. */}
      <ambientLight intensity={0.55} color="#94A3FF" />
      <directionalLight position={[6, 4, 6]} intensity={1.05} color="#818CF8" />
      <directionalLight position={[-6, -3, -4]} intensity={0.7} color="#22D3EE" />
      <pointLight position={[0, 5, -7]} intensity={30} distance={40} color="#A78BFA" />

      <group ref={parallaxRef}>
        <group ref={spinRef}>
          <lineSegments ref={linesRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#818CF8" transparent opacity={0.22} depthWrite={false} />
          </lineSegments>

          <instancedMesh
            ref={pointsRef}
            args={[null!, null!, nodes.length]}
            frustumCulled={false}
          >
            <sphereGeometry args={[1, 14, 14]} />
            {/* Unlit + tone mapping off keeps the nodes reading as glowing points. */}
            <meshBasicMaterial toneMapped={false} />
          </instancedMesh>
        </group>
      </group>
    </>
  )
}
