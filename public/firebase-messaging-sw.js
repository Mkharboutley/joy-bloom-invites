// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyC2GHe8k-8ceL0ikWmkoUUILIyuQCBfWSk",
  authDomain: "wedding-f09cd.firebaseapp.com",
  projectId: "wedding-f09cd",
  storageBucket: "wedding-f09cd.firebasestorage.app",
  messagingSenderId: "1024579602427",
  appId: "1:1024579602427:web:eefb44a0779632ad88ed5e",
  measurementId: "G-N7Q3EF4796"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Wedding Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'wedding-notification',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});