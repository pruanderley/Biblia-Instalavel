// ── Bíblia JFA — Service Worker ──────────────────────────
const CACHE_NAME = 'biblia-jfa-v5';

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

// ── FETCH ─────────────────────────────────────────────────
// Casca do app (index.html, scripts pequenos): REDE PRIMEIRO, cache só se estiver
// offline — assim toda atualização publicada aparece na hora, sem ficar presa em cache.
// Dados grandes (Bíblia, Harpa) e ícones: CACHE PRIMEIRO (rápido e offline).
function isAppShell(req) {
  if (req.mode === 'navigate') return true;
  const p = new URL(req.url).pathname;
  if (/\/(Biblia_data_|Harpa_data)/.test(p)) return false;
  return /\.(html|js|json)$/.test(p) || p.endsWith('/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  if (isAppShell(req)) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' }).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return response;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((c) => c || caches.match('./index.html'))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
