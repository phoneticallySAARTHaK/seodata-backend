// @ts-nocheck
self.addEventListener("install", async (event) => {
  try {
    await caches
      .open("assets")
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/assets/logo.png",
          "/scripts/index.js",
          "/scripts/utils.js",
          "/scripts/lighthouse.js",
          "/scripts/classic.js",
          "/styles/index.css",
          "/styles/loader.css",
          "/styles/result.css",
          "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap",
        ])
      );
    self.skipWaiting();
  } catch (e) {
    console.log("install err", e);
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  if (
    e.request.mode === "navigate" ||
    (e.request.mode === "same-origin" && e.request.url.endsWith(".css")) ||
    e.request.url.endsWith(".js") ||
    /fonts.(googleapis|gstatic).com/.test(e.request.url)
  ) {
    e.respondWith(
      Promise.any([
        fetch(e.request.clone()),
        caches
          .open("assets")
          .then((cache) =>
            cache.match(
              e.request.mode === "navigate" && !e.request.url.includes("docs")
                ? "/index.html"
                : e.request
            )
          )
          .then((res) => {
            if (!res) throw Response.error();
            else return res;
          }),
      ])
    );
  }

  // APIs
  if (e.request.mode === "same-origin") {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.open("api"))
        .then((cache) => cache.match(e.request))
    );
  }
});
