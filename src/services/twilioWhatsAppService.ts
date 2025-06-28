import twilio from 'twilio';

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
  private client: twilio.Twilio;
  private config: TwilioConfig;

  private constructor() {
    this.config = {
      accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
      authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
      whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886', // Twilio Sandbox number
    };

    if (!this.config.accountSid || !this.config.authToken) {
      console.warn('Twilio credentials not found. Please set VITE_TWILIO_ACCOUNT_SID and VITE_TWILIO_AUTH_TOKEN');
    }

    this.client = twilio(this.config.accountSid, this.config.authToken);
  }

  public static getInstance(): TwilioWhatsAppService {
    if (!TwilioWhatsAppService.instance) {
      TwilioWhatsAppService.instance = new TwilioWhatsAppService();
    }
    return TwilioWhatsAppService.instance;
  }

  /**
   * Send a simple WhatsApp message
   */
  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const result = await this.client.messages.create({
        from: this.config.whatsappNumber,
        to: `whatsapp:${message.to}`,
        body: message.body,
        ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] })
      });

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
   * Send WhatsApp message using approved template
   */
  async sendTemplateMessage(template: WhatsAppTemplate): Promise<{ success: boolean; sid?: string; error?: string }> {
    try {
      const result = await this.client.messages.create({
        from: this.config.whatsappNumber,
        to: `whatsapp:${template.to}`,
        contentSid: template.templateSid,
        ...(template.contentVariables && { contentVariables: JSON.stringify(template.contentVariables) })
      });

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
   * Send bulk invitations to multiple contacts
   */
  async sendBulkInvitations(
    contacts: Array<{ name: string; phoneNumber: string }>,
    mediaUrl?: string,
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ successful: number; failed: number; results: Array<{ contact: any; success: boolean; error?: string }> }> {
    const results: Array<{ contact: any; success: boolean; error?: string }> = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        const success = await this.sendWeddingInvitation(contact.phoneNumber, contact.name, mediaUrl);
        
        if (success) {
          successful++;
          results.push({ contact, success: true });
        } else {
          failed++;
          results.push({ contact, success: false, error: 'Failed to send message' });
        }
      } catch (error: any) {
        failed++;
        results.push({ contact, success: false, error: error.message });
      }

      // Update progress
      if (onProgress) {
        onProgress(i + 1, contacts.length);
      }

      // Add delay between messages to avoid rate limiting
      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return { successful, failed, results };
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string): Promise<MessageStatus | null> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      
      return {
        sid: message.sid,
        status: message.status as MessageStatus['status'],
        errorCode: message.errorCode || undefined,
        errorMessage: message.errorMessage || undefined
      };
    } catch (error: any) {
      console.error('Error fetching message status:', error);
      return null;
    }
  }

  /**
   * Handle incoming WhatsApp messages (webhook)
   */
  async handleIncomingMessage(webhookData: any): Promise<void> {
    try {
      const { From, Body, MessageSid } = webhookData;
      const phoneNumber = From.replace('whatsapp:', '');
      const messageBody = Body?.toLowerCase() || '';

      console.log(`Received WhatsApp message from ${phoneNumber}: ${Body}`);

      // Auto-respond based on message content
      if (messageBody.includes('موقع') || messageBody.includes('عنوان') || messageBody.includes('location')) {
        await this.sendLocationResponse(phoneNumber);
      } else if (messageBody.includes('وقت') || messageBody.includes('تاريخ') || messageBody.includes('time')) {
        await this.sendEventDetailsResponse(phoneNumber);
      } else if (messageBody.includes('تأكيد') || messageBody.includes('confirm')) {
        await this.sendConfirmationInstructions(phoneNumber);
      } else {
        await this.sendDefaultResponse(phoneNumber);
      }

    } catch (error) {
      console.error('Error handling incoming WhatsApp message:', error);
    }
  }

  /**
   * Send location response
   */
  private async sendLocationResponse(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `📍 *موقع فندق إرث*

🏨 العنوان: [عنوان الفندق]
🗺️ رابط الخريطة: https://maps.app.goo.gl/E9sp6ayDb96DTnNG6

🚗 *للوصول بالسيارة:*
- يمكنكم استخدام تطبيق خرائط جوجل للحصول على أفضل طريق

🚕 *للوصول بالتاكسي:*
- يمكنكم إظهار هذا الموقع للسائق

نتطلع لرؤيتكم! 🎉`
    };

    await this.sendMessage(message);
  }

  /**
   * Send event details response
   */
  private async sendEventDetailsResponse(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `🎊 *تفاصيل حفل الزفاف*

📅 *التاريخ:* الجمعة، ٤ يوليو ٢٠٢٥
🕰️ *الوقت:* ٨:٣٠ مساءً
📍 *المكان:* فندق إرث

⏰ *جدول الفعاليات:*
- ٨:٣٠ م: استقبال الضيوف
- ٩:٠٠ م: بداية الحفل
- ١١:٠٠ م: العشاء
- ١٢:٠٠ ص: انتهاء الحفل

👔 *الزي المطلوب:* رسمي

بحضوركم تكتمل سعادتنا! ✨`
    };

    await this.sendMessage(message);
  }

  /**
   * Send confirmation instructions
   */
  private async sendConfirmationInstructions(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `✅ *تأكيد الحضور*

لتأكيد حضوركم، يرجى زيارة الرابط التالي:
${window.location.origin}

📝 *خطوات التأكيد:*
1. اضغط على الرابط أعلاه
2. أدخل اسمكم الكامل
3. اضغط على "تأكيد الحضور"
4. ستحصلون على رمز QR خاص بكم

🎫 *أهمية رمز QR:*
- احتفظوا به في هاتفكم
- أحضروه معكم يوم الحفل
- سيتم مسحه عند الدخول

شكراً لكم! 💕`
    };

    await this.sendMessage(message);
  }

  /**
   * Send default response
   */
  private async sendDefaultResponse(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      body: `🙏 *شكراً لتواصلكم معنا!*

للمساعدة، يمكنكم كتابة:
• "موقع" - لمعرفة عنوان الفندق
• "وقت" - لمعرفة تفاصيل الحفل  
• "تأكيد" - لمعرفة كيفية تأكيد الحضور

أو تواصلوا معنا مباشرة على:
📞 [رقم الهاتف]

نحن هنا لمساعدتكم! 💕`
    };

    await this.sendMessage(message);
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