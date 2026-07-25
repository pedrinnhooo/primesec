import * as THREE from 'three'

/** Converte latitude/longitude em um ponto na superfície da esfera. */
export function latLngToVector3(lat: number, lng: number, radius: number, target = new THREE.Vector3()): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/**
 * Ponto de controle da curva quadrática entre origem e destino.
 * A altitude cresce com a distância angular para acompanhar a curvatura do planeta.
 */
export function arcControlPoint(from: THREE.Vector3, to: THREE.Vector3, radius: number): THREE.Vector3 {
  const angle = from.angleTo(to)
  const altitude = 0.28 + (angle / Math.PI) * 0.9

  return from.clone().add(to).normalize().multiplyScalar(radius * (1 + altitude))
}
