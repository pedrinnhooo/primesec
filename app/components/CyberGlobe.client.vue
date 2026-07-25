<script setup lang="ts">
/**
 * Globo 3D de monitoramento de ameaças (inspirado em mapas de ataques SOC).
 *
 * Renderiza com Three.js sobre fundo transparente: esfera escura, fronteiras
 * de países em linhas finas, cidades luminosas, estrelas, atmosfera fresnel e
 * uma simulação contínua de ataques cibernéticos (arcos + partículas +
 * explosões) gerenciada pelo AttackManager em 3 draw calls.
 *
 * A montagem é dividida em etapas que reportam `progress`. O evento `ready` só
 * dispara quando a cena está inteira na tela — fronteiras desenhadas, ataques
 * em pleno voo e shaders já compilados — para que a tela de carregamento nunca
 * revele o globo sendo montado aos poucos.
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { AttackManager } from '~/utils/globe/attacks'
import { CITIES } from '~/utils/globe/cities'
import { loadCountryLines } from '~/utils/globe/countries'
import { latLngToVector3 } from '~/utils/globe/geo'
import {
  atmosphereVertex,
  atmosphereFragment,
  cityVertex,
  cityFragment,
  starVertex,
  starFragment
} from '~/utils/globe/shaders'

const RADIUS = 1
const AUTO_ROTATE_SPEED = 0.35
const IDLE_RESUME_MS = 2500
/** Vista inicial: Atlântico no centro (Américas à esquerda, África/Europa à direita). */
const INITIAL_LAT = 12
const INITIAL_LNG = -28
const INITIAL_CAMERA_DISTANCE = 3.35
/**
 * O relógio da simulação começa adiantado: os ataques pré-populados já contam
 * como histórico, então o painel SOC nasce com números plausíveis em vez de
 * uma taxa por minuto inflada pelo primeiro segundo.
 */
const WARM_SECONDS = 20
/** Frames renderizados antes de revelar, para nada aparecer "em construção". */
const WARM_FRAMES = 2

const emit = defineEmits<{
  ready: []
  progress: [value: number]
}>()

const container = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const stats = useAttackSimulation()

let cleanup: (() => void) | undefined
let disposed = false

/**
 * Devolve o controle ao navegador entre etapas: garante que a tela de
 * carregamento continue animando enquanto a cena é construída.
 */
function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => setTimeout(resolve, 0))
  })
}

/** Textura radial usada na neblina espacial atrás do globo. */
function createGlowTexture(): THREE.Texture {
  const size = 256
  const el = document.createElement('canvas')
  el.width = el.height = size
  const ctx = el.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(163, 230, 53, 0.55)')
  gradient.addColorStop(0.35, 'rgba(74, 222, 128, 0.18)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(el)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

async function build() {
  // Em componentes .client.vue o template só é renderizado após o mount do
  // wrapper client-only do Nuxt: os refs ficam disponíveis no próximo tick.
  await nextTick()

  const host = container.value
  const dom = canvas.value
  if (!host || !dom) return

  const isSmallScreen = window.matchMedia('(max-width: 640px)').matches
  const maxAttacks = isSmallScreen ? 48 : 100
  const minActive = isSmallScreen ? 18 : 36
  const pixelRatio = Math.min(window.devicePixelRatio, isSmallScreen ? 1.25 : 1.75)
  const sphereSegs = isSmallScreen ? 32 : 48
  const starCount = isSmallScreen ? 480 : 900

  // As fronteiras são o maior download da cena: começa antes de qualquer
  // trabalho de GPU para viajar em paralelo com a montagem.
  const countryGeometry = loadCountryLines(RADIUS * 1.004)
  countryGeometry.catch(() => { /* globo continua funcional sem as fronteiras */ })

  // --- Renderer / cena / câmera ----------------------------------------
  const renderer = new THREE.WebGLRenderer({
    canvas: dom,
    antialias: !isSmallScreen,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  // Elevação leve para enquadrar o hemisfério norte sem cortar o globo.
  camera.position.set(0, 0.38, INITIAL_CAMERA_DISTANCE)
  emit('progress', 0.15)

  // --- Luzes ------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0x9db89d, 0.55))
  const keyLight = new THREE.DirectionalLight(0xeaffdf, 1.6)
  keyLight.position.set(2.5, 2, 2.5)
  scene.add(keyLight)

  // --- Globo ------------------------------------------------------------
  const globe = new THREE.Group()
  // Orienta o Atlântico para a câmera no primeiro frame (antes do autoRotate).
  const initialFacing = latLngToVector3(INITIAL_LAT, INITIAL_LNG, 1)
  globe.rotation.y = -Math.atan2(initialFacing.x, initialFacing.z)
  scene.add(globe)

  const sphereGeometry = new THREE.SphereGeometry(RADIUS * 0.996, sphereSegs, sphereSegs)
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x050505,
    emissive: 0x030a04,
    specular: 0x0c120c,
    shininess: 10
  })
  globe.add(new THREE.Mesh(sphereGeometry, sphereMaterial))

  const atmosphereGeometry = new THREE.SphereGeometry(RADIUS * 1.16, sphereSegs, sphereSegs)
  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: {
      uColorA: { value: new THREE.Color('#0c2a1a') },
      uColorB: { value: new THREE.Color('#2adba0') },
      uIntensity: { value: 0.5 }
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  globe.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial))

  // --- Cidades ------------------------------------------------------------
  const cityGeometry = new THREE.BufferGeometry()
  const cityPositions = new Float32Array(CITIES.length * 3)
  const citySeeds = new Float32Array(CITIES.length)
  const cityPoint = new THREE.Vector3()
  CITIES.forEach((city, i) => {
    latLngToVector3(city.lat, city.lng, RADIUS * 1.004, cityPoint)
    cityPositions.set([cityPoint.x, cityPoint.y, cityPoint.z], i * 3)
    citySeeds[i] = Math.random()
  })
  cityGeometry.setAttribute('position', new THREE.BufferAttribute(cityPositions, 3))
  cityGeometry.setAttribute('aSeed', new THREE.BufferAttribute(citySeeds, 1))
  const cityMaterial = new THREE.ShaderMaterial({
    vertexShader: cityVertex,
    fragmentShader: cityFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: 11 },
      uColor: { value: new THREE.Color('#a3e635') }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  globe.add(new THREE.Points(cityGeometry, cityMaterial))

  // --- Estrelas + neblina espacial ---------------------------------------
  const starGeometry = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starSeeds = new Float32Array(starCount)
  const starDir = new THREE.Vector3()
  for (let i = 0; i < starCount; i++) {
    starDir.randomDirection().multiplyScalar(22 + Math.random() * 26)
    starPositions.set([starDir.x, starDir.y, starDir.z], i * 3)
    starSeeds[i] = Math.random()
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeometry.setAttribute('aSeed', new THREE.BufferAttribute(starSeeds, 1))
  const starMaterial = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uColor: { value: new THREE.Color('#d8ecd2') }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const stars = new THREE.Points(starGeometry, starMaterial)
  stars.frustumCulled = false
  scene.add(stars)

  const glowTexture = createGlowTexture()
  const nebulaMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const nebula = new THREE.Sprite(nebulaMaterial)
  nebula.position.set(0, 0, -2)
  nebula.scale.setScalar(11)
  scene.add(nebula)
  emit('progress', 0.35)
  await yieldToPaint()
  if (disposed) return

  // --- Fronteiras dos países -----------------------------------------------
  // Mantidas um pouco acima da esfera e dos ataques para preservar o contorno
  // dos países mesmo nas regiões mais escuras do globo.
  const countryMaterial = new THREE.LineBasicMaterial({
    color: 0x9fcb82,
    transparent: true,
    opacity: isSmallScreen ? 0.9 : 0.78,
    depthWrite: false
  })
  let countryLines: THREE.LineSegments | undefined
  const geometry = await countryGeometry.catch(() => undefined)
  if (disposed) return
  if (geometry) {
    countryLines = new THREE.LineSegments(geometry, countryMaterial)
    countryLines.renderOrder = 2
    globe.add(countryLines)
  }
  emit('progress', 0.6)
  await yieldToPaint()
  if (disposed) return

  // --- Simulação de ataques -----------------------------------------------
  const attacks = new AttackManager(RADIUS * 1.002, maxAttacks, pixelRatio)
  globe.add(attacks.group)
  attacks.setResolution(host.clientWidth || 1, host.clientHeight || 1)

  // Pool completo já em voo: no primeiro frame visível o globo aparece com a
  // malha de ataques inteira, em vez de preenchê-la ao longo dos segundos.
  for (let i = 0; i < minActive; i++) {
    attacks.spawn(WARM_SECONDS, Math.random())
  }
  stats.value = attacks.getStats(WARM_SECONDS)
  emit('progress', 0.75)
  await yieldToPaint()
  if (disposed) return

  // --- Interação -----------------------------------------------------------
  const controls = new OrbitControls(camera, dom)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.rotateSpeed = 0.45
  controls.enablePan = false
  // Zoom por scroll desabilitado para não sequestrar a rolagem da página;
  // o zoom suave acontece via limites de distância no toque/drag.
  controls.enableZoom = false
  controls.minDistance = 2
  controls.maxDistance = 5
  controls.minPolarAngle = Math.PI * 0.2
  controls.maxPolarAngle = Math.PI * 0.8
  controls.autoRotate = true
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED
  // Permite rolagem vertical da página em dispositivos touch.
  dom.style.touchAction = 'pan-y'

  let rotateTarget = AUTO_ROTATE_SPEED
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  controls.addEventListener('start', () => {
    clearTimeout(idleTimer)
    rotateTarget = 0
  })
  controls.addEventListener('end', () => {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      rotateTarget = AUTO_ROTATE_SPEED
    }, IDLE_RESUME_MS)
  })

  // --- Redimensionamento / visibilidade --------------------------------------
  let inView = true
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host
    if (!w || !h) return
    renderer.setSize(w, h, false)
    attacks.setResolution(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)

  // Pausa o render quando o globo sai da viewport.
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true
  }, { threshold: 0 })
  intersectionObserver.observe(host)

  // Compila todos os programas antes do primeiro frame: sem isso o primeiro
  // render engasga enquanto a GPU monta os shaders de arco, cidade e atmosfera.
  await renderer.compileAsync(scene, camera).catch(() => { /* segue sem pré-compilar */ })
  if (disposed) return
  emit('progress', 0.92)

  // --- Loop de animação -----------------------------------------------------
  let lastFrameAt = performance.now()
  let elapsed = WARM_SECONDS
  let nextSpawnAt = WARM_SECONDS
  let nextStatsAt = WARM_SECONDS
  let rafId = 0
  let frames = 0

  const frame = () => {
    rafId = requestAnimationFrame(frame)
    const now = performance.now()
    // Teto no delta: uma aba em segundo plano não deve avançar a simulação de golpe.
    const delta = Math.min((now - lastFrameAt) / 1000, 0.1)
    lastFrameAt = now
    if (!inView || document.hidden) return
    elapsed += delta

    // Retorno gradual à rotação automática após o usuário soltar o globo.
    controls.autoRotateSpeed += (rotateTarget - controls.autoRotateSpeed) * Math.min(delta * 2, 1)
    controls.update()

    // Geração contínua: intervalos aleatórios (100–600ms) + reforço em rajada
    // sempre que a quantidade de ataques ativos cai abaixo do mínimo.
    if (elapsed >= nextSpawnAt) {
      attacks.spawn(elapsed)
      nextSpawnAt = elapsed + 0.1 + Math.random() * 0.5
    }
    if (attacks.activeCount < minActive) {
      // No máximo 1 spawn extra por frame para evitar hitch no boot.
      attacks.spawn(elapsed)
    }

    attacks.update(elapsed)
    cityMaterial.uniforms.uTime!.value = elapsed
    starMaterial.uniforms.uTime!.value = elapsed

    if (elapsed >= nextStatsAt) {
      stats.value = attacks.getStats(elapsed)
      nextStatsAt = elapsed + 1
    }

    renderer.render(scene, camera)

    frames++
    if (frames === WARM_FRAMES) {
      emit('progress', 1)
      emit('ready')
    }
  }

  cleanup = () => {
    cancelAnimationFrame(rafId)
    clearTimeout(idleTimer)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    controls.dispose()
    attacks.dispose()
    countryLines?.geometry.dispose()
    countryMaterial.dispose()
    sphereGeometry.dispose()
    sphereMaterial.dispose()
    atmosphereGeometry.dispose()
    atmosphereMaterial.dispose()
    cityGeometry.dispose()
    cityMaterial.dispose()
    starGeometry.dispose()
    starMaterial.dispose()
    nebulaMaterial.dispose()
    glowTexture.dispose()
    renderer.dispose()
  }

  frame()
}

onMounted(() => {
  build().catch(() => {
    // Sem WebGL (ou com contexto recusado) o site não pode ficar preso na
    // tela de carregamento: libera a revelação e deixa o placeholder CSS.
    emit('progress', 1)
    emit('ready')
  })
})

onBeforeUnmount(() => {
  disposed = true
  cleanup?.()
})
</script>

<template>
  <div
    ref="container"
    class="overflow-hidden"
  >
    <canvas
      ref="canvas"
      class="block size-full cursor-grab active:cursor-grabbing"
    />
  </div>
</template>
