// Simple Push Notification Service - No Firebase Required
// Uses browser's native Push API with VAPID keys

export interface SimplePushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  platform: 'web';
  user_id?: string;
  created_at: string;
}

export interface SimplePushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  data?: Record<string, any>;
}

// Simple VAPID key pair for testing (in production, generate your own)
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI';

// Check if browser supports push notifications
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) {
    console.warn('⚠️ Push notifications not supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('📱 Notification permission:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Failed to request notification permission:', error);
    return false;
  }
};

// Create a simple service worker for push notifications
const createServiceWorker = (): string => {
  return `
    self.addEventListener('push', function(event) {
      console.log('📨 Push message received:', event);
      
      let notificationData = {
        title: 'إشعار جديد',
        body: 'لديك تحديث جديد',
        icon: '/logo2.png',
        badge: '/logo2.png',
        data: {}
      };
      
      if (event.data) {
        try {
          notificationData = event.data.json();
        } catch (e) {
          notificationData.body = event.data.text();
        }
      }
      
      const options = {
        body: notificationData.body,
        icon: notificationData.icon || '/logo2.png',
        badge: notificationData.badge || '/logo2.png',
        data: notificationData.data || {},
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'عرض',
            icon: '/logo2.png'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
      );
    });
    
    self.addEventListener('notificationclick', function(event) {
      console.log('🔔 Notification clicked:', event);
      event.notification.close();
      
      if (event.action === 'view' || !event.action) {
        event.waitUntil(
          clients.openWindow('/admin')
        );
      }
    });
    
    self.addEventListener('notificationclose', function(event) {
      console.log('❌ Notification closed:', event);
    });
  `;
};

// Register service worker and get push subscription
export const setupPushNotifications = async (): Promise<SimplePushSubscription | null> => {
  try {
    if (!isPushSupported()) {
      throw new Error('Push notifications not supported');
    }

    // Request permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }

    // Create and register service worker
    const swBlob = new Blob([createServiceWorker()], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(swBlob);
    
    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('✅ Service worker registered:', registration);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('✅ Push subscription created:', subscription);

    const pushSubscription: SimplePushSubscription = {
      id: 'browser-' + Date.now(),
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      },
      platform: 'web',
      user_id: 'admin-user',
      created_at: new Date().toISOString()
    };

    // Store subscription in localStorage for persistence
    localStorage.setItem('push_subscription', JSON.stringify(pushSubscription));
    
    return pushSubscription;
  } catch (error) {
    console.error('❌ Failed to setup push notifications:', error);
    return null;
  }
};

// Get stored push subscription
export const getStoredPushSubscription = (): SimplePushSubscription | null => {
  try {
    const stored = localStorage.getItem('push_subscription');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('❌ Failed to get stored subscription:', error);
    return null;
  }
};

// Send a local push notification (for testing)
export const sendLocalPushNotification = async (payload: SimplePushPayload): Promise<boolean> => {
  try {
    if (!isPushSupported()) {
      throw new Error('Push notifications not supported');
    }

    // Check if we have permission
    if (Notification.permission !== 'granted') {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        throw new Error('Notification permission required');
      }
    }

    // Create and show notification
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo2.png',
      badge: '/logo2.png',
      data: payload.data || {},
      requireInteraction: true
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to admin page
      if (window.location.pathname !== '/admin') {
        window.location.href = '/admin';
      }
    };

    console.log('✅ Local notification sent:', payload.title);
    return true;
  } catch (error) {
    console.error('❌ Failed to send local notification:', error);
    return false;
  }
};

// Send notification via service worker (simulates push from server)
export const sendServiceWorkerNotification = async (payload: SimplePushPayload): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Simulate a push event by posting message to service worker
    if (registration.active) {
      registration.active.postMessage({
        type: 'PUSH_NOTIFICATION',
        payload: payload
      });
      
      // Also show notification directly
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/logo2.png',
        badge: '/logo2.png',
        data: payload.data || {},
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'عرض'
          }
        ]
      });
      
      console.log('✅ Service worker notification sent:', payload.title);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to send service worker notification:', error);
    return false;
  }
};

// Check if user is subscribed to push notifications
export const isPushSubscribed = async (): Promise<boolean> => {
  try {
    if (!isPushSupported()) return false;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('❌ Failed to check push subscription:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      localStorage.removeItem('push_subscription');
      console.log('✅ Unsubscribed from push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to unsubscribe from push:', error);
    return false;
  }
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}