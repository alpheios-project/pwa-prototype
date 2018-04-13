/* global self, workbox, caches */
const ver = '12' // A temporary solution to test service worker updates
console.log('Service worker is registered')

self.addEventListener('install', event => {
  console.log(`Service worker install event`)
})

self.addEventListener('activate', event => {
  console.log(`Service worker activate event`)
})

// This code runs whenever a Service Worker script is loaded, and Workbox library is loaded too
if (workbox) {
  console.log(`workbox is active`)
  workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug)

  // Will it cause an error if overwrite current cache files as with Cache.addAll()?
  self.__precacheManifest = [].concat(self.__precacheManifest || [])
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

  workbox.routing.registerRoute(
    // Cache JS files
    /.*\.html/,
    workbox.strategies.networkFirst()
  )

  workbox.routing.registerRoute(
    // Cache JSON files
    /.*\.json/,
    workbox.strategies.networkFirst()
  )

  workbox.routing.registerRoute(
    // Cache JS files
    /.*\.js/,
    workbox.strategies.networkFirst()
  )

  workbox.routing.registerRoute(
    // Cache CSS files
    /.*\.css/,
    // Use cache but update in the background ASAP
    workbox.strategies.staleWhileRevalidate({
      // Use a custom cache name
      cacheName: 'css-cache'
    })
  )

  workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
      // Use a custom cache name
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.Plugin({
          // Cache only 20 images
          maxEntries: 20,
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60
        })
      ]
    })
  )

  // External resources
  workbox.routing.registerRoute(
    /https:\/\/grammars.alpheios.net\/bennett/,
    workbox.strategies.networkFirst()
  )

  // Error handler
  workbox.routing.setCatchHandler(({url, event, params}) => {
    console.log(`Workbox routing failed:`, url, event, params)
  })
} else {
  console.log(`workbox failed to load`)
}

self.addEventListener('message', (event) => {
  if (!event.data) {
    return
  }

  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting()
      break
    default:
      // NOOP
      break
  }
})
