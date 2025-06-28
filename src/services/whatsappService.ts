interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: { body: string };
  template?: any;
  interactive?: any;
}

interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { phone_number_id: string };
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

class WhatsAppService {
  private static instance: WhatsAppService;
  private accessToken: string;
  private phoneNumberId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  private constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('WhatsApp API Error:', result);
        return false;
      }

      console.log('WhatsApp message sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendConfirmationNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'wedding_confirmation',
        language: { code: 'ar' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: invitationId },
              { type: 'text', text: new Date().toLocaleDateString('ar-SA') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  async sendApologyNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'wedding_apology',
        language: { code: 'ar' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: invitationId },
              { type: 'text', text: new Date().toLocaleDateString('ar-SA') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  async sendInteractiveMessage(phoneNumber: string, guestName: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `مرحباً ${guestName}! 🎉\n\nتم تأكيد حضورك لحفل الزفاف.\nالتاريخ: ٤ يوليو ٢٠٢٥\nالمكان: فندق إرث`
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'view_details',
                title: 'عرض التفاصيل'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'get_location',
                title: 'موقع الفندق'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'contact_support',
                title: 'تواصل معنا'
              }
            }
          ]
        }
      }
    };

    return this.sendMessage(message);
  }

  async handleWebhook(webhookData: WhatsAppWebhook): Promise<void> {
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            // Handle incoming messages
            if (change.value.messages) {
              for (const message of change.value.messages) {
                await this.handleIncomingMessage(message);
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
      console.error('Error handling WhatsApp webhook:', error);
    }
  }

  private async handleIncomingMessage(message: any): Promise<void> {
    const from = message.from;
    const messageText = message.text?.body || '';

    console.log(`Received message from ${from}: ${messageText}`);

    // Auto-respond to common queries
    if (messageText.toLowerCase().includes('موقع') || messageText.toLowerCase().includes('عنوان')) {
      await this.sendLocationMessage(from);
    } else if (messageText.toLowerCase().includes('وقت') || messageText.toLowerCase().includes('تاريخ')) {
      await this.sendEventDetailsMessage(from);
    } else {
      await this.sendDefaultResponse(from);
    }
  }

  private async handleMessageStatus(status: any): Promise<void> {
    console.log(`Message ${status.id} status: ${status.status} for ${status.recipient_id}`);
    
    // Update notification logs in database
    // This would integrate with your existing notification logging system
  }

  private async sendLocationMessage(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `📍 موقع فندق إرث:\n\nالعنوان: [عنوان الفندق]\nرابط الخريطة: https://maps.app.goo.gl/E9sp6ayDb96DTnNG6\n\nنتطلع لرؤيتكم! 🎉`
      }
    };

    await this.sendMessage(message);
  }

  private async sendEventDetailsMessage(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `🎊 تفاصيل حفل الزفاف:\n\n📅 التاريخ: الجمعة، ٤ يوليو ٢٠٢٥\n🕰️ الوقت: ٨:٣٠ مساءً\n📍 المكان: فندق إرث\n\nبحضوركم تكتمل سعادتنا! ✨`
      }
    };

    await this.sendMessage(message);
  }

  private async sendDefaultResponse(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `شكراً لتواصلكم معنا! 🙏\n\nللاستفسارات:\n• اكتبوا "موقع" لمعرفة عنوان الفندق\n• اكتبوا "وقت" لمعرفة تفاصيل الحفل\n\nأو تواصلوا معنا مباشرة على: [رقم الهاتف]`
      }
    };

    await this.sendMessage(message);
  }
}

export default WhatsAppService;