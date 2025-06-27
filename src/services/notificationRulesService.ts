// Notification Rules Management Service
import { supabase } from '@/integrations/supabase/client';

export interface NotificationRule {
  id?: string;
  name: string;
  trigger: 'guest_confirmation' | 'guest_apology' | 'delivery_status' | 'failed_delivery' | 'daily_summary';
  enabled: boolean;
  recipients: string[];
  message_template: string;
  conditions?: {
    phone_prefix?: string; // e.g., "971" for UAE
    time_delay?: number; // minutes
    min_failures?: number; // for failed delivery alerts
  };
  created_at?: string;
  updated_at?: string;
}

// Get all notification rules
export const getNotificationRules = async (): Promise<NotificationRule[]> => {
  // For now, return default rules - in production, this would come from database
  return [
    {
      id: '1',
      name: 'Guest Confirmation Alert',
      trigger: 'guest_confirmation',
      enabled: true,
      recipients: [], // Will be populated from admin_contacts
      message_template: 'تأكيد حضور جديد: {guest_name} - الوقت: {timestamp}',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Guest Apology Alert',
      trigger: 'guest_apology',
      enabled: true,
      recipients: [],
      message_template: 'إعتذار عن الحضور: {guest_name} - الوقت: {timestamp}',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'UAE Delivery Failure Alert',
      trigger: 'failed_delivery',
      enabled: true,
      recipients: [],
      message_template: 'فشل في توصيل رسالة إلى {phone_number} - السبب: {reason}',
      conditions: {
        phone_prefix: '971',
        min_failures: 1
      },
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Daily Summary Report',
      trigger: 'daily_summary',
      enabled: false,
      recipients: [],
      message_template: 'تقرير يومي: {confirmed_count} تأكيد، {apology_count} إعتذار، {failed_sms_count} رسالة فاشلة',
      created_at: new Date().toISOString()
    }
  ];
};

// Process notification based on rules
export const processNotification = async (
  trigger: NotificationRule['trigger'],
  data: Record<string, any>
) => {
  try {
    const rules = await getNotificationRules();
    const activeRules = rules.filter(rule => rule.enabled && rule.trigger === trigger);
    
    console.log(`📋 Processing ${activeRules.length} notification rules for trigger: ${trigger}`);
    
    for (const rule of activeRules) {
      await executeNotificationRule(rule, data);
    }
  } catch (error) {
    console.error('❌ Failed to process notifications:', error);
  }
};

// Execute a specific notification rule
const executeNotificationRule = async (rule: NotificationRule, data: Record<string, any>) => {
  try {
    // Check conditions
    if (rule.conditions) {
      if (rule.conditions.phone_prefix && data.phone_number) {
        const phoneNumber = data.phone_number.replace(/\D/g, '');
        if (!phoneNumber.startsWith(rule.conditions.phone_prefix)) {
          console.log(`⏭️ Skipping rule ${rule.name} - phone prefix condition not met`);
          return;
        }
      }
      
      if (rule.conditions.min_failures && data.failure_count < rule.conditions.min_failures) {
        console.log(`⏭️ Skipping rule ${rule.name} - minimum failures not reached`);
        return;
      }
    }
    
    // Format message template
    const message = formatMessageTemplate(rule.message_template, data);
    
    // Get recipients (admin contacts)
    const { getAdminContacts } = await import('./supabaseService');
    const adminContacts = await getAdminContacts();
    const smsContacts = adminContacts.filter(contact => 
      contact.notification_type === 'sms' && contact.phone_number
    );
    
    // Send notifications
    const apiKey = localStorage.getItem('messagebird_api_key');
    if (apiKey && smsContacts.length > 0) {
      const { sendBulkSMS } = await import('./messageBirdService');
      
      const contacts = smsContacts.map(contact => ({
        phoneNumber: contact.phone_number!,
        message: message
      }));
      
      console.log(`📤 Sending notification via rule "${rule.name}" to ${contacts.length} recipients`);
      await sendBulkSMS(contacts, apiKey);
    }
    
  } catch (error) {
    console.error(`❌ Failed to execute notification rule ${rule.name}:`, error);
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

// Trigger notification for guest confirmation
export const triggerGuestConfirmationNotification = async (guestName: string, guestId: string) => {
  await processNotification('guest_confirmation', {
    guest_name: guestName,
    guest_id: guestId,
    timestamp: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Dubai' })
  });
};

// Trigger notification for guest apology
export const triggerGuestApologyNotification = async (guestName: string, guestId: string) => {
  await processNotification('guest_apology', {
    guest_name: guestName,
    guest_id: guestId,
    timestamp: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Dubai' })
  });
};

// Trigger notification for delivery failure
export const triggerDeliveryFailureNotification = async (phoneNumber: string, reason: string) => {
  await processNotification('failed_delivery', {
    phone_number: phoneNumber,
    reason: reason,
    failure_count: 1,
    timestamp: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Dubai' })
  });
};