/* global self, workbox */
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

  /* self.addEventListener('fetch', evt => {
    console.log(`Service worker fetch evt: ${evt.request.url}`, evt)
    if (evt.request.url.match(/page-1.html/)) {
      console.log(`This is a content page request`)
      evt.request.mode = 'cors'
      console.log(evt.request)
      if (evt.request.method !== 'GET') return
      return new Promise((resolve, reject) => {
        self.fetch(evt.request).then(response => {
          console.log(`Content page was fetched successfully`)
          response.body = 'hello'
          console.log(response)
          resolve(response)
        })
      })

      //      // Prevt the default, and handle the request ourselves.
      //      evt.respondWith(async function () {
      //        // Try to get the response from a cache.
      //         const cache = await self.caches.open('dynamic-v1')
      //        const cachedResponse = await cache.match(evt.request)
      //
      //        if (cachedResponse) {
      //          // If we found a match in the cache, return it, but also
      //          // update the entry in the cache in the background.
      //          evt.waitUntil(cache.add(evt.request))
      //          return cachedResponse
      //        }
      //
      //        // If we didn't find a match in the cache, use the network.
      //        self.fetch(evt.request).then(response => {
      //          console.log('Content page response received')
      //          console.log(response)
      //          return new Promise(resolve => {
      //            resolve(response)
      //          })
      //        })
      //      }())
    }
  }) */

  // Will it cause an error if overwrite current cache files as with Cache.addAll()?
  self.__precacheManifest = [].concat(self.__precacheManifest || [])
  workbox.precaching.precacheAndRoute(
    self.__precacheManifest
  )

  workbox.routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif)/,
    // Use the cache if it's available
    workbox.strategies.staleWhileRevalidate({
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
    /(?:https?:\/\/).*/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'external-resources-cache'
    })
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

if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(({usage, quota}) => {
    console.log(`Using ${usage} out of ${quota} bytes (${Math.round(usage / quota * 100)} %).`)
  }).catch(error => {
    console.error('Loading storage estimate failed:')
    console.log(error.stack)
  })
} else {
  console.error('navigator.storage.estimate API unavailable.')
}
