
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
          ? `تأكيد حضور جديد: ${guestName}` 
          : `إعتذار عن الحضور: ${guestName}`;
        
        // For now, we'll just log the notifications
        // You can integrate with actual SMS/Push services later
        console.log(`Sending ${contact.notification_type} to ${contact.name}: ${message}`);
        
        await logNotification({
          guest_name: guestName,
          guest_id: guestId,
          notification_type: notificationType,
          sent_to: contact.phone_number || contact.email || contact.name,
          sent_via: contact.notification_type,
          status: 'sent'
        });
        
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
