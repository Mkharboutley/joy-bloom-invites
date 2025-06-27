import { getAdminContacts, logNotification } from './supabaseService';
import { sendSMS } from './messageBirdService';

export const sendAdminNotifications = async (
  guestName: string,
  guestId: string,
  notificationType: 'confirmation' | 'apology'
) => {
  try {
    console.log(`Sending admin notifications for ${guestName} (${notificationType})`);
    
    const adminContacts = await getAdminContacts();
    const apiKey = localStorage.getItem('messagebird_api_key');
    
    console.log(`Found ${adminContacts.length} admin contacts, API key available: ${!!apiKey}`);
    
    for (const contact of adminContacts) {
      try {
        const message = notificationType === 'confirmation' 
          ? `تأكيد حضور جديد: ${guestName}` 
          : `إعتذار عن الحضور: ${guestName}`;
        
        let notificationSent = false;
        let sentTo = contact.name;
        let errorMessage = '';
        
        // Send SMS if it's an SMS contact and we have API key
        if (contact.notification_type === 'sms' && contact.phone_number && apiKey) {
          try {
            console.log(`Sending SMS to ${contact.name} (${contact.phone_number})`);
            const smsResult = await sendSMS(contact.phone_number, message, apiKey);
            if (smsResult.success) {
              notificationSent = true;
              sentTo = contact.phone_number;
              console.log(`SMS sent successfully to ${contact.name}: ${message}`);
            } else {
              console.error(`SMS failed to ${contact.name}:`, smsResult.error);
              errorMessage = smsResult.error || 'SMS sending failed';
            }
          } catch (smsError) {
            console.error(`SMS error for ${contact.name}:`, smsError);
            errorMessage = smsError instanceof Error ? smsError.message : 'SMS error';
          }
        } else {
          // For other notification types, just log (you can integrate other services later)
          console.log(`Notification logged for ${contact.name}: ${message}`);
          notificationSent = true;
        }
        
        await logNotification({
          guest_name: guestName,
          guest_id: guestId,
          notification_type: notificationType,
          sent_to: sentTo,
          sent_via: contact.notification_type,
          status: notificationSent ? 'sent' : 'failed'
        });
        
      } catch (error) {
        console.error(`Failed to send notification to ${contact.name}:`, error);
        
        try {
          await logNotification({
            guest_name: guestName,
            guest_id: guestId,
            notification_type: notificationType,
            sent_to: contact.phone_number || contact.email || contact.name,
            sent_via: contact.notification_type,
            status: 'failed'
          });
        } catch (logError) {
          console.error('Failed to log notification error:', logError);
        }
      }
    }
  } catch (error) {
    console.error('Failed to send admin notifications:', error);
  }
};