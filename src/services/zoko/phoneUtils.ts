/**
 * Phone number utilities for Zoko WhatsApp service
 */
export class ZokoPhoneUtils {
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
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters and any whatsapp: prefix
    let cleaned = phoneNumber.replace(/\D/g, '').replace('whatsapp:', '');
    
    // If it starts with 971 (UAE), keep as is
    if (cleaned.startsWith('971')) {
      return cleaned;
    }
    
    // Add UAE country code if missing and number looks like UAE mobile
    if (cleaned.length === 9 && (cleaned.startsWith('5') || cleaned.startsWith('50') || cleaned.startsWith('52') || cleaned.startsWith('54') || cleaned.startsWith('55') || cleaned.startsWith('56'))) {
      cleaned = '971' + cleaned;
    }
    
    // Add Saudi country code if missing and number looks like Saudi mobile
    if (cleaned.length === 9 && cleaned.startsWith('5')) {
      cleaned = '966' + cleaned;
    }
    
    // Zoko expects format without + prefix
    return cleaned;
  }
}
