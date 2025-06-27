// MessageBird Push Notifications Service
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
  click_action?: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  platform: 'web' | 'android' | 'ios';
  user_id?: string;
}

export interface PushResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryReport?: {
    delivered: number;
    failed: number;
    pending: number;
  };
}

// Get the correct MessageBird Push API base URL
const getPushApiBaseUrl = (): string => {
  // In development, use the proxy
  if (import.meta.env.DEV) {
    return '/messagebird-push-api';
  }
  // In production, use the actual Push API endpoint
  return 'https://push.messagebird.com/v1';
};

// Register push subscription with MessageBird
export const registerPushSubscription = async (
  apiKey: string,
  subscription: PushSubscription
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> => {
  try {
    console.log('📱 Registering push subscription with MessageBird...');
    
    const apiBaseUrl = getPushApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: subscription.platform,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        user_id: subscription.user_id || 'admin-user'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Push subscription registered:', data.id);
      return {
        success: true,
        subscriptionId: data.id
      };
    } else {
      console.error('❌ Failed to register push subscription:', data);
      return {
        success: false,
        error: data.errors?.[0]?.description || 'Registration failed'
      };
    }
  } catch (error) {
    console.error('💥 Push subscription registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Send push notification via MessageBird
export const sendPushNotification = async (
  apiKey: string,
  subscriptionIds: string[],
  payload: PushNotificationPayload
): Promise<PushResponse> => {
  try {
    console.log(`📤 Sending push notification to ${subscriptionIds.length} devices...`);
    console.log('📋 Payload:', payload);
    
    const apiBaseUrl = getPushApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriptions: subscriptionIds,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/logo2.png',
          badge: payload.badge || 1,
          sound: payload.sound || 'default',
          image: payload.image,
          click_action: payload.click_action || '/'
        },
        data: payload.data || {}
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Push notification sent successfully:', data.id);
      return {
        success: true,
        messageId: data.id,
        deliveryReport: data.delivery_report
      };
    } else {
      console.error('❌ Push notification failed:', data);
      return {
        success: false,
        error: data.errors?.[0]?.description || 'Send failed'
      };
    }
  } catch (error) {
    console.error('💥 Push notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Send bulk push notifications
export const sendBulkPushNotifications = async (
  apiKey: string,
  notifications: Array<{
    subscriptionIds: string[];
    payload: PushNotificationPayload;
  }>
): Promise<PushResponse[]> => {
  const results: PushResponse[] = [];
  
  console.log(`📨 Sending ${notifications.length} bulk push notifications...`);
  
  for (const notification of notifications) {
    try {
      const result = await sendPushNotification(
        apiKey,
        notification.subscriptionIds,
        notification.payload
      );
      results.push(result);
      
      // Small delay between requests
      if (notifications.indexOf(notification) < notifications.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error('❌ Bulk push notification error:', error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`📊 Bulk push notifications completed: ${successCount}/${results.length} successful`);
  
  return results;
};

// Get push subscription status
export const getPushSubscriptions = async (apiKey: string) => {
  try {
    const apiBaseUrl = getPushApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📱 Push subscriptions:', data);
      return data;
    } else {
      throw new Error(`Failed to get push subscriptions: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to get push subscriptions:', error);
    throw error;
  }
};

// Browser push notification setup
export const setupBrowserPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    // Check if browser supports push notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Push notifications not supported in this browser');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Push notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service worker registered');

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI' // Replace with your VAPID public key
      )
    });

    console.log('✅ Push subscription created:', subscription);
    
    return {
      id: 'browser-' + Date.now(),
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      },
      platform: 'web' as const,
      user_id: 'admin-user'
    };
  } catch (error) {
    console.error('❌ Failed to setup browser push notifications:', error);
    return null;
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