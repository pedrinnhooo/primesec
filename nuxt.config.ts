// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-security'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Germania One', provider: 'google', global: true, weights: [400] }
    ]
  },

  i18n: {
    locales: [
      { code: 'pt', language: 'pt-BR', name: 'Português', file: 'pt.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' }
    ],
    defaultLocale: 'pt',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'pt'
    },
    baseUrl: 'https://primesec.com.br'
  },

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
    // Conteúdo estático da home: vira arquivo no build, sem consulta por request.
    '/api/home': { prerender: true },
    '/data/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable'
      }
    },
    // Feed agregado (RSS PT-BR): limite apertado — cache de 2 min
    // já cobre a maior parte; isto evita spam de refresh manual.
    '/api/news': {
      security: {
        rateLimiter: {
          tokensPerInterval: 8,
          interval: 300_000,
          headers: true,
          throwError: true
        }
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
    // Serve .br/.gz pré-comprimidos: o JS/CSS do build cai a ~1/4 na rede
    // mesmo sem compressão na borda.
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },

    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/en',
        '/es',
        '/api/home'
      ]
    }
  },

  vite: {
    // three só entra no grafo quando o CyberGlobe monta.
    optimizeDeps: {
      exclude: [
        'three'
      ]
    },
    build: {
      rollupOptions: {
        output: {
          // Three.js fica em chunk próprio (só baixado junto com o globo).
          manualChunks(id) {
            if (id.includes('node_modules/three')) {
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