const { APPLICATION_CACHE_FILES, APPLICATION_CACHE_PREFIX, APPLICATION_CACHE_VERSION } = { /*%DATA%*/ };

const APPLICATION_CACHE_NAME = `${APPLICATION_CACHE_PREFIX}${APPLICATION_CACHE_VERSION}`;

//const __dirname = import.meta.url.substring(0, import.meta.url.lastIndexOf("/"));
const __dirname = `${location.href.substring(0, location.href.lastIndexOf("/"))}`;

const __dirname_path = `${new URL(__dirname).pathname}/`;

let application_cache = null;

/**
 * @returns {Promise<Cache>}
 */
async function getApplicationCache() {
    application_cache ??= await caches.open(APPLICATION_CACHE_NAME);

    return application_cache;
}

/**
 * @returns {Promise<void>}
 */
async function cacheApplicationFiles() {
    (await getApplicationCache()).addAll(APPLICATION_CACHE_FILES.map(request => `${__dirname}/${request}`));
}

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<void>}
 */
async function cacheApplicationResponse(request, response) {
    (await getApplicationCache()).put(request, response);
}

/**
 * @param {Request} request
 * @returns {Promise<Response | null>}
 */
async function getApplicationCacheResponse(request) {
    return await (await getApplicationCache()).match(request) ?? null;
}

/**
 * @returns {Promise<void>}
 */
async function deleteOldApplicationCaches() {
    await Promise.all((await caches.keys()).filter(key => key.startsWith(APPLICATION_CACHE_PREFIX) && key !== APPLICATION_CACHE_NAME).map(async key => caches.delete(key)));
}

/**
 * @returns {Promise<void>}
 */
async function activateEvent() {
    await clients.claim();

    await deleteOldApplicationCaches();
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function fetchEvent(request) {
    const url = new URL(request.url);

    if (url.origin !== location.origin || !url.pathname.startsWith(__dirname_path)) {
        return Response.error();
    }

    const path = url.pathname.substring(__dirname_path.length - 1);

    if (path.startsWith("/api/") || path === "/api") {
        return fetch(request);
    }

    const cache_response = await getApplicationCacheResponse(
        request
    );
    if (cache_response !== null) {
        return cache_response;
    }

    const response = await fetch(request);

    if (response.ok) {
        cacheApplicationResponse(
            request,
            response.clone()
        );
    }

    return response;
}

/**
 * @returns {Promise<void>}
 */
async function installEvent() {
    await cacheApplicationFiles();
}

/**
 * @param {*} data
 * @returns {Promise<void>}
 */
async function messageEvent(data) {
    if (data === "skipWaiting") {
        await skipWaiting();
    }
}

addEventListener("activate", e => {
    e.waitUntil(activateEvent());
});

addEventListener("fetch", e => {
    e.respondWith(fetchEvent(
        e.request
    ));
});

addEventListener("install", e => {
    e.waitUntil(installEvent());
});

addEventListener("message", e => {
    messageEvent(
        e.data
    );
});
