const CACHE_NAME =
  "jm-shell-v2";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon.svg",
];

// ============================
// INSTALL
// ============================

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache.addAll(
            APP_SHELL
          )
        )
    );

    self.skipWaiting();
  }
);

// ============================
// ACTIVATE
// ============================

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      Promise.all([
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter(
                  (key) =>
                    key !==
                    CACHE_NAME
                )
                .map((key) =>
                  caches.delete(
                    key
                  )
                )
            )
          ),

        self.clients.claim(),
      ])
    );
  }
);

// ============================
// FETCH
// ============================

self.addEventListener(
  "fetch",
  (event) => {
    const request =
      event.request;

    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    // Do not interfere with
    // Firebase, Firestore,
    // Cloudinary or other APIs.
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    // HTML navigation:
    // network first so deployments
    // don't get stuck on old HTML.
    if (
      request.mode ===
      "navigate"
    ) {
      event.respondWith(
        fetch(request)
          .then(
            (response) => {
              const copy =
                response.clone();

              caches
                .open(
                  CACHE_NAME
                )
                .then(
                  (cache) =>
                    cache.put(
                      "/index.html",
                      copy
                    )
                );

              return response;
            }
          )
          .catch(() =>
            caches.match(
              "/index.html"
            )
          )
      );

      return;
    }

    // Same-origin static files:
    // cache first, network fallback.
    event.respondWith(
      caches
        .match(request)
        .then(
          (cached) => {
            if (cached) {
              return cached;
            }

            return fetch(
              request
            ).then(
              (response) => {
                if (
                  !response ||
                  response.status !==
                    200 ||
                  response.type ===
                    "opaque"
                ) {
                  return response;
                }

                const copy =
                  response.clone();

                caches
                  .open(
                    CACHE_NAME
                  )
                  .then(
                    (cache) =>
                      cache.put(
                        request,
                        copy
                      )
                  );

                return response;
              }
            );
          }
        )
    );
  }
);