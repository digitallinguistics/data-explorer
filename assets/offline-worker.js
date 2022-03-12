/* eslint-env serviceworker */

/**
 * This file caches assets offline so that they're quickly loaded on future page visits.
 * It uses a cache-first, then network strategy.
 */

const cacheName = `Oxalis`

// NOTE: Filenames in the asset list need to start with an initial slash
// in order to be matched correctly curing cleanupCache().
let assets = []

async function cacheAssets() {
  const response = await fetch(`cache.json`)
  assets         = await response.json()
  const cache    = await caches.open(cacheName)
  await cache.addAll(assets)
}

/**
 * Delete any files which don't belong in the cache.
 */
async function cleanupCache() {

  const cache = await caches.open(cacheName)
  const keys  = await cache.keys()

  for (const key of keys) {
    const { pathname } = new URL(key.url)
    if (!assets.includes(pathname)) await cache.delete(key)
  }

  self.skipWaiting()

}

async function resolveResponse(ev) {

  const { request } = ev

  if (request.method !== `GET`) return fetch(request)

  const cache          = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  // if the item is cached, asynchronously retrieve the latest version from the server and cache it
  if (cachedResponse) {

    fetch(request).then(networkResponse => {

      if (networkResponse && networkResponse.status === 200 && networkResponse.type === `basic`) {
        cache.put(request, networkResponse)
      }

    })

    return cachedResponse

  }

  // otherwise make the request on the network
  return fetch(request)

}

self.addEventListener(`install`, ev => ev.waitUntil(cacheAssets()))
self.addEventListener(`activate`, ev => ev.waitUntil(cleanupCache()))
self.addEventListener(`fetch`, ev => ev.respondWith(resolveResponse(ev)))
