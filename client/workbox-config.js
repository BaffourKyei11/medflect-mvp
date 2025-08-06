module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}'
  ],
  swDest: 'build/sw.js',
  swSrc: 'src/sw.js',
  
  // Runtime caching
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.medflect\.ai\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200]
        },
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.groq\.com\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'groq-api-cache',
        networkTimeoutSeconds: 5,
        cacheableResponse: {
          statuses: [0, 200]
        },
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    }
  ],
  
  // Skip waiting and clients claim
  skipWaiting: true,
  clientsClaim: true,
  
  // Clean up old caches
  cleanupOutdatedCaches: true,
  
  // Source maps
  sourcemap: false,
  
  // Maximum file size to cache
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  
  // Ignore patterns
  globIgnores: [
    '**/node_modules/**/*',
    '**/sw.js',
    '**/workbox-*.js',
    '**/manifest.json'
  ]
}; 