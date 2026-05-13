// 1. CONFIGURACIÓN DEL MOTOR DE INSTALACIÓN (PWA)
const CACHE_NAME = 'stack-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.png' // Asegúrate de que este nombre sea igual al de tu carpeta public
];

// Instalación y almacenamiento en caché de archivos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Permite que la App funcione más rápido y sea instalable
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// 2. LÓGICA DE NOTIFICACIONES PUSH (TU CÓDIGO)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      // He ajustado esto a /icon.png para que coincida con tu archivo real
      icon: data.icon || '/icon.png',
      badge: '/icon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/tracker'
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientsArr) => {
    // Si la ventana ya está abierta, poner el foco en ella
    const hadWindowToFocus = clientsArr.some((windowClient) =>
      windowClient.url === event.notification.data.url ? (windowClient.focus(), true) : false
    );
    // Si no, abrir una nueva pestaña
    if (!hadWindowToFocus)
      clients.openWindow(event.notification.data.url).then((windowClient) =>
        windowClient ? windowClient.focus() : null
      );
  }));
});