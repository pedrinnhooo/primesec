// Diagnóstico: abre a home no Chrome headless, coleta erros de console e
// tira um screenshot. Uso: node scripts/check-page.mjs [url]
import { chromium } from 'playwright-core'

const url = process.argv[2] ?? 'http://localhost:3000/'
const errors = []

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } })

page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
})
page.on('pageerror', (err) => {
  errors.push(`[pageerror] ${err.stack ?? err.message}`)
})

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(6000)

await page.screenshot({ path: '/tmp/globe-check.png' })

const title = await page.title()
const bodyText = (await page.innerText('body')).slice(0, 300)
console.log('title:', title)
console.log('body inicia com:', JSON.stringify(bodyText.slice(0, 120)))
console.log('erros capturados:', errors.length)
for (const e of errors) console.log('\n' + e)

await browser.close()
