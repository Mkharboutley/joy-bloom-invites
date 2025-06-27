// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('📱 Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('📋 Push data:', data);
    
    const options = {
      body: data.body || data.notification?.body || 'إشعار جديد',
      icon: data.icon || data.notification?.icon || '/logo2.png',
      badge: '/logo2.png',
      image: data.image || data.notification?.image,
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'عرض',
          icon: '/logo2.png'
        },
        {
          action: 'close',
          title: 'إغلاق'
        }
      ],
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
      dir: 'rtl',
      lang: 'ar'
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || data.notification?.title || 'دعوة زفاف',
        options
      )
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('📱 Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.openWindow('/admin')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('📱 Notification closed:', event);
});