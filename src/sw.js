/* global self, workbox, caches */
console.log('Service worker is activated')

const cacheName = 'static-cache'
const urlsToCache = [
  '.',
  'index.html'
]

console.log(`Service worker`, self)
self.addEventListener('install', event => {
  console.log(`Service worker install event`)
  /*event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log(`Adding files to cache`)
        return cache.addAll(urlsToCache)
      })
  )*/
})

if (workbox) {
  console.log(`workbox is loaded`)
  workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug)

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

  // Error handler
  workbox.routing.setCatchHandler(({url, event, params}) => {
    console.log(`Workbox routing failed:`, url, event, params)
  })
} else {
  console.log(`workbox failed to load`)
}
