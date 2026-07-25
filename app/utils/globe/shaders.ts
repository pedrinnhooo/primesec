/**
 * Shaders GLSL do globo. Todos os materiais usam blending aditivo para
 * simular bloom/glow sem pós-processamento, mantendo o fundo transparente
 * e o custo de render baixo (um draw call por camada).
 */

/** Atmosfera: fresnel no lado interno de uma esfera levemente maior. */
export const atmosphereVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`

export const atmosphereFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.4);
  vec3 color = mix(uColorA, uColorB, fresnel);
  gl_FragColor = vec4(color, fresnel * uIntensity);
}
`

/**
 * Arcos de ataque: ribbons formados por triângulos para permitir espessura
 * consistente em pixels, inclusive em navegadores que limitam linhas WebGL.
 * Cada vértice conhece sua posição relativa no arco (aT) e o timing do
 * ataque; a "cabeça" e o trail luminoso são calculados a partir de uTime.
 */
export const arcVertex = /* glsl */ `
attribute float aT;
attribute vec3 aColor;
attribute vec2 aTiming; // x: spawn (s), y: duração do trajeto (s)
attribute vec3 aOther;
attribute float aSide;
attribute float aEnd;

uniform float uTime;
uniform vec2 uResolution;
uniform float uLineWidth;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = aColor;

  float elapsed = uTime - aTiming.x;
  float progress = elapsed / max(aTiming.y, 0.0001);
  float head = clamp(progress, 0.0, 1.0);

  // Trecho ainda não percorrido fica invisível (linha "cresce" da origem).
  float drawn = step(aT, head);

  // Trail luminoso: brilho decai exponencialmente atrás da cabeça.
  float trail = exp(-(head - aT) * 5.5);
  float alpha = drawn * (0.10 + trail * 0.9);

  // Fade out após a chegada ao destino.
  float fadeOut = 1.0 - clamp((progress - 1.0) / 0.6, 0.0, 1.0);
  alpha *= fadeOut;

  // Ataques ainda não disparados.
  alpha *= step(0.0, elapsed);

  vAlpha = alpha;

  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 otherClip = projectionMatrix * modelViewMatrix * vec4(aOther, 1.0);
  vec2 currentNdc = clip.xy / clip.w;
  vec2 otherNdc = otherClip.xy / otherClip.w;

  // Mantém a direção igual nas duas pontas para formar um ribbon sem torção.
  vec2 direction = aEnd > 0.5
    ? currentNdc - otherNdc
    : otherNdc - currentNdc;
  direction = normalize(direction * uResolution);
  vec2 normal = vec2(-direction.y, direction.x);
  vec2 offset = normal * (uLineWidth / uResolution) * clip.w;
  clip.xy += offset * aSide;

  gl_Position = clip;
}
`

export const arcFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  if (vAlpha <= 0.003) discard;
  gl_FragColor = vec4(vColor * (0.75 + vAlpha), vAlpha);
}
`

/**
 * Partícula na cabeça do arco: a posição é resolvida na GPU avaliando a
 * curva de Bézier quadrática (origem, controle, destino) em função do tempo.
 */
export const headVertex = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aControl;
attribute vec3 aEnd;
attribute vec3 aColor;
attribute vec2 aTiming;

uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

varying vec3 vColor;
varying float vAlpha;

vec3 bezier(vec3 a, vec3 c, vec3 b, float t) {
  float it = 1.0 - t;
  return it * it * a + 2.0 * it * t * c + t * t * b;
}

void main() {
  vColor = aColor;

  float elapsed = uTime - aTiming.x;
  float progress = elapsed / max(aTiming.y, 0.0001);
  float t = clamp(progress, 0.0, 1.0);

  vec3 pos = bezier(aStart, aControl, aEnd, t);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // Visível apenas durante o trajeto (some rápido ao virar explosão).
  float alive = step(0.0, elapsed) * (1.0 - clamp((progress - 1.0) / 0.12, 0.0, 1.0));
  vAlpha = alive;

  float pulse = 0.85 + 0.15 * sin(uTime * 14.0 + aTiming.x * 7.0);
  gl_PointSize = uSize * pulse * uPixelRatio * alive / max(-mvPosition.z, 0.1);
  gl_Position = projectionMatrix * mvPosition;
}
`

export const headFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  if (vAlpha <= 0.01) discard;
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float glow = pow(max(1.0 - d, 0.0), 2.0);
  float core = pow(max(1.0 - d, 0.0), 6.0);
  vec3 color = vColor * glow + vec3(1.0) * core * 0.9;
  gl_FragColor = vec4(color, glow * vAlpha);
}
`

/** Explosão luminosa ao atingir o destino: flash, anéis e brilho residual. */
export const impactVertex = /* glsl */ `
attribute vec3 aColor;
attribute vec2 aTiming; // x: instante do impacto (s), y: duração da explosão (s)

uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

varying vec3 vColor;
varying float vProgress;

void main() {
  vColor = aColor;

  float elapsed = uTime - aTiming.x;
  float progress = elapsed / max(aTiming.y, 0.0001);
  vProgress = progress;

  float alive = step(0.0, elapsed) * step(progress, 1.0);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Cresce rápido no impacto e depois expande com suavidade.
  float ease = 1.0 - pow(1.0 - clamp(progress, 0.0, 1.0), 2.2);
  float scale = 0.28 + ease * 1.15;
  gl_PointSize = uSize * scale * uPixelRatio * alive / max(-mvPosition.z, 0.1);
  gl_Position = projectionMatrix * mvPosition;
}
`

export const impactFragment = /* glsl */ `
varying vec3 vColor;
varying float vProgress;

void main() {
  if (vProgress < 0.0 || vProgress > 1.0) discard;

  float d = length(gl_PointCoord - 0.5) * 2.0;
  float fade = 1.0 - vProgress;
  float ease = 1.0 - pow(fade, 1.6);

  // Anel principal em expansão.
  float ringRadius = mix(0.08, 0.92, ease);
  float ring = smoothstep(0.16, 0.0, abs(d - ringRadius));
  ring *= smoothstep(1.0, 0.55, d);

  // Segundo anel mais fino, um pouco atrasado.
  float ring2Radius = mix(0.02, 0.72, clamp((vProgress - 0.08) / 0.92, 0.0, 1.0));
  float ring2 = smoothstep(0.10, 0.0, abs(d - ring2Radius)) * 0.7;

  // Flash central intenso no momento da queda.
  float flash = pow(max(1.0 - d, 0.0), 2.4) * pow(fade, 2.4) * 2.2;

  // Halo residual no solo (marca o país/cidade atingido).
  float ground = pow(max(1.0 - d * 1.15, 0.0), 1.8) * pow(fade, 0.85) * 0.55;

  float alpha = (ring * 1.05 + ring2 * 0.85 + flash + ground) * fade;
  if (alpha <= 0.01) discard;

  vec3 hot = mix(vColor, vec3(1.0), flash * 0.65);
  vec3 color = hot + vColor * ground * 0.8;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`

/** Pontos de cidades: dots com glow suave e cintilação discreta. */
export const cityVertex = /* glsl */ `
attribute float aSeed;

uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

varying float vTwinkle;

void main() {
  vTwinkle = 0.6 + 0.4 * sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 40.0);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (0.7 + aSeed * 0.6) * uPixelRatio / max(-mvPosition.z, 0.1);
  gl_Position = projectionMatrix * mvPosition;
}
`

export const cityFragment = /* glsl */ `
uniform vec3 uColor;
varying float vTwinkle;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float glow = pow(max(1.0 - d, 0.0), 3.0);
  float alpha = glow * vTwinkle;
  if (alpha <= 0.02) discard;
  gl_FragColor = vec4(uColor * (0.6 + vTwinkle * 0.5), alpha);
}
`

/** Estrelas de fundo com cintilação. */
export const starVertex = /* glsl */ `
attribute float aSeed;

uniform float uTime;
uniform float uPixelRatio;

varying float vTwinkle;

void main() {
  vTwinkle = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * (0.3 + aSeed) + aSeed * 100.0), 2.0);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (0.8 + aSeed * 1.8) * uPixelRatio;
  gl_Position = projectionMatrix * mvPosition;
}
`

export const starFragment = /* glsl */ `
uniform vec3 uColor;
varying float vTwinkle;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float alpha = pow(max(1.0 - d, 0.0), 2.0) * vTwinkle * 0.8;
  if (alpha <= 0.02) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`
