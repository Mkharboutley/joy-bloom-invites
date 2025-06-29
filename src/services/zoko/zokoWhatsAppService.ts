
import type { ZokoConfig, ZokoMessage, ZokoWebhook, BulkInvitationResult, ZokoApiResponse } from './types';
import { ZokoApiClient } from './apiClient';
import { ZokoMessageHandlers } from './messageHandlers';
import { ZokoPhoneUtils } from './phoneUtils';

class ZokoWhatsAppService {
  private static instance: ZokoWhatsAppService;
  private config: ZokoConfig;
  private apiClient: ZokoApiClient;
  private messageHandlers: ZokoMessageHandlers;

  private constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_ZOKO_API_KEY || 'fb6eb899-2760-405e-9dd0-c64282cad3ad',
      baseUrl: import.meta.env.VITE_ZOKO_BASE_URL || 'https://api.zoko.io/v2',
      phoneNumberId: import.meta.env.VITE_ZOKO_PHONE_NUMBER_ID || '971552439798',
      businessAccountId: import.meta.env.VITE_ZOKO_BUSINESS_ACCOUNT_ID || '127123111032763',
    };

    this.apiClient = new ZokoApiClient(this.config);
    this.messageHandlers = new ZokoMessageHandlers(this.sendMessage.bind(this));

    console.log('Zoko Config:', {
      apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 8)}...` : 'NOT SET',
      baseUrl: this.config.baseUrl,
      phoneNumberId: this.config.phoneNumberId,
      businessAccountId: this.config.businessAccountId,
    });

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
  async sendMessage(message: ZokoMessage): Promise<ZokoApiResponse> {
    try {
      console.log('Sending Zoko message:', message);
      
      const result = await this.apiClient.callZokoAPI('send_message', { message });
      
      console.log('Zoko API Response:', result);
      return result;
    } catch (error: any) {
      console.error('Error sending Zoko message:', error);
      return {
        success: false,
        error: error.message || 'Network error - failed to send message'
      };
    }
  }

  /**
   * Send wedding invitation with Arabic content
   */
  async sendWeddingInvitation(phoneNumber: string, guestName: string, mediaUrl?: string): Promise<boolean> {
    const cleanPhone = ZokoPhoneUtils.formatPhoneNumber(phoneNumber);
    
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
    const cleanPhone = ZokoPhoneUtils.formatPhoneNumber(phoneNumber);
    
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

_تم الإرسال تلقائياً من نظام إدارة الدعوات عبر Zoko_`
      }
    };

    const result = await this.sendMessage(message);
    return result.success;
  }

  /**
   * Send apology notification to admin
   */
  async sendApologyNotification(phoneNumber: string, guestName: string, invitationId: string): Promise<boolean> {
    const cleanPhone = ZokoPhoneUtils.formatPhoneNumber(phoneNumber);
    
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

_تم الإرسال تلقائياً من نظام إدارة الدعوات عبر Zoko_`
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
  ): Promise<BulkInvitationResult> {
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
    return this.messageHandlers.handleWebhook(webhookData);
  }

  /**
   * Get message analytics
   */
  async getMessageAnalytics(messageId: string): Promise<any> {
    try {
      const result = await this.apiClient.callZokoAPI('get_analytics', { messageId });
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching message analytics:', error);
      return null;
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    return ZokoPhoneUtils.validatePhoneNumber(phoneNumber);
  }

  /**
   * Format phone number for Zoko (no whatsapp: prefix needed)
   */
  formatPhoneNumber(phoneNumber: string): string {
    return ZokoPhoneUtils.formatPhoneNumber(phoneNumber);
  }

  /**
   * Test connection to Zoko API
   */
  async testConnection(): Promise<{ success: boolean; error?: string; phoneNumber?: string }> {
    return this.apiClient.testConnection();
  }
}

export default ZokoWhatsAppService;
export type { ZokoMessage, ZokoWebhook };
