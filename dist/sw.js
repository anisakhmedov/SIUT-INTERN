self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'SIUT', {
      body: data.body || 'You have a new notification.',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      data: data.url ? { url: data.url } : null,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
