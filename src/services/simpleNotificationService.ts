// Simple Notification Service - Works with Supabase, no Firebase required
import { sendLocalPushNotification } from './simplePushService';
import { sendSMS } from './messageBirdService';
import { getAdminContacts } from './supabaseService';

export interface SimpleNotificationRule {
  id: string;
  name: string;
  trigger: 'guest_confirmation' | 'guest_apology' | 'delivery_failure';
  enabled: boolean;
  message_template: string;
  notification_types: ('sms' | 'push')[];
}

// Default notification rules
const DEFAULT_RULES: SimpleNotificationRule[] = [
  {
    id: '1',
    name: 'Guest Confirmation Alert',
    trigger: 'guest_confirmation',
    enabled: true,
    message_template: 'تأكيد حضور جديد: {guest_name} - الوقت: {timestamp}',
    notification_types: ['sms', 'push']
  },
  {
    id: '2',
    name: 'Guest Apology Alert',
    trigger: 'guest_apology',
    enabled: true,
    message_template: 'إعتذار عن الحضور: {guest_name} - الوقت: {timestamp}',
    notification_types: ['sms', 'push']
  },
  {
    id: '3',
    name: 'SMS Delivery Failure Alert',
    trigger: 'delivery_failure',
    enabled: true,
    message_template: 'فشل في توصيل رسالة SMS إلى {phone_number} - السبب: {reason}',
    notification_types: ['push']
  }
];

// Get notification rules (stored in localStorage for simplicity)
export const getSimpleNotificationRules = (): SimpleNotificationRule[] => {
  try {
    const stored = localStorage.getItem('notification_rules');
    return stored ? JSON.parse(stored) : DEFAULT_RULES;
  } catch (error) {
    console.error('Failed to get notification rules:', error);
    return DEFAULT_RULES;
  }
};

// Save notification rules
export const saveSimpleNotificationRules = (rules: SimpleNotificationRule[]): void => {
  try {
    localStorage.setItem('notification_rules', JSON.stringify(rules));
  } catch (error) {
    console.error('Failed to save notification rules:', error);
  }
};

// Format message template with data
const formatMessageTemplate = (template: string, data: Record<string, any>): string => {
  let message = template;
  
  // Replace placeholders
  Object.keys(data).forEach(key => {
    const placeholder = `{${key}}`;
    if (message.includes(placeholder)) {
      message = message.replace(new RegExp(placeholder, 'g'), String(data[key]));
    }
  });
  
  // Add timestamp if not provided
  if (message.includes('{timestamp}') && !data.timestamp) {
    const now = new Date().toLocaleString('ar-SA', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    message = message.replace(/{timestamp}/g, now);
  }
  
  return message;
};

// Process notification based on rules
export const processSimpleNotification = async (
  trigger: SimpleNotificationRule['trigger'],
  data: Record<string, any>
) => {
  try {
    const rules = getSimpleNotificationRules();
    const activeRules = rules.filter(rule => rule.enabled && rule.trigger === trigger);
    
    console.log(`📋 Processing ${activeRules.length} notification rules for trigger: ${trigger}`);
    
    for (const rule of activeRules) {
      await executeSimpleNotificationRule(rule, data);
    }
  } catch (error) {
    console.error('❌ Failed to process simple notifications:', error);
  }
};

// Execute a specific notification rule
const executeSimpleNotificationRule = async (rule: SimpleNotificationRule, data: Record<string, any>) => {
  try {
    // Format message template
    const message = formatMessageTemplate(rule.message_template, data);
    
    // Send Push notifications
    if (rule.notification_types.includes('push')) {
      try {
        console.log(`📱 Sending push notification via rule "${rule.name}"`);
        
        await sendLocalPushNotification({
          title: getNotificationTitle(rule.trigger),
          body: message,
          icon: '/logo2.png',
          data: {
            trigger: rule.trigger,
            guest_name: data.guest_name,
            timestamp: data.timestamp
          }
        });
      } catch (pushError) {
        console.error('❌ Failed to send push notification:', pushError);
      }
    }
    
    // Send SMS notifications
    if (rule.notification_types.includes('sms')) {
      try {
        const adminContacts = await getAdminContacts();
        const apiKey = localStorage.getItem('messagebird_api_key');
        
        if (apiKey) {
          const smsContacts = adminContacts.filter(contact => 
            contact.notification_type === 'sms' && contact.phone_number
          );
          
          if (smsContacts.length > 0) {
            console.log(`📤 Sending SMS via rule "${rule.name}" to ${smsContacts.length} recipients`);
            
            for (const contact of smsContacts) {
              try {
                await sendSMS(contact.phone_number!, message, apiKey);
              } catch (smsError) {
                console.error(`❌ Failed to send SMS to ${contact.name}:`, smsError);
              }
            }
          }
        } else {
          console.warn('⚠️ No MessageBird API key found for SMS notifications');
        }
      } catch (smsError) {
        console.error('❌ Failed to send SMS notifications:', smsError);
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to execute notification rule ${rule.name}:`, error);
  }
};

// Get notification title based on trigger
const getNotificationTitle = (trigger: string): string => {
  switch (trigger) {
    case 'guest_confirmation': return '✅ تأكيد حضور جديد';
    case 'guest_apology': return '❌ إعتذار عن الحضور';
    case 'delivery_failure': return '⚠️ فشل في التوصيل';
    default: return '🔔 إشعار جديد';
  }
};

// Trigger notification for guest confirmation
export const triggerGuestConfirmationNotification = async (guestName: string, guestId: string) => {
  await processSimpleNotification('guest_confirmation', {
    guest_name: guestName,
    guest_id: guestId,
    timestamp: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Dubai' })
  });
};

// Trigger notification for guest apology
export const triggerGuestApologyNotification = async (guestName: string, guestId: string) => {
  await processSimpleNotification('guest_apology', {
    guest_name: guestName,
    guest_id: guestId,
    timestamp: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Dubai' })
  });
};

// Trigger notification for delivery failure
export const triggerDeliveryFailureNotification = async (phoneNumber: string, reason: string) => {
  await processSimpleNotification('delivery_failure', {
    phone_number: phoneNumber,
    reason: reason,
    timestamp: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Dubai' })
  });
};