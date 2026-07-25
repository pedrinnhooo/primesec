import * as THREE from 'three'
import { mesh } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import { latLngToVector3 } from './geo'

/**
 * Carrega o TopoJSON local (Natural Earth 110m) e constrói uma geometria
 * única de LineSegments com as fronteiras dos países projetadas na esfera.
 */
export async function loadCountryLines(radius: number): Promise<THREE.BufferGeometry> {
  const response = await fetch('/data/countries-110m.json')
  const topology = (await response.json()) as Topology<{ countries: GeometryCollection }>

  const borders = mesh(topology, topology.objects.countries)

  const positions: number[] = []
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()

  for (const line of borders.coordinates) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lng1, lat1] = line[i]!
      const [lng2, lat2] = line[i + 1]!
      latLngToVector3(lat1!, lng1!, radius, a)
      latLngToVector3(lat2!, lng2!, radius, b)
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  return geometry
}
