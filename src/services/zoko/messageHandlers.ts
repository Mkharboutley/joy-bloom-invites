
import type { ZokoMessage, ZokoWebhook } from './types';

/**
 * Message handlers for Zoko WhatsApp service
 */
export class ZokoMessageHandlers {
  constructor(private sendMessage: (message: ZokoMessage) => Promise<{ success: boolean; messageId?: string; error?: string }>) {}

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
}
