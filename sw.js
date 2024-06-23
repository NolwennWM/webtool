"use strict";
const 
    /** Name of the current cache */
    currentCache = "nwm-v1.1",
    /** List of the caches name to not delete */
    cachesToKeep = [currentCache],
    /** Files to cache on page loading */
    filesToAddInCache = [
    "/", "/index.html",
    "/assets/",
    "/assets/styles/",
    "/assets/styles/config.css",
    "/assets/styles/style.css",
    "/assets/styles/toolMenu.css",
    "/assets/scripts/",
    "/assets/scripts/index.js",
];

self.addEventListener("install", handleInstallEvent);
self.addEventListener("fetch",handleFetchEvent);
self.addEventListener("activate", handleActivateEvent);

/**
 * Actions to do during install of service worker
 * Currently add elements in cache.
 * @param {ExtendableEvent} event Install event
 */
function handleInstallEvent(event)
{
    event.waitUntil(addToCache(filesToAddInCache));
}
/**
 * Action to do during each fetch
 * @param {FetchEvent} event fetch event
 */
function handleFetchEvent(event)
{
    const requestOptions = {
        request: event.request,
        preloadResponsePromise: event.preloadResponse
    };
    event.respondWith(searchInCache(requestOptions));
}
/**
 * Action to do during service worker activation
 * @param {ExtendableEvent} event activate event
 */
function handleActivateEvent(event)
{
    event.waitUntil(enableNavigationPreload());
    event.waitUntil(deleteOldCaches());
}
/**
 * Put files in cache
 * @param {string[]|[Request, Response]} ressources list of url to put in cache
 */
async function addToCache(ressources)
{
    const cache = await caches.open(currentCache);
    if(ressources[0] instanceof Request && ressources[1] instanceof Response)
    {
        await cache.put(...ressources);
        return;
    }
    await cache.addAll(ressources);
}
/**
 * Search if the file is available in cache, 
 * Otherwise fetch it,
 * then return it or return an error message
 * @param {{request: Request, preloadResponsePromise: Promise<Response>}} param0 Request and preload objects
 * @returns {Response} response to send to the navigator
 */
async function searchInCache({ request, preloadResponsePromise })
{
    const cacheResponse = await caches.match(request);
    if(cacheResponse) return cacheResponse;

    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info("using preload response", preloadResponse);
        addToCache([request, preloadResponse.clone()]);
        return preloadResponse;
    }
    try
    {
        const networkResponse = await fetch(request);
        addToCache([request, networkResponse.clone()]);
        return networkResponse;
    }catch(error)
    {
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
    }
}
/**
 * Enable navigation preload if available
 */
async function enableNavigationPreload()
{
    if (!self.registration.navigationPreload)return;
    await self.registration.navigationPreload.enable();
}
/**
 * Delete old cache unused
 */
async function deleteOldCaches()
{
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter(filterCacheToKeep);
    await Promise.all(cachesToDelete.map(deleteCache));
}
/**
 * check if the key in parameter is in the list of caches to keep.
 * @param {string} key name of a cache
 * @returns {boolean} true if the key have to be deleted
 */
function filterCacheToKeep(key)
{
    return !cachesToKeep.includes(key);
}
/**
 * Delete cache with the name in the parameter.
 * @param {string} key Name of the cache to delete
 */
async function deleteCache(key)
{
    await caches.delete(key);
}