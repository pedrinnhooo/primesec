// Pré-computa as fronteiras dos países no formato binário consumido pelo globo.
//
// Entrada:  scripts/data/countries-110m.json (Natural Earth 110m, TopoJSON)
// Saída:    public/data/country-lines.bin
//
// O navegador recebe apenas coordenadas quantizadas: nada de JSON.parse de
// ~105 KB nem topojson-client no bundle do cliente.
//
// Uso: node scripts/build-country-lines.mjs
import { readFile, writeFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { mesh } from 'topojson-client'

/** Unidades de quantização por grau: erro máximo de ~0.008° (≈0.9 km). */
const SCALE = 64
const MAGIC = 'PSGB'
const VERSION = 1
const HEADER_BYTES = 16

const source = new URL('./data/countries-110m.json', import.meta.url)
const target = new URL('../public/data/country-lines.bin', import.meta.url)

const topology = JSON.parse(await readFile(source, 'utf8'))
const strips = mesh(topology, topology.objects.countries).coordinates
const pointCount = strips.reduce((total, strip) => total + strip.length, 0)

const header = Buffer.alloc(HEADER_BYTES + strips.length * 2)
header.write(MAGIC, 0, 'ascii')
header.writeUInt16LE(VERSION, 4)
header.writeUInt16LE(SCALE, 6)
header.writeUInt32LE(strips.length, 8)
header.writeUInt32LE(pointCount, 12)
strips.forEach((strip, i) => header.writeUInt16LE(strip.length, HEADER_BYTES + i * 2))

// Delta dentro de cada polilinha: pontos vizinhos ficam a poucas unidades de
// distância, o que rende ~35% a mais de compressão no gzip do que valores absolutos.
const coords = new Int16Array(pointCount * 2)
let cursor = 0
for (const strip of strips) {
  let previousLng = 0
  let previousLat = 0
  for (const [lng, lat] of strip) {
    const quantizedLng = Math.round(lng * SCALE)
    const quantizedLat = Math.round(lat * SCALE)
    const deltaLng = quantizedLng - previousLng
    const deltaLat = quantizedLat - previousLat
    // Com SCALE ≤ 90 todo delta cabe em int16; acima disso o decoder truncaria.
    if (Math.abs(deltaLng) > 32767 || Math.abs(deltaLat) > 32767) {
      throw new Error(`SCALE=${SCALE} gera delta fora do int16 — reduza a escala`)
    }
    coords[cursor++] = deltaLng
    coords[cursor++] = deltaLat
    previousLng = quantizedLng
    previousLat = quantizedLat
  }
}

const output = Buffer.concat([header, Buffer.from(coords.buffer)])
await writeFile(target, output)

const before = (await readFile(source)).length
console.log(`fronteiras: ${strips.length} polilinhas, ${pointCount} pontos`)
console.log(`topojson:   ${before} bytes (${gzipSync(await readFile(source)).length} gzip)`)
console.log(`binário:    ${output.length} bytes (${gzipSync(output).length} gzip)`)
