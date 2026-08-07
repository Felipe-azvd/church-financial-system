const CACHE_NAME = 'churchfep-shell-v1'
const SHELL_ASSETS = [
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Este app é inteiramente dinâmico (Server Components, Server Actions,
// dados por sessão) — não faz sentido nem é seguro cachear páginas ou
// respostas de API. O service worker só existe para permitir a instalação
// como app e mostrar um aviso decente quando não há conexão nenhuma.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline.html'))
  )
})
