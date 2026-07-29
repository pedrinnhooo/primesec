/**
 * Contagem 0% → N% antes da hidratação do Vue / parse do Three.js.
 * O GlobeLoader assume o valor em window.__primesecLoaderPercent ao montar.
 */
(function () {
  if (typeof window === 'undefined') return
  if (window.__primesecLoaderTakeover) return

  var STEP_MS = 55
  var CAP = 92
  var n = typeof window.__primesecLoaderPercent === 'number'
    ? window.__primesecLoaderPercent
    : 0

  window.__primesecLoaderPercent = n

  function paint() {
    var root = document.getElementById('globe-loader')
    if (!root) return false
    var label = root.querySelector('[data-loader-pct]')
    var fill = root.querySelector('[data-loader-fill]')
    if (label) label.textContent = n + '%'
    if (fill) fill.style.width = n + '%'
    return true
  }

  function step() {
    if (window.__primesecLoaderTakeover) return
    if (n >= CAP) return
    n += 1
    window.__primesecLoaderPercent = n
    paint()
    window.setTimeout(step, STEP_MS)
  }

  function boot(tries) {
    if (window.__primesecLoaderTakeover) return
    if (paint() || tries > 120) {
      window.setTimeout(step, STEP_MS)
      return
    }
    window.setTimeout(function () { boot(tries + 1) }, 50)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(0) })
  } else {
    boot(0)
  }
})()
