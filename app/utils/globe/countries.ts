import * as THREE from 'three'
import { latLngToVector3 } from './geo'

/** Fronteiras pré-computadas por scripts/build-country-lines.mjs. */
export const COUNTRY_LINES_URL = '/data/country-lines.bin'

/** "PSGB" lido como uint32 little-endian. */
const MAGIC = 0x42_47_53_50
const HEADER_BYTES = 16

/**
 * Decodifica o binário de fronteiras em uma geometria indexada de LineSegments.
 *
 * O arquivo guarda polilinhas de lat/lng quantizadas em int16 com delta entre
 * pontos vizinhos, então aqui só há soma e trigonometria: nenhum JSON.parse e
 * nenhuma dependência de topojson no navegador.
 */
export function buildCountryLines(buffer: ArrayBuffer, radius: number): THREE.BufferGeometry {
  const header = new DataView(buffer)
  if (header.getUint32(0, true) !== MAGIC) {
    throw new Error('country-lines.bin: formato inesperado')
  }

  const scale = header.getUint16(6, true)
  const stripCount = header.getUint32(8, true)
  const pointCount = header.getUint32(12, true)

  const stripLengths = new Uint16Array(buffer, HEADER_BYTES, stripCount)
  const deltas = new Int16Array(buffer, HEADER_BYTES + stripCount * 2, pointCount * 2)

  // Geometria indexada: cada ponto entra uma única vez e os segmentos apenas
  // referenciam vértices vizinhos (metade da memória de GPU do formato expandido).
  const positions = new Float32Array(pointCount * 3)
  const segmentCount = pointCount - stripCount
  const indices = pointCount > 65_535
    ? new Uint32Array(segmentCount * 2)
    : new Uint16Array(segmentCount * 2)

  const point = new THREE.Vector3()
  let cursor = 0
  let vertex = 0
  let index = 0

  for (let strip = 0; strip < stripCount; strip++) {
    const length = stripLengths[strip]!
    let lng = 0
    let lat = 0

    for (let i = 0; i < length; i++) {
      lng += deltas[cursor++]!
      lat += deltas[cursor++]!
      latLngToVector3(lat / scale, lng / scale, radius, point)
      positions[vertex * 3] = point.x
      positions[vertex * 3 + 1] = point.y
      positions[vertex * 3 + 2] = point.z

      if (i > 0) {
        indices[index++] = vertex - 1
        indices[index++] = vertex
      }
      vertex++
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))

  return geometry
}

/** Busca e decodifica as fronteiras projetadas em uma esfera de raio `radius`. */
export async function loadCountryLines(radius: number): Promise<THREE.BufferGeometry> {
  const response = await fetch(COUNTRY_LINES_URL)
  if (!response.ok) {
    throw new Error(`country-lines.bin: HTTP ${response.status}`)
  }

  return buildCountryLines(await response.arrayBuffer(), radius)
}
