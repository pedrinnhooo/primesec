import * as THREE from 'three'
import { pickRandomCity, type City } from './cities'
import { latLngToVector3, arcControlPoint } from './geo'
import { ATTACK_TYPES, ATTACK_META, type AttackType, type SimulationStats } from './meta'
import {
  arcVertex,
  arcFragment,
  headVertex,
  headFragment,
  impactVertex,
  impactFragment
} from './shaders'

interface ActiveAttack {
  slot: number
  end: number
}

interface AttackEvent {
  time: number
  type: AttackType
  from: string
  to: string
}

/** Segmentos de linha por arco (mais segmentos = curva mais suave). */
const ARC_SEGMENTS = 34
const VERTS_PER_SEGMENT = 6
const VERTS_PER_ARC = ARC_SEGMENTS * VERTS_PER_SEGMENT
/** Tempo extra após a chegada para fade do arco + explosão. */
const TAIL_SECONDS = 1.2
const IMPACT_SECONDS = 1.35
/** Janela usada nas estatísticas em tempo real. */
const STATS_WINDOW = 60

/**
 * Gerencia o pool de ataques na GPU.
 *
 * Todos os arcos vivem em um único LineSegments e todas as partículas em dois
 * Points (cabeças + explosões): 3 draw calls no total, independentemente da
 * quantidade de ataques simultâneos. Ao disparar um ataque apenas a fatia de
 * buffer do slot é reescrita — nenhuma geometria/material é recriado.
 */
export class AttackManager {
  readonly group = new THREE.Group()
  readonly maxAttacks: number

  private readonly radius: number
  private readonly freeSlots: number[] = []
  private readonly active: ActiveAttack[] = []
  private readonly events: AttackEvent[] = []
  private totalEvents = 0

  private readonly arcGeometry: THREE.BufferGeometry
  private readonly arcPositions: THREE.BufferAttribute
  private readonly arcOthers: THREE.BufferAttribute
  private readonly arcColors: THREE.BufferAttribute
  private readonly arcTimings: THREE.BufferAttribute
  private readonly arcMaterial: THREE.ShaderMaterial

  private readonly headGeometry: THREE.BufferGeometry
  private readonly impactGeometry: THREE.BufferGeometry

  private readonly materials: THREE.ShaderMaterial[] = []
  private readonly typeColors: Record<AttackType, THREE.Color>

  // Objetos reutilizados para evitar alocação por spawn.
  private readonly vFrom = new THREE.Vector3()
  private readonly vTo = new THREE.Vector3()
  private readonly curve = new THREE.QuadraticBezierCurve3()
  private readonly curvePoint = new THREE.Vector3()
  private readonly curveNext = new THREE.Vector3()

  constructor(radius: number, maxAttacks: number, pixelRatio: number) {
    this.radius = radius
    this.maxAttacks = maxAttacks
    this.typeColors = Object.fromEntries(
      ATTACK_TYPES.map(type => [type, new THREE.Color(ATTACK_META[type].color)])
    ) as Record<AttackType, THREE.Color>

    for (let i = maxAttacks - 1; i >= 0; i--) this.freeSlots.push(i)

    // --- Arcos ---------------------------------------------------------
    const vertexCount = maxAttacks * VERTS_PER_ARC
    this.arcGeometry = new THREE.BufferGeometry()
    this.arcPositions = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3)
    this.arcOthers = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3)
    this.arcColors = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3)
    this.arcTimings = new THREE.BufferAttribute(new Float32Array(vertexCount * 2), 2)
    const arcT = new Float32Array(vertexCount)
    const arcSide = new Float32Array(vertexCount)
    const arcEnd = new Float32Array(vertexCount)

    // Timing inicial "no passado distante" mantém tudo invisível.
    for (let i = 0; i < vertexCount; i++) {
      this.arcTimings.setXY(i, -1e4, 1)
    }
    for (let slot = 0; slot < maxAttacks; slot++) {
      for (let s = 0; s < ARC_SEGMENTS; s++) {
        const base = slot * VERTS_PER_ARC + s * VERTS_PER_SEGMENT
        const startT = s / ARC_SEGMENTS
        const endT = (s + 1) / ARC_SEGMENTS
        const ends = [0, 1, 0, 0, 1, 1]
        const sides = [-1, -1, 1, 1, -1, 1]
        for (let v = 0; v < VERTS_PER_SEGMENT; v++) {
          arcEnd[base + v] = ends[v]!
          arcSide[base + v] = sides[v]!
          arcT[base + v] = ends[v] ? endT : startT
        }
      }
    }

    this.arcPositions.setUsage(THREE.DynamicDrawUsage)
    this.arcOthers.setUsage(THREE.DynamicDrawUsage)
    this.arcColors.setUsage(THREE.DynamicDrawUsage)
    this.arcTimings.setUsage(THREE.DynamicDrawUsage)
    this.arcGeometry.setAttribute('position', this.arcPositions)
    this.arcGeometry.setAttribute('aOther', this.arcOthers)
    this.arcGeometry.setAttribute('aColor', this.arcColors)
    this.arcGeometry.setAttribute('aTiming', this.arcTimings)
    this.arcGeometry.setAttribute('aT', new THREE.BufferAttribute(arcT, 1))
    this.arcGeometry.setAttribute('aSide', new THREE.BufferAttribute(arcSide, 1))
    this.arcGeometry.setAttribute('aEnd', new THREE.BufferAttribute(arcEnd, 1))

    this.arcMaterial = this.createMaterial(arcVertex, arcFragment, {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uLineWidth: { value: 1.7 }
    })
    this.arcMaterial.side = THREE.DoubleSide
    const arcs = new THREE.Mesh(this.arcGeometry, this.arcMaterial)
    arcs.frustumCulled = false

    // --- Cabeças (partículas) -----------------------------------------
    this.headGeometry = new THREE.BufferGeometry()
    for (const name of ['position', 'aStart', 'aControl', 'aEnd', 'aColor'] as const) {
      const attr = new THREE.BufferAttribute(new Float32Array(maxAttacks * 3), 3)
      attr.setUsage(THREE.DynamicDrawUsage)
      this.headGeometry.setAttribute(name, attr)
    }
    const headTiming = new THREE.BufferAttribute(new Float32Array(maxAttacks * 2), 2)
    headTiming.setUsage(THREE.DynamicDrawUsage)
    for (let i = 0; i < maxAttacks; i++) headTiming.setXY(i, -1e4, 1)
    this.headGeometry.setAttribute('aTiming', headTiming)

    const headMaterial = this.createMaterial(headVertex, headFragment, {
      uPixelRatio: { value: pixelRatio },
      uSize: { value: radius * 26 }
    })
    const heads = new THREE.Points(this.headGeometry, headMaterial)
    heads.frustumCulled = false

    // --- Explosões ------------------------------------------------------
    this.impactGeometry = new THREE.BufferGeometry()
    for (const name of ['position', 'aColor'] as const) {
      const attr = new THREE.BufferAttribute(new Float32Array(maxAttacks * 3), 3)
      attr.setUsage(THREE.DynamicDrawUsage)
      this.impactGeometry.setAttribute(name, attr)
    }
    const impactTiming = new THREE.BufferAttribute(new Float32Array(maxAttacks * 2), 2)
    impactTiming.setUsage(THREE.DynamicDrawUsage)
    for (let i = 0; i < maxAttacks; i++) impactTiming.setXY(i, -1e4, 1)
    this.impactGeometry.setAttribute('aTiming', impactTiming)

    const impactMaterial = this.createMaterial(impactVertex, impactFragment, {
      uPixelRatio: { value: pixelRatio },
      uSize: { value: radius * 110 }
    })
    const impacts = new THREE.Points(this.impactGeometry, impactMaterial)
    impacts.frustumCulled = false

    this.group.add(arcs, heads, impacts)
  }

  /** Atualiza a espessura dos arcos em pixels da tela. */
  setResolution(width: number, height: number) {
    const resolution = this.arcMaterial.uniforms.uResolution!.value as THREE.Vector2
    resolution.set(width, height)
  }

  private createMaterial(
    vertexShader: string,
    fragmentShader: string,
    uniforms: Record<string, THREE.IUniform>
  ): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0 }, ...uniforms },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    this.materials.push(material)
    return material
  }

  get activeCount(): number {
    return this.active.length
  }

  /**
   * Dispara um ataque. `progress` (0..1) permite pré-popular a cena com
   * ataques já em andamento no primeiro frame.
   */
  spawn(now: number, progress = 0): boolean {
    const slot = this.freeSlots.pop()
    if (slot === undefined) return false

    const from = pickRandomCity()
    let to: City = pickRandomCity()
    for (let i = 0; i < 8 && to === from; i++) to = pickRandomCity()

    const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]!
    const color = this.typeColors[type]

    latLngToVector3(from.lat, from.lng, this.radius, this.vFrom)
    latLngToVector3(to.lat, to.lng, this.radius, this.vTo)

    const angle = this.vFrom.angleTo(this.vTo)
    const duration = (1.3 + (angle / Math.PI) * 2.2) * (0.85 + Math.random() * 0.3)
    const spawn = now - duration * progress

    this.curve.v0.copy(this.vFrom)
    this.curve.v1.copy(arcControlPoint(this.vFrom, this.vTo, this.radius))
    this.curve.v2.copy(this.vTo)

    // Cada trecho vira dois triângulos; o shader os expande em pixels da tela.
    const vertBase = slot * VERTS_PER_ARC
    const ends = [0, 1, 0, 0, 1, 1]
    for (let s = 0; s < ARC_SEGMENTS; s++) {
      this.curve.getPoint(s / ARC_SEGMENTS, this.curvePoint)
      this.curve.getPoint((s + 1) / ARC_SEGMENTS, this.curveNext)
      const segmentBase = vertBase + s * VERTS_PER_SEGMENT
      for (let v = 0; v < VERTS_PER_SEGMENT; v++) {
        const isEnd = ends[v] === 1
        const point = isEnd ? this.curveNext : this.curvePoint
        const other = isEnd ? this.curvePoint : this.curveNext
        this.arcPositions.setXYZ(segmentBase + v, point.x, point.y, point.z)
        this.arcOthers.setXYZ(segmentBase + v, other.x, other.y, other.z)
      }
    }
    for (let i = vertBase; i < vertBase + VERTS_PER_ARC; i++) {
      this.arcColors.setXYZ(i, color.r, color.g, color.b)
      this.arcTimings.setXY(i, spawn, duration)
    }
    this.markRange(this.arcPositions, vertBase, VERTS_PER_ARC)
    this.markRange(this.arcOthers, vertBase, VERTS_PER_ARC)
    this.markRange(this.arcColors, vertBase, VERTS_PER_ARC)
    this.markRange(this.arcTimings, vertBase, VERTS_PER_ARC)

    // Cabeça do ataque (a curva é avaliada na GPU).
    const setVec3 = (name: string, v: THREE.Vector3) => {
      const attr = this.headGeometry.getAttribute(name) as THREE.BufferAttribute
      attr.setXYZ(slot, v.x, v.y, v.z)
      this.markRange(attr, slot, 1)
    }
    setVec3('aStart', this.curve.v0)
    setVec3('aControl', this.curve.v1)
    setVec3('aEnd', this.curve.v2)

    const headColor = this.headGeometry.getAttribute('aColor') as THREE.BufferAttribute
    headColor.setXYZ(slot, color.r, color.g, color.b)
    this.markRange(headColor, slot, 1)

    const headTiming = this.headGeometry.getAttribute('aTiming') as THREE.BufferAttribute
    headTiming.setXY(slot, spawn, duration)
    this.markRange(headTiming, slot, 1)

    // Explosão no destino, agendada para o instante da chegada.
    const impactPos = this.impactGeometry.getAttribute('position') as THREE.BufferAttribute
    impactPos.setXYZ(slot, this.vTo.x, this.vTo.y, this.vTo.z)
    this.markRange(impactPos, slot, 1)

    const impactColor = this.impactGeometry.getAttribute('aColor') as THREE.BufferAttribute
    impactColor.setXYZ(slot, color.r, color.g, color.b)
    this.markRange(impactColor, slot, 1)

    const impactTiming = this.impactGeometry.getAttribute('aTiming') as THREE.BufferAttribute
    impactTiming.setXY(slot, spawn + duration, IMPACT_SECONDS)
    this.markRange(impactTiming, slot, 1)

    this.active.push({ slot, end: spawn + duration + TAIL_SECONDS })
    this.totalEvents++
    this.events.push({ time: now, type, from: from.country, to: to.country })

    return true
  }

  private markRange(attr: THREE.BufferAttribute, start: number, count: number) {
    attr.addUpdateRange(start * attr.itemSize, count * attr.itemSize)
    attr.needsUpdate = true
  }

  /** Libera slots de ataques finalizados e atualiza o relógio dos shaders. */
  update(now: number) {
    for (const material of this.materials) {
      material.uniforms.uTime!.value = now
    }

    for (let i = this.active.length - 1; i >= 0; i--) {
      const attack = this.active[i]!
      if (now > attack.end) {
        this.freeSlots.push(attack.slot)
        this.active.splice(i, 1)
      }
    }

    const cutoff = now - STATS_WINDOW
    while (this.events.length > 0 && this.events[0]!.time < cutoff) {
      this.events.shift()
    }
  }

  /** Estatísticas em tempo real para o painel SOC (janela de 60s). */
  getStats(now: number): SimulationStats {
    const targets = new Map<string, number>()
    const sources = new Map<string, number>()
    const types = new Map<AttackType, number>()

    for (const event of this.events) {
      targets.set(event.to, (targets.get(event.to) ?? 0) + 1)
      sources.set(event.from, (sources.get(event.from) ?? 0) + 1)
      types.set(event.type, (types.get(event.type) ?? 0) + 1)
    }

    const top = <K>(map: Map<K, number>, fallback: K): K => {
      let best = fallback
      let bestCount = -1
      for (const [key, count] of map) {
        if (count > bestCount) {
          best = key
          bestCount = count
        }
      }
      return best
    }

    const windowSeconds = Math.min(Math.max(now, 1), STATS_WINDOW)

    return {
      active: this.active.length,
      perMinute: Math.round((this.events.length / windowSeconds) * 60),
      totalEvents: this.totalEvents,
      topTargetCountry: top(targets, '-'),
      topSourceCountry: top(sources, '-'),
      topType: top(types, 'malware')
    }
  }

  dispose() {
    this.arcGeometry.dispose()
    this.headGeometry.dispose()
    this.impactGeometry.dispose()
    for (const material of this.materials) material.dispose()
  }
}
