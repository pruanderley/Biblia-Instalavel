// ── Bíblia JFA — Service Worker ──────────────────────────
const CACHE_NAME = 'biblia-jfa-v4';

// Arquivos essenciais que ficam em cache (funcionam offline)
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.png',
  './bible-versions-FINAL-v2.js',
  './Biblia_data_JFA.js',
  './Biblia_data_KJF.js',
  './Biblia_data_NTLH.js',
  './Biblia_data_NVI.js',
  './Harpa_data.js',
  './back-navigation.js'
];

// ── INSTALAR: cria o cache ────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// ── ATIVAR: limpa caches antigos ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: serve do cache, busca rede como fallback ───────
self.addEventListener('fetch', (event) => {
  // Deixa requisições externas (fontes, ResponsiveVoice) passarem
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Só faz cache de respostas válidas
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        // Offline e não tem cache: retorna index.html como fallback
        return caches.match('./index.html');
      });
    })
  );
});
