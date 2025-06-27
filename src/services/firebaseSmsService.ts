import { getFunctions, httpsCallable } from 'firebase/functions';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

// Firebase SMS Service using Cloud Functions
const functions = getFunctions();

export interface SMSMessage {
  to: string; // Phone number with country code
  message: string;
  templateId?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Send SMS using Firebase Cloud Function
export const sendSMS = async (smsData: SMSMessage): Promise<SMSResponse> => {
  try {
    const sendSMSFunction = httpsCallable(functions, 'sendSMS');
    const result = await sendSMSFunction(smsData);
    
    return {
      success: true,
      messageId: result.data.messageId
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Send bulk SMS messages
export const sendBulkSMS = async (messages: SMSMessage[]): Promise<SMSResponse[]> => {
  try {
    const sendBulkSMSFunction = httpsCallable(functions, 'sendBulkSMS');
    const result = await sendBulkSMSFunction({ messages });
    
    return result.data.results;
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    return messages.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
};

// Initialize Firebase Messaging for push notifications
export const initializeMessaging = async () => {
  try {
    const messaging = getMessaging();
    
    // Request permission for notifications
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // You'll need to generate this in Firebase Console
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  const messaging = getMessaging();
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
};

// Send push notification
export const sendPushNotification = async (data: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<SMSResponse> => {
  try {
    const sendPushFunction = httpsCallable(functions, 'sendPushNotification');
    const result = await sendPushFunction(data);
    
    return {
      success: true,
      messageId: result.data.messageId
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};