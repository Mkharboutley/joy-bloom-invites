import { supabase } from '@/integrations/supabase/client';
import { subscribeToGuests } from './firebase';
import TwilioWhatsAppService from './twilioWhatsAppService';

interface NotificationContact {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  notification_type: string;
  is_active: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private contacts: NotificationContact[] = [];
  private isListening = false;
  private twilioWhatsApp: TwilioWhatsAppService;

  private constructor() {
    this.twilioWhatsApp = TwilioWhatsAppService.getInstance();
    this.loadContacts();
    this.startGuestListener();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async loadContacts() {
    try {
      const { data, error } = await supabase
        .from('admin_contacts')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      this.contacts = data || [];
    } catch (error) {
      console.error('Error loading notification contacts:', error);
    }
  }

  private startGuestListener() {
    if (this.isListening) return;
    
    this.isListening = true;
    
    // Listen to Firebase guest changes for real-time notifications
    subscribeToGuests((guests) => {
      // This will be called whenever there's a change in the guests collection
      // We can implement logic here to detect new confirmations/apologies
      this.handleGuestUpdates(guests);
    });
  }

  private async handleGuestUpdates(guests: any[]) {
    // This method will be called whenever there's a change in guests
    // We can implement logic to detect new confirmations and send notifications
    
    // For now, we'll just log the update
    console.log('Guest updates detected:', guests.length, 'total guests');
    
    // In a real implementation, you would:
    // 1. Compare with previous state to detect new confirmations/apologies
    // 2. Send notifications to all active contacts
    // 3. Log the notifications in the database
  }

  public async sendNotification(
    guestName: string,
    guestId: string,
    notificationType: 'confirmation' | 'apology' | 'summary',
    message: string
  ) {
    const activeContacts = this.contacts.filter(contact => contact.is_active);
    
    for (const contact of activeContacts) {
      try {
        // Send notification based on contact type
        const success = await this.sendToContact(contact, message);
        
        // Log the notification attempt
        await this.logNotification(
          guestName,
          guestId,
          notificationType,
          contact.notification_type === 'sms' ? contact.phone_number! : contact.email!,
          contact.notification_type,
          success ? 'sent' : 'failed'
        );
        
      } catch (error) {
        console.error(`Failed to send notification to ${contact.name}:`, error);
        
        // Log the failed attempt
        await this.logNotification(
          guestName,
          guestId,
          notificationType,
          contact.notification_type === 'sms' ? contact.phone_number! : contact.email!,
          contact.notification_type,
          'failed'
        );
      }
    }
  }

  private async sendToContact(contact: NotificationContact, message: string): Promise<boolean> {
    // Send notifications using Twilio WhatsApp for SMS and WhatsApp
    switch (contact.notification_type) {
      case 'sms':
      case 'whatsapp':
        return this.sendWhatsAppMessage(contact.phone_number!, message);
      case 'email':
        return this.sendEmail(contact.email!, message);
      case 'push':
        return this.sendPushNotification(contact.id, message);
      default:
        return false;
    }
  }

  private async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const formattedNumber = TwilioWhatsAppService.formatPhoneNumber(phoneNumber);
      const result = await this.twilioWhatsApp.sendMessage({
        to: formattedNumber,
        body: message
      });
      
      return result.success;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  private async sendEmail(email: string, message: string): Promise<boolean> {
    // Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Sending email to ${email}: ${message}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.05), 1000); // 95% success rate
    });
  }

  private async sendPushNotification(contactId: string, message: string): Promise<boolean> {
    // Integrate with push notification service (Firebase Cloud Messaging, etc.)
    console.log(`Sending push notification to ${contactId}: ${message}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.02), 1000); // 98% success rate
    });
  }

  private async logNotification(
    guestName: string,
    guestId: string,
    notificationType: string,
    sentTo: string,
    sentVia: string,
    status: string
  ) {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .insert([{
          guest_name: guestName,
          guest_id: guestId,
          notification_type: notificationType,
          sent_to: sentTo,
          sent_via: sentVia,
          status: status
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  public async sendConfirmationNotification(guestName: string, guestId: string) {
    // Send WhatsApp notification to admin contacts
    const message = `🎉 تأكيد حضور جديد!\n\nالضيف: ${guestName}\nرقم الدعوة: ${guestId}\nالوقت: ${new Date().toLocaleString('ar-SA')}`;
    
    await this.sendNotification(guestName, guestId, 'confirmation', message);
  }

  public async sendApologyNotification(guestName: string, guestId: string) {
    // Send WhatsApp notification to admin contacts
    const message = `😔 اعتذار عن الحضور\n\nالضيف: ${guestName}\nرقم الدعوة: ${guestId}\nالوقت: ${new Date().toLocaleString('ar-SA')}`;
    
    await this.sendNotification(guestName, guestId, 'apology', message);
  }

  public async sendDailySummary() {
    // This would be called by a scheduled job
    // Implementation would fetch current stats and send summary
    const message = `📊 ملخص يومي للحضور\n\nتاريخ: ${new Date().toLocaleDateString('ar-SA')}\n\n[سيتم إضافة الإحصائيات هنا]`;
    
    await this.sendNotification('النظام', 'daily-summary', 'summary', message);
  }

  public async refreshContacts() {
    await this.loadContacts();
  }

  // New methods for bulk invitation sending
  public async sendBulkInvitations(
    contacts: Array<{ name: string; phoneNumber: string }>,
    mediaUrl?: string,
    onProgress?: (sent: number, total: number) => void
  ) {
    return await this.twilioWhatsApp.sendBulkInvitations(contacts, mediaUrl, onProgress);
  }

  public async sendWeddingInvitation(phoneNumber: string, guestName: string, mediaUrl?: string) {
    return await this.twilioWhatsApp.sendWeddingInvitation(phoneNumber, guestName, mediaUrl);
  }

  public async handleIncomingWhatsAppMessage(webhookData: any) {
    return await this.twilioWhatsApp.handleIncomingMessage(webhookData);
  }
}

export default NotificationService;