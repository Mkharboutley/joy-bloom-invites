interface ZokoConfig {
  apiKey: string;
  baseUrl: string;
  phoneNumberId: string;
  businessAccountId: string;
}

interface ZokoMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: string;
      parameters: Array<{ type: string; text: string }>;
    }>;
  };
  image?: { link: string; caption?: string };
  document?: { link: string; filename: string };
}

interface ZokoWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { phone_number_id: string; display_phone_number: string };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
          context?: { from: string; id: string };
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
          errors?: Array<{ code: number; title: string; message: string }>;
        }>;
      };
      field: string;
    }>;
  }>;
}

class ZokoWhatsAppService {
  private static instance: ZokoWhatsAppService;
  private config: ZokoConfig;

  private constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_ZOKO_API_KEY || '',
      baseUrl: import.meta.env.VITE_ZOKO_BASE_URL || 'https://api.zoko.io/v2',
      phoneNumberId: import.meta.env.VITE_ZOKO_PHONE_NUMBER_ID || '',
      businessAccountId: import.meta.env.VITE_ZOKO_BUSINESS_ACCOUNT_ID || '',
    };

    if (!this.config.apiKey || !this.config.phoneNumberId) {
      console.warn('Zoko credentials not found. Please set VITE_ZOKO_API_KEY and VITE_ZOKO_PHONE_NUMBER_ID');
    }
  }

  public static getInstance(): ZokoWhatsAppService {
    if (!ZokoWhatsAppService.instance) {
      ZokoWhatsAppService.instance = new ZokoWhatsAppService();
    }
    return ZokoWhatsAppService.instance;
  }

  /**
   * Send WhatsApp message via Zoko API
   */
  async sendMessage(message: ZokoMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Zoko API Error:', result);
        return {
          success: false,
          error: result.error?.message || result.message || 'Failed to send message'
        };
      }

      console.log('Zoko message sent successfully:', result.messages?.[0]?.id);
      return {
        success: true,
        messageId: result.messages?.[0]?.id
      };
    } catch (error: any) {
      console.error('Error sending Zoko message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message'
      };
    }
  }

  /**
   * Send wedding invitation with Arabic content
   */
  async sendWeddingInvitation(phoneNumber: string, guestName: string, mediaUrl?: string): Promise<boolean> {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    
    const message: ZokoMessage = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: {
        body: `💌 *دعوة حفل زفاف*

${guestName} الكريم/ة،

يشرفنا دعوتكم لحضور حفل زفافنا المبارك:

🌹 *تفاصيل الحفل:*
📅 التاريخ: الجمعة، ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

🗺️ *موقع الفندق:*
https://maps.app.goo.gl/E9sp6ayDb96DTnNG6

✨ *لتأكيد حضوركم:*
${window.location.origin}

بحضوركم تكتمل سعادتنا! 💕
نتطلع لرؤيتكم في هذا اليوم المميز

_للاستفسارات، يرجى الرد على هذه الرسالة_`
      }
    };

    // If media URL is provided, send as image message
    if (mediaUrl) {
      const mediaMessage: ZokoMessage = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'image',
        image: {
          link: mediaUrl,
          caption: `دعوة حفل زفاف - ${guestName}`
        }
      };
      
      // Send media first, then text
      await this.sendMessage(mediaMessage);
    }

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send confirmation notification to admin
   */
  async sendConfirmationNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    
    const message: ZokoMessage = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: {
        body: `🎉 *تأكيد حضور جديد!*

الضيف: *${guestName}*
رقم الدعوة: ${invitationId}
الوقت: ${new Date().toLocaleString('ar-SA')}

📊 *إحصائيات سريعة:*
• تم تأكيد الحضور بنجاح
• يمكن مراجعة التفاصيل في لوحة التحكم

_تم الإرسال تلقائياً من نظام إدارة الدعوات_`
      }
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send apology notification to admin
   */
  async sendApologyNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const cleanPhone = this.formatPhoneNumber(phoneNumber);
    
    const message: ZokoMessage = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: {
        body: `😔 *اعتذار عن الحضور*

الضيف: *${guestName}*
رقم الدعوة: ${invitationId}
الوقت: ${new Date().toLocaleString('ar-SA')}

📊 *تحديث الإحصائيات:*
• تم تسجيل الاعتذار
• يمكن مراجعة التفاصيل في لوحة التحكم

_تم الإرسال تلقائياً من نظام إدارة الدعوات_`
      }
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send bulk invitations
   */
  async sendBulkInvitations(
    contacts: Array<{ name: string; phoneNumber: string }>,
    mediaUrl?: string,
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ successful: number; failed: number; results: Array<{ contact: any; success: boolean; error?: string; messageId?: string }> }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        const success = await this.sendWeddingInvitation(contact.phoneNumber, contact.name, mediaUrl);
        
        if (success) {
          successful++;
          results.push({
            contact,
            success: true
          });
        } else {
          failed++;
          results.push({
            contact,
            success: false,
            error: 'Failed to send invitation'
          });
        }

        // Update progress
        if (onProgress) {
          onProgress(i + 1, contacts.length);
        }

        // Add delay to avoid rate limiting (Zoko allows 80 messages/minute)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        failed++;
        results.push({
          contact,
          success: false,
          error: error.message || 'Unknown error'
        });
        console.error(`Error sending to ${contact.name}:`, error);
      }
    }

    return { successful, failed, results };
  }

  /**
   * Handle incoming webhook from Zoko
   */
  async handleWebhook(webhookData: ZokoWebhook): Promise<void> {
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            // Handle incoming messages
            if (change.value.messages) {
              for (const message of change.value.messages) {
                await this.handleIncomingMessage(message, change.value.metadata.phone_number_id);
              }
            }

            // Handle message status updates
            if (change.value.statuses) {
              for (const status of change.value.statuses) {
                await this.handleMessageStatus(status);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling Zoko webhook:', error);
    }
  }

  /**
   * Handle incoming message and send auto-response
   */
  private async handleIncomingMessage(message: any, phoneNumberId: string): Promise<void> {
    const from = message.from;
    const messageText = message.text?.body?.toLowerCase() || '';

    console.log(`Received message from ${from}: ${message.text?.body}`);

    let responseMessage = '';

    // Auto-respond based on message content
    if (messageText.includes('موقع') || messageText.includes('عنوان') || messageText.includes('مكان')) {
      responseMessage = `📍 *موقع فندق إرث:*

🏨 العنوان: فندق إرث
🗺️ رابط الخريطة: https://maps.app.goo.gl/E9sp6ayDb96DTnNG6

🚗 *معلومات إضافية:*
• يتوفر موقف سيارات مجاني
• يمكن الوصول بسهولة عبر أوبر/كريم

نتطلع لرؤيتكم! 🎉`;

    } else if (messageText.includes('وقت') || messageText.includes('تاريخ') || messageText.includes('متى')) {
      responseMessage = `🎊 *تفاصيل حفل الزفاف:*

📅 التاريخ: الجمعة، ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

⏰ *ملاحظات مهمة:*
• يُفضل الحضور قبل ١٥ دقيقة
• الحفل سيبدأ في الموعد المحدد

بحضوركم تكتمل سعادتنا! ✨`;

    } else if (messageText.includes('تأكيد') || messageText.includes('حضور')) {
      responseMessage = `🎉 *تأكيد الحضور:*

لتأكيد حضوركم، يرجى زيارة الرابط التالي:
${window.location.origin}

أو يمكنكم الرد بـ:
• "نعم" أو "موافق" لتأكيد الحضور
• "لا" أو "اعتذر" للاعتذار

شكراً لكم! 💕`;

    } else if (messageText.includes('نعم') || messageText.includes('موافق') || messageText.includes('أوافق')) {
      responseMessage = `✅ *تم تأكيد حضوركم!*

شكراً لكم! تم تأكيد حضوركم لحفل الزفاف.

📋 *تفاصيل سريعة:*
📅 الجمعة، ٤ يوليو ٢٠٢٥
🕰️ ٨:٣٠ مساءً
📍 فندق إرث

🎫 سيتم إرسال رمز QR للدعوة قريباً.
نتطلع لرؤيتكم! 🎊`;

    } else if (messageText.includes('لا') || messageText.includes('اعتذر') || messageText.includes('أعتذر')) {
      responseMessage = `😔 *اعتذار مقبول*

تم استلام اعتذاركم عن الحضور.
نتفهم ظروفكم ونتطلع لرؤيتكم في مناسبة قادمة إن شاء الله.

شكراً لإعلامنا مسبقاً. 🤍`;

    } else {
      responseMessage = `أهلاً وسهلاً! 🙏

شكراً لتواصلكم معنا!

🔍 *للاستفسارات السريعة:*
• اكتبوا "موقع" لمعرفة عنوان الفندق
• اكتبوا "وقت" لمعرفة تفاصيل الحفل  
• اكتبوا "تأكيد" لتأكيد الحضور

أو تواصلوا معنا مباشرة للمساعدة.
بحضوركم تكتمل سعادتنا! 💕`;
    }

    // Send auto-response
    if (responseMessage) {
      const autoResponse: ZokoMessage = {
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: responseMessage }
      };

      const result = await this.sendMessage(autoResponse);
      if (result.success) {
        console.log('Auto-response sent successfully');
      } else {
        console.error('Failed to send auto-response:', result.error);
      }
    }
  }

  /**
   * Handle message status updates
   */
  private async handleMessageStatus(status: any): Promise<void> {
    console.log(`Message ${status.id} status: ${status.status} for ${status.recipient_id}`);
    
    // Here you could update your database with the message status
    // For example, update notification_logs table
    if (status.errors && status.errors.length > 0) {
      console.error('Message delivery error:', status.errors);
    }
  }

  /**
   * Get message analytics
   */
  async getMessageAnalytics(messageId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/messages/${messageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch message analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching message analytics:', error);
      return null;
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
   * Format phone number for Zoko (no whatsapp: prefix needed)
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters and any whatsapp: prefix
    let cleaned = phoneNumber.replace(/\D/g, '').replace('whatsapp:', '');
    
    // Add country code if missing (assuming Saudi Arabia +966)
    if (!cleaned.startsWith('966') && cleaned.length === 9) {
      cleaned = '966' + cleaned;
    }
    
    // Zoko expects format without + prefix
    return cleaned;
  }

  /**
   * Test connection to Zoko API
   */
  async testConnection(): Promise<{ success: boolean; error?: string; phoneNumber?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/phone_numbers/${this.config.phoneNumberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'Failed to connect to Zoko API'
        };
      }

      const result = await response.json();
      return {
        success: true,
        phoneNumber: result.display_phone_number
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection failed'
      };
    }
  }
}

export default ZokoWhatsAppService;
export type { ZokoMessage, ZokoWebhook };