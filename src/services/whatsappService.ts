interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive' | 'image' | 'document';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: string;
      parameters?: Array<{
        type: string;
        text?: string;
        image?: { link: string };
        document?: { link: string; filename: string };
      }>;
    }>;
  };
  interactive?: any;
  image?: { link: string; caption?: string };
  document?: { link: string; filename: string; caption?: string };
}

interface WhatsAppContact {
  id: string;
  name: string;
  phone_number: string;
  selected: boolean;
  template_id?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document';
  is_active: boolean;
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
  private businessAccountId: string;
  private apiVersion: string;
  private baseUrl: string;

  private constructor() {
    // Get configuration from environment variables
    this.accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
    this.businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    this.apiVersion = import.meta.env.VITE_WHATSAPP_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

    // Validate required configuration
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp configuration incomplete. Please check environment variables.');
    }
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Check if service is properly configured
  public isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }

  // Send a single message
  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'WhatsApp service not configured' };
    }

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
        return { 
          success: false, 
          error: result.error?.message || 'Failed to send message' 
        };
      }

      console.log('WhatsApp message sent:', result);
      return { 
        success: true, 
        messageId: result.messages?.[0]?.id 
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send bulk messages using a template
  async sendBulkInvitations(
    contacts: WhatsAppContact[], 
    template: WhatsAppTemplate,
    onProgress?: (sent: number, total: number, current: WhatsAppContact) => void
  ): Promise<{ success: number; failed: number; results: Array<{ contact: WhatsAppContact; success: boolean; error?: string }> }> {
    const results: Array<{ contact: WhatsAppContact; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        // Create message based on template
        const message = await this.createTemplateMessage(contact, template);
        const result = await this.sendMessage(message);
        
        if (result.success) {
          successCount++;
          results.push({ contact, success: true });
        } else {
          failedCount++;
          results.push({ contact, success: false, error: result.error });
        }

        // Call progress callback
        if (onProgress) {
          onProgress(successCount + failedCount, contacts.length, contact);
        }

        // Add delay between messages to avoid rate limiting
        if (i < contacts.length - 1) {
          await this.delay(1000); // 1 second delay
        }

      } catch (error) {
        failedCount++;
        results.push({ 
          contact, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return { success: successCount, failed: failedCount, results };
  }

  // Create a message from template and contact data
  private async createTemplateMessage(contact: WhatsAppContact, template: WhatsAppTemplate): Promise<WhatsAppMessage> {
    // Format phone number (ensure it starts with country code)
    const phoneNumber = this.formatPhoneNumber(contact.phone_number);

    // If template has media, create media message
    if (template.media_url && template.media_type) {
      if (template.media_type === 'image') {
        return {
          to: phoneNumber,
          type: 'image',
          image: {
            link: template.media_url,
            caption: this.personalizeMessage(template.message, contact)
          }
        };
      } else if (template.media_type === 'document') {
        return {
          to: phoneNumber,
          type: 'document',
          document: {
            link: template.media_url,
            filename: `invitation_${contact.name.replace(/\s+/g, '_')}.pdf`,
            caption: this.personalizeMessage(template.message, contact)
          }
        };
      }
    }

    // Default to text message
    return {
      to: phoneNumber,
      type: 'text',
      text: {
        body: this.personalizeMessage(template.message, contact)
      }
    };
  }

  // Personalize message with contact data
  private personalizeMessage(message: string, contact: WhatsAppContact): string {
    return message
      .replace(/\{name\}/g, contact.name)
      .replace(/\{first_name\}/g, contact.name.split(' ')[0])
      .replace(/\{phone\}/g, contact.phone_number);
  }

  // Format phone number to international format
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, replace with country code (assuming Saudi Arabia +966)
    if (cleaned.startsWith('0')) {
      cleaned = '966' + cleaned.substring(1);
    }
    
    // If it doesn't start with country code, add Saudi Arabia code
    if (!cleaned.startsWith('966')) {
      cleaned = '966' + cleaned;
    }
    
    return cleaned;
  }

  // Send wedding confirmation notification
  async sendConfirmationNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(phoneNumber),
      type: 'text',
      text: {
        body: `🎉 تم تأكيد حضوركم لحفل الزفاف!\n\nعزيزي/عزيزتي ${guestName}\nرقم الدعوة: ${invitationId}\n\nتفاصيل الحفل:\n📅 التاريخ: ٤ يوليو ٢٠٢٥\n🕰️ الوقت: ٨:٣٠ مساءً\n📍 المكان: فندق إرث\n\nبحضوركم تكتمل سعادتنا! ✨`
      }
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  // Send apology notification
  async sendApologyNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(phoneNumber),
      type: 'text',
      text: {
        body: `نتفهم ظروفكم 🤗\n\nعزيزي/عزيزتي ${guestName}\nتم تسجيل اعتذاركم عن حضور حفل الزفاف\nرقم الدعوة: ${invitationId}\n\nنتطلع لرؤيتكم في مناسبة قادمة إن شاء الله 💙`
      }
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  // Send interactive message with buttons
  async sendInteractiveInvitation(phoneNumber: string, guestName: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: this.formatPhoneNumber(phoneNumber),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `مرحباً ${guestName}! 🎉\n\nيسعدنا دعوتكم لحضور حفل زفافنا\n\n📅 التاريخ: ٤ يوليو ٢٠٢٥\n🕰️ الوقت: ٨:٣٠ مساءً\n📍 المكان: فندق إرث\n\nبحضوركم تكتمل سعادتنا! ✨`
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'confirm_attendance',
                title: 'تأكيد الحضور'
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
                id: 'contact_us',
                title: 'تواصل معنا'
              }
            }
          ]
        }
      }
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  // Handle incoming webhook messages
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

  // Handle incoming messages with auto-responses
  private async handleIncomingMessage(message: any): Promise<void> {
    const from = message.from;
    const messageText = message.text?.body?.toLowerCase() || '';

    console.log(`Received message from ${from}: ${messageText}`);

    // Auto-respond based on message content
    if (messageText.includes('موقع') || messageText.includes('عنوان') || messageText.includes('مكان')) {
      await this.sendLocationMessage(from);
    } else if (messageText.includes('وقت') || messageText.includes('تاريخ') || messageText.includes('متى')) {
      await this.sendEventDetailsMessage(from);
    } else if (messageText.includes('تأكيد') || messageText.includes('حضور')) {
      await this.sendConfirmationInstructions(from);
    } else {
      await this.sendDefaultResponse(from);
    }
  }

  // Handle message delivery status
  private async handleMessageStatus(status: any): Promise<void> {
    console.log(`Message ${status.id} status: ${status.status} for ${status.recipient_id}`);
    
    // Here you could update your database with delivery status
    // This helps track which invitations were successfully delivered
  }

  // Send location information
  private async sendLocationMessage(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `📍 موقع فندق إرث:\n\nالعنوان: [عنوان الفندق]\nرابط الخريطة: https://maps.app.goo.gl/E9sp6ayDb96DTnNG6\n\nللاستفسارات: [رقم الهاتف]\n\nنتطلع لرؤيتكم! 🎉`
      }
    };

    await this.sendMessage(message);
  }

  // Send event details
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

  // Send confirmation instructions
  private async sendConfirmationInstructions(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `لتأكيد حضوركم، يرجى زيارة الرابط التالي:\n\n🔗 [رابط تأكيد الحضور]\n\nأو يمكنكم الرد برسالة تحتوي على اسمكم الكامل.\n\nشكراً لكم! 💙`
      }
    };

    await this.sendMessage(message);
  }

  // Send default auto-response
  private async sendDefaultResponse(phoneNumber: string): Promise<void> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: 'text',
      text: {
        body: `شكراً لتواصلكم معنا! 🙏\n\nللاستفسارات:\n• اكتبوا "موقع" لمعرفة عنوان الفندق\n• اكتبوا "وقت" لمعرفة تفاصيل الحفل\n• اكتبوا "تأكيد" لتأكيد الحضور\n\nأو تواصلوا معنا مباشرة على: [رقم الهاتف]`
      }
    };

    await this.sendMessage(message);
  }

  // Utility function to add delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get message templates (this would typically come from your database)
  async getMessageTemplates(): Promise<WhatsAppTemplate[]> {
    // This is a placeholder - in a real app, you'd fetch from your database
    return [
      {
        id: '1',
        name: 'دعوة زفاف أساسية',
        message: 'مرحباً {name}! يسعدنا دعوتكم لحضور حفل زفافنا في ٤ يوليو ٢٠٢٥ بفندق إرث. بحضوركم تكتمل سعادتنا!',
        is_active: true
      },
      {
        id: '2',
        name: 'دعوة مع صورة',
        message: 'عزيزي/عزيزتي {name}، ندعوكم لمشاركتنا أجمل لحظات حياتنا!',
        media_url: '/wedding-invitation.jpg',
        media_type: 'image',
        is_active: true
      }
    ];
  }
}

export default WhatsAppService;
export type { WhatsAppMessage, WhatsAppContact, WhatsAppTemplate };