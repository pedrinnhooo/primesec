<script setup lang="ts">
/**
 * Campo galáctico leve (Canvas 2D).
 *
 * - `green`: névoa verde suave + attacks (Blog/Contato)
 * - `mono`: só espaço preto + estrelas (Home, atrás do globo)
 *
 * Otimizado p/ main thread: sem shadowBlur, DPR baixo, ~30fps,
 * pausa fora da viewport / aba oculta (alinhado às práticas Nuxt
 * de deferir trabalho não-crítico).
 */
import { ATTACK_TYPES, ATTACK_META, type AttackType } from '~/utils/globe/meta'

const props = withDefaults(defineProps<{
  /** Paleta: verde suave (páginas) ou só preto + estrelas (Home). */
  palette?: 'green' | 'mono'
  /** Quantidade de arcos. Ignorado em `mono`. */
  density?: 'low' | 'medium'
  /** Liga/desliga arcos de ataque. */
  attacks?: boolean
}>(), {
  palette: 'green',
  density: 'low',
  attacks: undefined
})

const showAttacks = computed(() =>
  props.attacks ?? props.palette === 'green'
)

const canvas = ref<HTMLCanvasElement>()

interface Star {
  x: number
  y: number
  r: number
  phase: number
  speed: number
  alpha: number
}

interface Nebula {
  x: number
  y: number
  rx: number
  ry: number
  color: string
  alpha: number
  drift: number
  phase: number
}

interface Attack {
  type: AttackType
  x0: number
  y0: number
  x1: number
  y1: number
  cx: number
  cy: number
  born: number
  duration: number
  width: number
}

const DENSITY = {
  low: { max: 5, min: 2, spawnMs: 1400 },
  medium: { max: 8, min: 3, spawnMs: 900 }
} as const

const FRAME_MS = 1000 / 30

let raf = 0
let resizeObserver: ResizeObserver | undefined
let visibilityObserver: IntersectionObserver | undefined
let onVisibility: (() => void) | undefined

onMounted(() => {
  const el = canvas.value
  if (!el) return

  const ctx = el.getContext('2d', { alpha: true, desynchronized: true })
  if (!ctx) return

  const isSmall = window.matchMedia('(max-width: 640px)').matches
  const dprCap = isSmall ? 1 : 1.25
  const config = DENSITY[props.density]
  // Mesma densidade de estrelas em Home / Blog / Contato (independente da paleta).
  const starCount = isSmall ? 320 : 560
  const nebulaCount = props.palette === 'green' ? (isSmall ? 2 : 3) : 0
  const attackSegments = 10

  let w = 0
  let h = 0
  let stars: Star[] = []
  let nebulas: Nebula[] = []
  let attacks: Attack[] = []
  let lastSpawn = 0
  let lastPaint = 0
  let inView = true
  let pageVisible = !document.hidden
  const start = performance.now()

  // Verde bem mais suave que a 1ª versão.
  const NEBULA_COLORS = [
    'rgba(163, 230, 53,',
    'rgba(74, 222, 128,',
    'rgba(42, 219, 160,'
  ]

  function resize() {
    const parent = el.parentElement
    if (!parent) return
    w = parent.clientWidth
    h = parent.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    el.width = Math.max(1, Math.floor(w * dpr))
    el.height = Math.max(1, Math.floor(h * dpr))
    el.style.width = `${w}px`
    el.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    seedField()
  }

  function seedField() {
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.3 + Math.random() * (props.palette === 'mono' ? 1.6 : 1.35),
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * (props.palette === 'mono' ? 1.4 : 0.9),
      alpha: props.palette === 'mono'
        ? 0.25 + Math.random() * 0.7
        : 0.2 + Math.random() * 0.5
    }))

    nebulas = Array.from({ length: nebulaCount }, (_, i) => ({
      x: (0.18 + Math.random() * 0.64) * w,
      y: (0.1 + Math.random() * 0.48) * h,
      // Elipses maiores = glow mais espalhado e fluido.
      rx: w * (0.28 + Math.random() * 0.28),
      ry: h * (0.22 + Math.random() * 0.24),
      color: NEBULA_COLORS[i % NEBULA_COLORS.length]!,
      alpha: 0.028 + Math.random() * 0.028,
      drift: 5 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2
    }))

    attacks = []
    lastSpawn = 0
    if (showAttacks.value) {
      for (let i = 0; i < config.min; i++) {
        attacks.push(makeAttack(-Math.random() * 2.2))
      }
    }
  }

  function makeAttack(born: number): Attack {
    const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]!
    const fromLeft = Math.random() > 0.5
    const x0 = fromLeft ? -0.05 * w : w * 1.05
    const x1 = fromLeft ? w * (0.55 + Math.random() * 0.5) : w * (-0.05 + Math.random() * 0.5)
    const y0 = h * (0.1 + Math.random() * 0.65)
    const y1 = h * (0.1 + Math.random() * 0.65)
    const midX = (x0 + x1) * 0.5
    const midY = (y0 + y1) * 0.5
    const lift = (Math.random() > 0.5 ? 1 : -1) * h * (0.08 + Math.random() * 0.16)

    return {
      type,
      x0,
      y0,
      x1,
      y1,
      cx: midX + (Math.random() - 0.5) * w * 0.12,
      cy: midY + lift,
      born,
      duration: 2.4 + Math.random() * 2.2,
      width: 1 + Math.random() * 1.1
    }
  }

  function bezier(t: number, a: number, c: number, b: number) {
    const it = 1 - t
    return it * it * a + 2 * it * t * c + t * t * b
  }

  function hexToRgba(hex: string, alpha: number) {
    const raw = hex.replace('#', '')
    const n = Number.parseInt(raw, 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
  }

  function drawNebulas(t: number) {
    for (const n of nebulas) {
      const ox = Math.sin(t * 0.06 + n.phase) * n.drift
      const oy = Math.cos(t * 0.05 + n.phase) * n.drift * 0.55

      // Gradiente elíptico sem clip duro: scale + círculo, fade longo até 0.
      ctx.save()
      ctx.translate(n.x + ox, n.y + oy)
      ctx.scale(1, Math.max(0.2, n.ry / n.rx))
      const radius = n.rx
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
      g.addColorStop(0, `${n.color}${n.alpha})`)
      g.addColorStop(0.22, `${n.color}${n.alpha * 0.62})`)
      g.addColorStop(0.48, `${n.color}${n.alpha * 0.28})`)
      g.addColorStop(0.72, `${n.color}${n.alpha * 0.1})`)
      g.addColorStop(0.9, `${n.color}${n.alpha * 0.025})`)
      g.addColorStop(1, `${n.color}0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function drawStars(t: number) {
    const color = props.palette === 'mono'
      ? '220, 225, 230'
      : '216, 236, 210'
    // Mono: twinkle mais marcado (quase apaga → brilha) com a mesma curva senoidal.
    const twinkleFloor = props.palette === 'mono' ? 0.15 : 0.4
    const twinkleRange = props.palette === 'mono' ? 0.85 : 0.6

    for (const s of stars) {
      const twinkle = twinkleFloor + twinkleRange * Math.pow(0.5 + 0.5 * Math.sin(t * s.speed + s.phase), 2)
      ctx.fillStyle = `rgba(${color}, ${s.alpha * twinkle})`
      ctx.fillRect(s.x, s.y, s.r, s.r)
    }
  }

  function drawAttacks(t: number) {
    const still: Attack[] = []
    ctx.lineCap = 'round'

    for (const attack of attacks) {
      const elapsed = t - attack.born
      const progress = elapsed / attack.duration
      if (progress > 1.3) continue
      still.push(attack)

      const head = Math.min(Math.max(progress, 0), 1)
      const color = ATTACK_META[attack.type].color
      const fadeOut = progress > 1 ? 1 - (progress - 1) / 0.3 : 1
      if (fadeOut <= 0) continue

      const trailStart = Math.max(0, head - 0.4)

      ctx.beginPath()
      for (let i = 0; i <= attackSegments; i++) {
        const tt = trailStart + (head - trailStart) * (i / attackSegments)
        const x = bezier(tt, attack.x0, attack.cx, attack.x1)
        const y = bezier(tt, attack.y0, attack.cy, attack.y1)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = hexToRgba(color, 0.55 * fadeOut)
      ctx.lineWidth = attack.width
      ctx.stroke()

      if (head > 0 && head < 1.02) {
        const hx = bezier(head, attack.x0, attack.cx, attack.x1)
        const hy = bezier(head, attack.y0, attack.cy, attack.y1)
        const headAlpha = (head < 1 ? 1 : fadeOut) * 0.85
        ctx.fillStyle = hexToRgba(color, headAlpha)
        ctx.beginPath()
        ctx.arc(hx, hy, 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(255, 255, 255, ${headAlpha * 0.7})`
        ctx.beginPath()
        ctx.arc(hx, hy, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }

      if (progress >= 1 && progress <= 1.3) {
        const p = (progress - 1) / 0.3
        ctx.strokeStyle = hexToRgba(color, (1 - p) * 0.5)
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(attack.x1, attack.y1, 3 + p * 16, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    attacks = still
  }

  function paint(now: number) {
    if (!inView || !pageVisible) {
      raf = requestAnimationFrame(paint)
      return
    }

    if (now - lastPaint < FRAME_MS) {
      raf = requestAnimationFrame(paint)
      return
    }
    lastPaint = now

    const t = (now - start) / 1000
    ctx.clearRect(0, 0, w, h)

    if (props.palette === 'green') {
      const veil = ctx.createRadialGradient(w * 0.5, h * 0.32, 0, w * 0.5, h * 0.32, Math.max(w, h) * 0.7)
      veil.addColorStop(0, 'rgba(8, 12, 8, 0.28)')
      veil.addColorStop(0.5, 'rgba(4, 6, 4, 0.12)')
      veil.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = veil
      ctx.fillRect(0, 0, w, h)
      drawNebulas(t)
    }

    drawStars(t)

    if (showAttacks.value) {
      drawAttacks(t)
      if (t - lastSpawn > config.spawnMs / 1000 && attacks.length < config.max) {
        attacks.push(makeAttack(t))
        lastSpawn = t
      }
      while (attacks.length < config.min) {
        attacks.push(makeAttack(t - Math.random() * 0.8))
      }
    }

    raf = requestAnimationFrame(paint)
  }

  onVisibility = () => {
    pageVisible = !document.hidden
  }

  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(el.parentElement!)

  visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry?.isIntersecting ?? true
    },
    { rootMargin: '80px' }
  )
  visibilityObserver.observe(el)

  document.addEventListener('visibilitychange', onVisibility)
  raf = requestAnimationFrame(paint)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none absolute inset-0 block size-full"
    aria-hidden="true"
  />
</template>
