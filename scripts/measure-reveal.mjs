// Mede o tempo até o site ser revelado (tela de carregamento sai) em rede e CPU
// simuladas, sobre o build de produção.
// Uso: node scripts/measure-reveal.mjs [url] [execuções]
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:3100/'
const runs = Number(process.argv[3] ?? 3)

/** ~4 Mbps de download com 120ms de RTT: 4G mediano. */
const NETWORK = {
  offline: false,
  downloadThroughput: (4 * 1024 * 1024) / 8,
  uploadThroughput: (1 * 1024 * 1024) / 8,
  latency: 120
}
const CPU_SLOWDOWN = 4

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const results = []

for (let run = 0; run < runs; run++) {
  const context = await browser.newContext({ viewport: { width: 1512, height: 900 } })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', NETWORK)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN })

  const bytes = { js: 0, css: 0, other: 0 }
  page.on('response', async (response) => {
    const length = Number(response.headers()['content-length'] ?? 0)
    const type = response.request().resourceType()
    if (type === 'script') bytes.js += length
    else if (type === 'stylesheet') bytes.css += length
    else bytes.other += length
  })

  const started = Date.now()
  await page.goto(url, { waitUntil: 'commit', timeout: 120_000 })
  const firstPaint = await page.evaluate(async () => {
    await new Promise(resolve => requestAnimationFrame(() => resolve()))
    return performance.now()
  })
  await page.locator('#globe-loader').waitFor({ state: 'detached', timeout: 120_000 })
  const revealed = Date.now() - started

  results.push({ revealed, firstPaint: Math.round(firstPaint), bytes })
  console.log(`run ${run + 1}: revelado em ${revealed}ms (1ª pintura ~${Math.round(firstPaint)}ms) js=${(bytes.js / 1024).toFixed(0)}KB css=${(bytes.css / 1024).toFixed(0)}KB outros=${(bytes.other / 1024).toFixed(0)}KB`)
  await context.close()
}

const median = results.map(r => r.revealed).sort((a, b) => a - b)[Math.floor(runs / 2)]
console.log(`\nmediana: ${median}ms até a revelação`)

await browser.close()
