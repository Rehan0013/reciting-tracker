// public/sw.js
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener for messages to display notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const options = {
      body: event.data.body || "Time for your daily Quran reading 📖",
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'quran-tracker-reminder',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(event.data.title || 'Quran Daily Tracker', options)
    );
  }
});
