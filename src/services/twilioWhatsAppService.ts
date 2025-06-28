interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
}

interface WhatsAppMessage {
  to: string;
  body: string;
  mediaUrl?: string;
}

interface WhatsAppTemplate {
  to: string;
  templateSid: string;
  contentVariables?: Record<string, string>;
}

interface MessageStatus {
  sid: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
}

class TwilioWhatsAppService {
  private static instance: TwilioWhatsAppService;
  private config: TwilioConfig;
  private apiBaseUrl: string;

  private constructor() {
    this.config = {
      accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
      authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
      whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
    };

    // Use Supabase Edge Functions for backend API calls
    this.apiBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

    if (!this.config.accountSid || !this.config.authToken) {
      console.warn('Twilio credentials not found. Please set VITE_TWILIO_ACCOUNT_SID and VITE_TWILIO_AUTH_TOKEN');
    }
  }

  public static getInstance(): TwilioWhatsAppService {
    if (!TwilioWhatsAppService.instance) {
      TwilioWhatsAppService.instance = new TwilioWhatsAppService();
    }
    return TwilioWhatsAppService.instance;
  }

  /**
   * Send a simple WhatsApp message via backend API
   */
  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/whatsapp-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: message.to,
          body: message.body,
          mediaUrl: message.mediaUrl,
          from: this.config.whatsappNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();
      console.log('WhatsApp message sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send message' 
      };
    }
  }

  /**
   * Send WhatsApp message using approved template via backend API
   */
  async sendTemplateMessage(template: WhatsAppTemplate): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/whatsapp-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: template.to,
          templateSid: template.templateSid,
          contentVariables: template.contentVariables,
          from: this.config.whatsappNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send template message');
      }

      const result = await response.json();
      console.log('WhatsApp template message sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error: any) {
      console.error('Error sending WhatsApp template message:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send template message' 
      };
    }
  }

  /**
   * Send wedding confirmation notification
   */
  async sendConfirmationNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `🎉 *تأكيد حضور حفل الزفاف*

مرحباً ${guestName}! 

تم تأكيد حضورك بنجاح لحفل الزفاف:

📅 *التاريخ:* الجمعة، ٤ يوليو ٢٠٢٥
🕰️ *الوقت:* ٨:٣٠ مساءً  
📍 *المكان:* فندق إرث
🎫 *رقم الدعوة:* ${invitationId}

للوصول إلى موقع الفندق:
https://maps.app.goo.gl/E9sp6ayDb96DTnNG6

بحضوركم تكتمل سعادتنا! ✨

_للاستفسارات، يرجى الرد على هذه الرسالة_`
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send wedding apology notification
   */
  async sendApologyNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `😔 *اعتذار عن حضور حفل الزفاف*

${guestName}، تم استلام اعتذارك عن الحضور.

🎫 *رقم الدعوة:* ${invitationId}
📅 *تاريخ الاعتذار:* ${new Date().toLocaleDateString('ar-SA')}

نتفهم ظروفك تماماً ونتطلع لرؤيتك في مناسبة قادمة إن شاء الله.

شكراً لك على إعلامنا مسبقاً. 🤍

_للاستفسارات، يرجى الرد على هذه الرسالة_`
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send wedding invitation with media
   */
  async sendWeddingInvitation(phoneNumber: string, guestName: string, mediaUrl?: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `💌 *دعوة حفل زفاف*

${guestName} الكريم/ة،

يشرفنا دعوتكم لحضور حفل زفافنا:

🌹 *التفاصيل:*
📅 التاريخ: الجمعة، ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

🗺️ *موقع الفندق:*
https://maps.app.goo.gl/E9sp6ayDb96DTnNG6

لتأكيد حضوركم، يرجى زيارة الرابط التالي:
${window.location.origin}

بحضوركم تكتمل سعادتنا! 💕

_نتطلع لرؤيتكم في هذا اليوم المميز_`,
      ...(mediaUrl && { mediaUrl })
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send bulk invitations to multiple contacts via backend API
   */
  async sendBulkInvitations(
    contacts: Array<{ name: string; phoneNumber: string }>,
    mediaUrl?: string,
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ successful: number; failed: number; results: Array<{ contact: any; success: boolean; error?: string }> }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/whatsapp-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          contacts,
          mediaUrl,
          from: this.config.whatsappNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send bulk messages');
      }

      const result = await response.json();
      
      // Simulate progress updates if callback provided
      if (onProgress) {
        onProgress(contacts.length, contacts.length);
      }

      return result;
    } catch (error: any) {
      console.error('Error sending bulk invitations:', error);
      
      // Return failed result for all contacts
      const results = contacts.map(contact => ({
        contact,
        success: false,
        error: error.message
      }));

      return {
        successful: 0,
        failed: contacts.length,
        results
      };
    }
  }

  /**
   * Get message status via backend API
   */
  async getMessageStatus(messageSid: string): Promise<MessageStatus | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/whatsapp-status/${messageSid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch message status');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching message status:', error);
      return null;
    }
  }

  /**
   * Handle incoming WhatsApp messages (webhook) via backend API
   */
  async handleIncomingMessage(webhookData: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/whatsapp-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error('Failed to handle incoming message');
      }

      console.log('Incoming message handled successfully');
    } catch (error) {
      console.error('Error handling incoming WhatsApp message:', error);
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid international format (8-15 digits)
    return cleaned.length >= 8 && cleaned.length <= 15;
  }

  /**
   * Format phone number for WhatsApp
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assuming Saudi Arabia +966)
    if (!cleaned.startsWith('966') && cleaned.length === 9) {
      cleaned = '966' + cleaned;
    }
    
    return '+' + cleaned;
  }
}

export default TwilioWhatsAppService;
export type { WhatsAppMessage, WhatsAppTemplate, MessageStatus };