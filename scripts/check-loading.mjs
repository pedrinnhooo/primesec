// Diagnóstico da tela de carregamento: captura o overlay em ação, mede quanto
// tempo ele leva para sair e confere a home já revelada.
// Uso: node scripts/check-loading.mjs [url]
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:3000/'
const errors = []

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } })

page.on('console', msg => msg.type() === 'error' && errors.push(`[console.error] ${msg.text()}`))
page.on('pageerror', err => errors.push(`[pageerror] ${err.stack ?? err.message}`))

const started = Date.now()
await page.goto(url, { waitUntil: 'commit', timeout: 60_000 })

// Cronometra em paralelo: o loop de amostragem pode passar do momento.
// Duas marcas distintas: quando o site começa a aparecer (início do crossfade)
// e quando o overlay sai do DOM (fim do crossfade).
let fadeAt = 0
let detachedAt = 0
let fadePercent = '?'

const fading = page.waitForFunction(() => {
  const el = document.querySelector('#globe-loader')
  if (!el) return 'gone'
  const opacity = Number(getComputedStyle(el).opacity)
  if (opacity >= 0.95) return false
  return el.querySelector('span.tabular-nums')?.textContent?.trim() ?? '?'
}, null, { timeout: 60_000, polling: 16 }).then(async (handle) => {
  fadeAt = Date.now() - started
  fadePercent = String(await handle.jsonValue())
})

const detached = page.locator('#globe-loader')
  .waitFor({ state: 'detached', timeout: 60_000 })
  .then(() => {
    detachedAt = Date.now() - started
  })

const shots = []
for (const at of [200, 400, 1200, 2200]) {
  await page.waitForTimeout(Math.max(at - (Date.now() - started), 0))
  const loader = page.locator('#globe-loader')
  const visible = await loader.count().then(n => n > 0)
  const opacity = visible ? await loader.evaluate(el => getComputedStyle(el).opacity) : '0'
  const slot = visible
    ? await loader.locator('.primesec-marquee').evaluate((el) => {
        const shift = new DOMMatrixReadOnly(getComputedStyle(el).transform).f
        const step = el.getBoundingClientRect().height / el.children.length
        return el.children[Math.round(-shift / step)]?.textContent?.trim() ?? '?'
      }).catch(() => '?')
    : '(removido)'
  const percent = visible ? await loader.locator('span.tabular-nums').innerText() : ''
  await page.screenshot({ path: `/tmp/loading-${at}.png` })
  shots.push(`${String(at).padStart(4)}ms  no ar=${visible}  opacidade=${Number(opacity).toFixed(2)}  ${slot}  ${percent}`)
}

await fading
await detached
await page.waitForTimeout(2500)
await page.screenshot({ path: '/tmp/loading-revealed.png' })

const readHero = () => page.evaluate(() => {
  const nodes = [...document.querySelectorAll('.primesec-enter')]
  if (!nodes.length) return 'sem-elemento'
  return nodes.map(el => getComputedStyle(el).opacity).join(' ')
})

const overflow = await page.evaluate(() => document.documentElement.className)
const heroOpacity = await readHero()

// A tela de carregamento é da primeira pintura: navegar e voltar não repete.
await page.click('a[href="/blog"]')
await page.waitForURL('**/blog')
await page.goBack()
await page.waitForTimeout(2500)
const loaderOnReturn = await page.locator('#globe-loader').count()
const heroOnReturn = await readHero()
await page.screenshot({ path: '/tmp/loading-voltou.png' })

console.log(shots.join('\n'))
console.log(`\nsite começa a aparecer em ${fadeAt}ms (barra ${fadePercent}); overlay sai do DOM em ${detachedAt}ms`)
console.log(`html class após revelar: "${overflow}"`)
console.log(`opacidade dos .primesec-enter: ${heroOpacity} (esperado 1)`)
console.log(`loader ao voltar de /blog: ${loaderOnReturn} (esperado 0)`)
console.log(`opacidade ao voltar:         ${heroOnReturn} (esperado 1)`)
console.log(`erros: ${errors.length}`)
for (const e of errors) console.log('\n' + e)

await browser.close()
