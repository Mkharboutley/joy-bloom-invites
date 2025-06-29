
export interface ZokoConfig {
  apiKey: string;
  baseUrl: string;
  phoneNumberId: string;
  businessAccountId: string;
}

export interface ZokoMessage {
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

export interface ZokoWebhook {
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

export interface BulkInvitationResult {
  successful: number;
  failed: number;
  results: Array<{
    contact: { name: string; phoneNumber: string };
    success: boolean;
    error?: string;
    messageId?: string;
  }>;
}

export interface ZokoApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}
