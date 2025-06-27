// MessageBird Push Notifications Service with SDK Integration
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

// MessageBird Application Configuration from your SDK script
const MESSAGEBIRD_CONFIG = {
  workspaceId: '0c1202e3-4318-4330-9e78-e09ea6829512',
  applicationId: 'd7a5cb15-ade7-4588-8de4-ad3f11b4d81c',
  configUrl: 'https://api.bird.com/workspaces/0c1202e3-4318-4330-9e78-e09ea6829512/applications/d7a5cb15-ade7-4588-8de4-ad3f11b4d81c/signature/2024-06-17T17-12-51_cfa35c00c8'
};

// Wait for MessageBird SDK to load
const waitForMessageBirdSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).MessageBird) {
      resolve((window as any).MessageBird);
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkSDK = () => {
      attempts++;
      if ((window as any).MessageBird) {
        console.log('✅ MessageBird SDK loaded successfully');
        resolve((window as any).MessageBird);
      } else if (attempts >= maxAttempts) {
        console.error('❌ MessageBird SDK failed to load within timeout');
        reject(new Error('MessageBird SDK not loaded'));
      } else {
        setTimeout(checkSDK, 100);
      }
    };
    
    checkSDK();
  });
};

// Initialize MessageBird SDK
export const initializeMessageBirdSDK = async (): Promise<any> => {
  try {
    console.log('🔄 Initializing MessageBird SDK...');
    const MessageBird = await waitForMessageBirdSDK();
    
    // Initialize with your configuration
    const sdk = await MessageBird.init({
      workspaceId: MESSAGEBIRD_CONFIG.workspaceId,
      applicationId: MESSAGEBIRD_CONFIG.applicationId
    });
    
    console.log('✅ MessageBird SDK initialized:', sdk);
    return sdk;
  } catch (error) {
    console.error('❌ Failed to initialize MessageBird SDK:', error);
    throw error;
  }
};

// Register push subscription using MessageBird SDK
export const registerPushSubscription = async (
  apiKey: string,
  subscription: PushSubscription
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> => {
  try {
    console.log('📱 Registering push subscription with MessageBird SDK...');
    
    const sdk = await initializeMessageBirdSDK();
    
    // Use SDK to register push subscription
    const result = await sdk.push.subscribe({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      platform: subscription.platform,
      userId: subscription.user_id || 'admin-user'
    });
    
    console.log('✅ Push subscription registered via SDK:', result);
    return {
      success: true,
      subscriptionId: result.id || result.subscriptionId
    };
  } catch (error) {
    console.error('❌ SDK push subscription failed, falling back to API:', error);
    
    // Fallback to direct API call
    return await registerPushSubscriptionAPI(apiKey, subscription);
  }
};

// Fallback API registration
const registerPushSubscriptionAPI = async (
  apiKey: string,
  subscription: PushSubscription
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> => {
  try {
    const response = await fetch('https://push.messagebird.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json',
        'X-MessageBird-Application-Id': MESSAGEBIRD_CONFIG.applicationId
      },
      body: JSON.stringify({
        platform: subscription.platform,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        user_id: subscription.user_id || 'admin-user',
        application_id: MESSAGEBIRD_CONFIG.applicationId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Push subscription registered via API:', data.id);
      return {
        success: true,
        subscriptionId: data.id
      };
    } else {
      console.error('❌ API registration failed:', data);
      return {
        success: false,
        error: data.errors?.[0]?.description || data.message || 'Registration failed'
      };
    }
  } catch (error) {
    console.error('💥 API registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Send push notification using MessageBird SDK
export const sendPushNotification = async (
  apiKey: string,
  subscriptionIds: string[],
  payload: PushNotificationPayload
): Promise<PushResponse> => {
  try {
    console.log(`📤 Sending push notification via SDK to ${subscriptionIds.length} devices...`);
    console.log('📋 Payload:', payload);
    
    const sdk = await initializeMessageBirdSDK();
    
    // Use SDK to send push notification
    const result = await sdk.push.send({
      subscriptions: subscriptionIds,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/logo2.png',
        badge: payload.badge || 1,
        sound: payload.sound || 'default',
        image: payload.image,
        click_action: payload.click_action || '/admin'
      },
      data: payload.data || {}
    });
    
    console.log('✅ Push notification sent via SDK:', result);
    return {
      success: true,
      messageId: result.id || result.messageId,
      deliveryReport: result.delivery_report
    };
  } catch (error) {
    console.error('❌ SDK push failed, falling back to API:', error);
    
    // Fallback to direct API call
    return await sendPushNotificationAPI(apiKey, subscriptionIds, payload);
  }
};

// Fallback API send
const sendPushNotificationAPI = async (
  apiKey: string,
  subscriptionIds: string[],
  payload: PushNotificationPayload
): Promise<PushResponse> => {
  try {
    const response = await fetch('https://push.messagebird.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json',
        'X-MessageBird-Application-Id': MESSAGEBIRD_CONFIG.applicationId
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
          click_action: payload.click_action || '/admin'
        },
        data: payload.data || {},
        application_id: MESSAGEBIRD_CONFIG.applicationId
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Push notification sent via API:', data.id);
      return {
        success: true,
        messageId: data.id,
        deliveryReport: data.delivery_report
      };
    } else {
      console.error('❌ API send failed:', data);
      return {
        success: false,
        error: data.errors?.[0]?.description || data.message || 'Send failed'
      };
    }
  } catch (error) {
    console.error('💥 API send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Get push subscriptions using SDK
export const getPushSubscriptions = async (apiKey: string) => {
  try {
    console.log('📱 Loading push subscriptions via SDK...');
    
    const sdk = await initializeMessageBirdSDK();
    
    // Use SDK to get subscriptions
    const subscriptions = await sdk.push.getSubscriptions();
    console.log('📱 Push subscriptions loaded via SDK:', subscriptions);
    return subscriptions;
  } catch (error) {
    console.error('❌ SDK failed, falling back to API:', error);
    
    // Fallback to direct API call
    return await getPushSubscriptionsAPI(apiKey);
  }
};

// Fallback API get subscriptions
const getPushSubscriptionsAPI = async (apiKey: string) => {
  try {
    const response = await fetch('https://push.messagebird.com/v1/subscriptions', {
      method: 'GET',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Accept': 'application/json',
        'X-MessageBird-Application-Id': MESSAGEBIRD_CONFIG.applicationId
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📱 Push subscriptions loaded via API:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to get push subscriptions via API:', errorData);
      throw new Error(errorData.errors?.[0]?.description || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to get push subscriptions:', error);
    throw error;
  }
};

// Test MessageBird Push API connection using SDK
export const testPushConnection = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing MessageBird Push connection via SDK...');
    
    const sdk = await initializeMessageBirdSDK();
    
    // Test SDK connection
    const status = await sdk.push.getStatus();
    console.log('✅ MessageBird Push SDK connection successful:', status);
    return { success: true };
  } catch (error) {
    console.error('❌ SDK test failed, trying API:', error);
    
    // Fallback to API test
    try {
      const response = await fetch('https://push.messagebird.com/v1/subscriptions', {
        method: 'GET',
        headers: {
          'Authorization': `AccessKey ${apiKey}`,
          'Accept': 'application/json',
          'X-MessageBird-Application-Id': MESSAGEBIRD_CONFIG.applicationId
        }
      });
      
      if (response.ok) {
        console.log('✅ MessageBird Push API connection successful');
        return { success: true };
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.errors?.[0]?.description || errorData.message || `HTTP ${response.status}`;
        console.error('❌ MessageBird Push API connection failed:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (apiError) {
      console.error('💥 MessageBird Push test error:', apiError);
      return { 
        success: false, 
        error: apiError instanceof Error ? apiError.message : 'Network error' 
      };
    }
  }
};

// Browser push notification setup with MessageBird SDK
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
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('✅ Service worker registered');

    // Try to get VAPID key from MessageBird SDK
    let vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI'; // Default fallback
    
    try {
      const sdk = await initializeMessageBirdSDK();
      const config = await sdk.push.getConfig();
      if (config.vapidPublicKey) {
        vapidPublicKey = config.vapidPublicKey;
        console.log('✅ Got VAPID key from SDK');
      }
    } catch (sdkError) {
      console.warn('⚠️ Could not get VAPID key from SDK, using fallback');
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
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

// Get MessageBird configuration
export const getMessageBirdConfig = () => MESSAGEBIRD_CONFIG;