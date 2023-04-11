const { APPLICATION_CACHE_FILES, APPLICATION_CACHE_PREFIX, APPLICATION_CACHE_VERSION, SKIP_WAITING } = { /*%DATA%*/ };

const APPLICATION_CACHE_NAME = `${APPLICATION_CACHE_PREFIX}${APPLICATION_CACHE_VERSION}`;

//const service_worker_path = import.meta.url.substring(0, import.meta.url.lastIndexOf("/"));
const service_worker_path = `${location.href.substring(0, location.href.lastIndexOf("/"))}`;

const _service_worker_path = `${new URL(service_worker_path).pathname}`;
const __service_worker_path = _service_worker_path !== "/" ? `${_service_worker_path}/` : "/";

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
    (await getApplicationCache()).addAll(APPLICATION_CACHE_FILES.map(request => `${service_worker_path}/${request}`));
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
 * @param {string} path
 * @returns {Promise<Response>}
 */
async function fetchEventAsync(request, path) {
    if (path.startsWith("/api/") || path === "/api") {
        return fetch(request);
    }

    const cache_response = await getApplicationCacheResponse(
        request
    );

    if (cache_response !== null) {
        return cache_response;
    }

    return fetch(request);
}

/**
 * @param {FetchEvent} e
 * @returns {void}
 */
function fetchEvent(e) {
    const url = new URL(e.request.url);

    if (url.origin !== location.origin || !url.pathname.startsWith(__service_worker_path)) {
        e.respondWith(Response.error());
        return;
    }

    const path = url.pathname.substring(__service_worker_path.length - 1);

    if (path.startsWith("/api/") || path === "/api") {
        return;
    }

    e.respondWith(fetchEventAsync(
        e.request,
        path
    ));
}

/**
 * @returns {Promise<void>}
 */
async function installEvent() {
    await cacheApplicationFiles();
}

/**
 * @param {ExtendableMessageEvent} e
 * @returns {Promise<void>}
 */
async function messageEvent(e) {
    if (e.origin !== location.origin) {
        return;
    }

    if ((e.data ?? null) === null || typeof e.data !== "object") {
        return;
    }

    switch (e.data.type) {
        case SKIP_WAITING:
            await skipWaiting();
            break;

        default:
            break;
    }
}

addEventListener("activate", e => {
    e.waitUntil(activateEvent());
});

addEventListener("fetch", e => {
    fetchEvent(
        e
    );
});

addEventListener("install", e => {
    e.waitUntil(installEvent());
});

addEventListener("message", e => {
    messageEvent(
        e
    );
});
