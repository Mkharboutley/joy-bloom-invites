import { sendSMS, sendPushNotification, SMSMessage } from './firebaseSmsService';
import { getAdminContacts, logNotification } from './supabaseService';

export const sendAdminNotifications = async (
  guestName: string,
  guestId: string,
  notificationType: 'confirmation' | 'apology'
) => {
  try {
    const adminContacts = await getAdminContacts();
    
    for (const contact of adminContacts) {
      try {
        const message = notificationType === 'confirmation' 
          ? `🎉 تأكيد حضور جديد: ${guestName}\n\nتم تأكيد الحضور للزفاف. يرجى مراجعة لوحة التحكم للمزيد من التفاصيل.` 
          : `😔 إعتذار عن الحضور: ${guestName}\n\nتم الإعتذار عن حضور الزفاف. يرجى مراجعة لوحة التحكم للمزيد من التفاصيل.`;
        
        let result;
        
        if (contact.notification_type === 'sms' && contact.phone_number) {
          // Send SMS
          const smsData: SMSMessage = {
            to: contact.phone_number,
            message: message
          };
          
          result = await sendSMS(smsData);
          
        } else if (contact.notification_type === 'push' && contact.phone_number) {
          // Send Push Notification
          // Note: You'll need to store FCM tokens for push notifications
          result = await sendPushNotification({
            token: contact.phone_number, // This should be FCM token, not phone number
            title: notificationType === 'confirmation' ? 'تأكيد حضور جديد' : 'إعتذار عن الحضور',
            body: `${guestName} - ${notificationType === 'confirmation' ? 'أكد الحضور' : 'اعتذر عن الحضور'}`,
            data: {
              guestId: guestId,
              guestName: guestName,
              type: notificationType
            }
          });
          
        } else if (contact.notification_type === 'email' && contact.email) {
          // For email, you could use Firebase Extensions or another service
          console.log(`Email notification to ${contact.email}: ${message}`);
          result = { success: true, messageId: 'email-placeholder' };
        }
        
        // Log the notification
        await logNotification({
          guest_name: guestName,
          guest_id: guestId,
          notification_type: notificationType,
          sent_to: contact.phone_number || contact.email || contact.name,
          sent_via: contact.notification_type,
          status: result?.success ? 'sent' : 'failed'
        });
        
        if (result?.success) {
          console.log(`✅ ${contact.notification_type} sent to ${contact.name}: ${message}`);
        } else {
          console.error(`❌ Failed to send ${contact.notification_type} to ${contact.name}:`, result?.error);
        }
        
      } catch (error) {
        console.error(`Failed to send notification to ${contact.name}:`, error);
        
        await logNotification({
          guest_name: guestName,
          guest_id: guestId,
          notification_type: notificationType,
          sent_to: contact.phone_number || contact.email || contact.name,
          sent_via: contact.notification_type,
          status: 'failed'
        });
      }
    }
  } catch (error) {
    console.error('Failed to send admin notifications:', error);
  }
};

// Send bulk SMS to WhatsApp contacts using Firebase
export const sendBulkSMSToContacts = async (
  contacts: Array<{ name: string; phone_number: string }>,
  message: string,
  templateId?: string
) => {
  try {
    const smsMessages: SMSMessage[] = contacts.map(contact => ({
      to: contact.phone_number,
      message: message.replace('{name}', contact.name),
      templateId: templateId
    }));
    
    // Send in batches to avoid overwhelming the system
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < smsMessages.length; i += batchSize) {
      const batch = smsMessages.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(sms => sendSMS(sms))
      );
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < smsMessages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};