// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    'nuxt-security'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Override em produção: NUXT_CONTACT_HMAC_SECRET
    contactHmacSecret: ''
  },

  content: {
    experimental: {
      // better-sqlite3 tolera melhor hot-restart do nuxt.config
      // (node:sqlite "native" trava com SQLITE_BUSY em restarts concorrentes).
      sqliteConnector: 'better-sqlite3'
    }
  },

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  // OWASP headers, CSP (nonce), rate limit, XSS validator, CORS.
  // Docs: https://nuxt-security.vercel.app/
  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https:', 'data:'],
        'connect-src': ["'self'", 'https:']
      },
      crossOriginEmbedderPolicy: 'credentialless',
      permissionsPolicy: {
        camera: [],
        'display-capture': [],
        fullscreen: ['self'],
        geolocation: [],
        microphone: []
      }
    },
    rateLimiter: {
      tokensPerInterval: 100,
      interval: 300_000,
      headers: true,
      throwError: true
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 100_000,
      maxUploadFileRequestInBytes: 100_000,
      throwError: true
    },
    xssValidator: {
      throwError: true
    },
    corsHandler: {
      methods: ['GET', 'HEAD', 'POST', 'OPTIONS']
    },
    allowedMethodsRestricter: {
      methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
      throwError: true
    },
    hidePoweredBy: true,
    nonce: true,
    sri: true,
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: false,
      nitroHeaders: true,
      exportToPresets: true
    }
  },

  // Landing estática: HTML pronto no build, sem renderizar a cada request.
  routeRules: {
    '/': { prerender: true },
    '/data/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    },
    '/api/contact': {
      security: {
        rateLimiter: {
          tokensPerInterval: 5,
          interval: 900_000,
          headers: true,
          throwError: true
        },
        requestSizeLimiter: {
          maxRequestSizeInBytes: 16_384,
          maxUploadFileRequestInBytes: 16_384,
          throwError: true
        }
      }
    },
    '/api/contact/**': {
      security: {
        rateLimiter: {
          tokensPerInterval: 20,
          interval: 300_000,
          headers: true,
          throwError: true
        }
      }
    }
  },

  // Payload no HTML da 1ª visita (sem request extra de _payload.json).
  experimental: {
    payloadExtraction: 'client',
    inlineRouteRules: true,
    defaults: {
      nuxtLink: {
        // Landing de página única: prefetch por interação em vez de viewport.
        prefetchOn: {
          interaction: true,
          visibility: false
        }
      }
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/'
      ]
    }
  },

  vite: {
    // three/topojson só entram no grafo quando o LazyCyberGlobe monta (~2s+).
    optimizeDeps: {
      exclude: [
        'three',
        'topojson-client'
      ]
    },
    build: {
      rollupOptions: {
        output: {
          // Three.js + topojson ficam em chunk próprio (só baixado com o globo).
          manualChunks(id) {
            if (id.includes('node_modules/three') || id.includes('topojson-client')) {
              return 'globe-three'
            }
          }
        }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})