/**
 * Alumni Meridian & Orbital Constellation — 3D spatial centerpiece.
 *
 * Built as a composite multi-part 3D procedural sculpture:
 *  1. Inner faceted Meridian Core & Geodesic Golden Lattice Cage
 *  2. Three counter-rotating gyroscopic orbital rings (Gold, Emerald, Aqua)
 *  3. 64-node Fibonacci alumni constellation (InstancedMesh with zero-GC damping)
 *  4. Dynamic nearest-neighbour network pathways
 *  5. 6 orbital chapter beacon satellites gliding along the meridian tracks
 */
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'

export type ConstellationMode = 'orbit' | 'clusters' | 'mentorship'

export interface ConstellationSceneProps {
  mode?: ConstellationMode
  paused?: boolean
}

const NODE_COUNT = 64
const FIELD_RADIUS = 5.3
const LINK_DISTANCE = 3.1
const LINKS_PER_NODE = 3

// Pre-allocated module-scope helpers for zero GC inside useFrame
const _dummy = new THREE.Object3D()
const _posA = new THREE.Vector3()
const _posB = new THREE.Vector3()
const _color = new THREE.Color()

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

interface AlumniNode {
  orbitPos: THREE.Vector3
  clusterPos: THREE.Vector3
  mentorshipPos: THREE.Vector3
  currentPos: THREE.Vector3
  scale: number
  phase: number
  color: string
}

const CHAPTER_CENTERS = [
  new THREE.Vector3(-2.8, 1.4, 1.2), // Sukkur & Sindh Hub
  new THREE.Vector3(2.9, 1.3, 0.9),  // Karachi & Financial Hub
  new THREE.Vector3(-2.1, -1.7, 1.5), // Lahore & Punjab Hub
  new THREE.Vector3(2.3, -1.5, -1.2), // Islamabad & North Hub
  new THREE.Vector3(0.2, 2.5, -1.8),  // Gulf & Middle East Chapter
  new THREE.Vector3(0.0, -2.4, -1.5), // Europe & North America Chapter
]

/**
 * Distribute nodes across three spatial formations:
 *  - 'orbit': Fibonacci sphere shell around the meridian core
 *  - 'clusters': 6 regional chapter hubs
 *  - 'mentorship': Dual concentric inner-mentor / outer-mentee rings
 */
function buildNodes(count: number): AlumniNode[] {
  const random = mulberry32(20261021)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const nodes: AlumniNode[] = []

  for (let i = 0; i < count; i += 1) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = goldenAngle * i

    // 1. Global Orbit formation
    const radius = FIELD_RADIUS * (0.8 + random() * 0.32)
    const orbitPos = new THREE.Vector3(
      Math.cos(theta) * ringRadius * radius,
      y * radius * 0.82,
      Math.sin(theta) * ringRadius * radius,
    )

    // 2. Chapter Clusters formation
    const hub = CHAPTER_CENTERS[i % CHAPTER_CENTERS.length]
    const spread = 0.85 + random() * 0.75
    const clusterAngle = random() * Math.PI * 2
    const clusterElev = (random() - 0.5) * 1.4
    const clusterPos = new THREE.Vector3(
      hub.x + Math.cos(clusterAngle) * spread,
      hub.y + clusterElev,
      hub.z + Math.sin(clusterAngle) * spread,
    )

    // 3. Mentorship Web formation (inner mentor ring + outer cohort ring)
    const isMentor = i % 3 === 0
    const ringR = isMentor ? 2.45 : 4.85
    const ringTheta = (i / count) * Math.PI * 2 * (isMentor ? 1 : 2)
    const mentorshipPos = new THREE.Vector3(
      Math.cos(ringTheta) * ringR,
      (random() - 0.5) * (isMentor ? 1.2 : 2.6),
      Math.sin(ringTheta) * ringR,
    )

    const roll = random()
    const color =
      roll > 0.74
        ? '#F59E0B' // Burnished Amber Gold
        : roll > 0.42
          ? '#10B981' // Meridian Emerald
          : roll > 0.16
            ? '#2DD4BF' // Luminous Aqua
            : '#FAF8F5' // Warm Ivory

    nodes.push({
      orbitPos,
      clusterPos,
      mentorshipPos,
      currentPos: orbitPos.clone(),
      scale: isMentor ? 0.12 + random() * 0.06 : 0.065 + random() * 0.07,
      phase: random() * Math.PI * 2,
      color,
    })
  }

  return nodes
}

/** Connect each node to its nearest neighbours in the base orbital layout. */
function buildLinks(nodes: AlumniNode[]): [number, number][] {
  const links: [number, number][] = []

  for (let i = 0; i < nodes.length; i += 1) {
    const candidates: { index: number; distance: number }[] = []

    for (let j = i + 1; j < nodes.length; j += 1) {
      const distance = nodes[i].orbitPos.distanceTo(nodes[j].orbitPos)
      if (distance < LINK_DISTANCE) candidates.push({ index: j, distance })
    }

    candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, LINKS_PER_NODE)
      .forEach(({ index }) => links.push([i, index]))
  }

  return links
}

export function ConstellationScene({
  mode = 'orbit',
  paused = false,
}: ConstellationSceneProps) {
  const nodes = useMemo(() => buildNodes(NODE_COUNT), [])
  const links = useMemo(() => buildLinks(nodes), [nodes])

  const pointsRef = useRef<THREE.InstancedMesh>(null)
  const lineGeomRef = useRef<THREE.BufferGeometry>(null)
  const spinRef = useRef<THREE.Group>(null)
  const parallaxRef = useRef<THREE.Group>(null)
  const coreGroupRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const beaconsRef = useRef<THREE.Group>(null)

  /** Initial line-segment buffer. Updated smoothly in useFrame as nodes morph. */
  const linePositions = useMemo(() => {
    const buffer = new Float32Array(links.length * 6)
    links.forEach(([a, b], i) => {
      const from = nodes[a].orbitPos
      const to = nodes[b].orbitPos
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

  /** Initialize per-instance matrices and colors on mount. */
  useEffect(() => {
    const mesh = pointsRef.current
    if (!mesh) return

    nodes.forEach((node, index) => {
      _dummy.position.copy(node.currentPos)
      _dummy.scale.setScalar(node.scale)
      _dummy.updateMatrix()
      mesh.setMatrixAt(index, _dummy.matrix)
      mesh.setColorAt(index, _color.set(node.color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [nodes])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const elapsed = state.clock.elapsedTime
    const activeSpin = paused ? 0 : dt

    // 1. Smoothly rotate main constellation & counter-rotating gyroscopic rings
    if (spinRef.current) {
      spinRef.current.rotation.y += activeSpin * 0.11
    }
    if (coreGroupRef.current) {
      coreGroupRef.current.rotation.y -= activeSpin * 0.16
      coreGroupRef.current.rotation.z += activeSpin * 0.06
      const targetCoreScale = mode === 'clusters' ? 0.68 : mode === 'mentorship' ? 1.18 : 1.0
      const nextScale = THREE.MathUtils.damp(
        coreGroupRef.current.scale.x,
        targetCoreScale,
        4.5,
        dt,
      )
      coreGroupRef.current.scale.setScalar(nextScale)
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += activeSpin * 0.22
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= activeSpin * 0.18
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y += activeSpin * 0.14
    }

    // 2. Animate orbital chapter satellites along the meridian paths
    if (beaconsRef.current && !paused) {
      const children = beaconsRef.current.children
      for (let i = 0; i < children.length; i += 1) {
        const angle = elapsed * (0.35 + i * 0.05) + (i * Math.PI) / 3
        const r = 3.25 + (i % 2) * 0.95
        children[i].position.set(
          Math.cos(angle) * r,
          Math.sin(angle * 1.3) * 1.6,
          Math.sin(angle) * r,
        )
      }
    }

    // 3. Pointer parallax with silky exponential damping
    const pointer = state.pointer
    if (parallaxRef.current) {
      parallaxRef.current.rotation.y = THREE.MathUtils.damp(
        parallaxRef.current.rotation.y,
        THREE.MathUtils.clamp(pointer.x * 0.38, -0.42, 0.42),
        5,
        dt,
      )
      parallaxRef.current.rotation.x = THREE.MathUtils.damp(
        parallaxRef.current.rotation.x,
        THREE.MathUtils.clamp(-pointer.y * 0.24, -0.28, 0.28),
        5,
        dt,
      )
    }

    // 4. Damped node formation morphing + subtle harmonic breathing
    const mesh = pointsRef.current
    if (mesh) {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        const target =
          mode === 'clusters'
            ? node.clusterPos
            : mode === 'mentorship'
              ? node.mentorshipPos
              : node.orbitPos

        node.currentPos.x = THREE.MathUtils.damp(node.currentPos.x, target.x, 4.2, dt)
        node.currentPos.y = THREE.MathUtils.damp(node.currentPos.y, target.y, 4.2, dt)
        node.currentPos.z = THREE.MathUtils.damp(node.currentPos.z, target.z, 4.2, dt)

        const pulse = paused ? 1 : 1 + Math.sin(elapsed * 2.1 + node.phase) * 0.12
        _dummy.position.copy(node.currentPos)
        _dummy.scale.setScalar(node.scale * pulse)
        _dummy.updateMatrix()
        mesh.setMatrixAt(i, _dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }

    // 5. Keep constellation connecting lines synchronized with damped node positions
    const lineGeom = lineGeomRef.current
    if (lineGeom) {
      const posAttr = lineGeom.getAttribute('position') as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < links.length; i += 1) {
        const [a, b] = links[i]
        _posA.copy(nodes[a].currentPos)
        _posB.copy(nodes[b].currentPos)
        const offset = i * 6
        arr[offset] = _posA.x
        arr[offset + 1] = _posA.y
        arr[offset + 2] = _posA.z
        arr[offset + 3] = _posB.x
        arr[offset + 4] = _posB.y
        arr[offset + 5] = _posB.z
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <>
      {/* Balanced 3-point warm/cool studio lighting */}
      <hemisphereLight args={['#E6F4F1', '#091422', 0.65]} />
      <directionalLight position={[7, 6, 6]} intensity={1.35} color="#FDE68A" />
      <directionalLight position={[-7, -4, -5]} intensity={0.9} color="#2DD4BF" />
      <pointLight position={[0, 3, 4]} intensity={18} distance={28} color="#10B981" />

      <group ref={parallaxRef}>
        <group ref={spinRef}>
          {/* Part 1: Sculpted Meridian Core & Geodesic Golden Lattice */}
          <group ref={coreGroupRef}>
            {/* Inner faceted obsidian-emerald core */}
            <mesh>
              <icosahedronGeometry args={[1.45, 1]} />
              <meshStandardMaterial
                color="#0B2924"
                metalness={0.75}
                roughness={0.26}
                flatShading
              />
            </mesh>

            {/* Outer golden geodesic meridian wireframe cage */}
            <mesh>
              <icosahedronGeometry args={[1.72, 2]} />
              <meshBasicMaterial
                color="#F59E0B"
                wireframe
                transparent
                opacity={0.22}
              />
            </mesh>

            {/* Gyroscopic Orbital Ring 1 — Burnished Gold */}
            <mesh ref={ring1Ref} rotation={[Math.PI / 3.2, 0.4, 0]}>
              <torusGeometry args={[2.65, 0.018, 12, 96]} />
              <meshStandardMaterial
                color="#F59E0B"
                metalness={0.85}
                roughness={0.2}
                transparent
                opacity={0.65}
              />
            </mesh>

            {/* Gyroscopic Orbital Ring 2 — Meridian Emerald */}
            <mesh ref={ring2Ref} rotation={[-Math.PI / 2.6, -0.5, 0.3]}>
              <torusGeometry args={[3.45, 0.015, 12, 96]} />
              <meshStandardMaterial
                color="#10B981"
                metalness={0.8}
                roughness={0.25}
                transparent
                opacity={0.5}
              />
            </mesh>

            {/* Gyroscopic Orbital Ring 3 — Luminous Aqua */}
            <mesh ref={ring3Ref} rotation={[0.45, Math.PI / 4, -0.4]}>
              <torusGeometry args={[4.15, 0.012, 12, 96]} />
              <meshStandardMaterial
                color="#2DD4BF"
                metalness={0.8}
                roughness={0.25}
                transparent
                opacity={0.35}
              />
            </mesh>
          </group>

          {/* Part 2: Orbital Chapter Beacons */}
          <group ref={beaconsRef}>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <mesh key={idx} position={[3.2, 0, 0]}>
                <octahedronGeometry args={[0.14, 0]} />
                <meshBasicMaterial
                  color={idx % 2 === 0 ? '#FBBF24' : '#34D399'}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>

          {/* Part 3: Dynamic Constellation Link Pathways */}
          <lineSegments>
            <bufferGeometry ref={lineGeomRef}>
              <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              color="#2DD4BF"
              transparent
              opacity={0.24}
              depthWrite={false}
            />
          </lineSegments>

          {/* Part 4: 64-Node Fibonacci Alumni Network */}
          <instancedMesh
            ref={pointsRef}
            args={[undefined, undefined, nodes.length]}
            frustumCulled={false}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial toneMapped={false} />
          </instancedMesh>
        </group>
      </group>
    </>
  )
}
