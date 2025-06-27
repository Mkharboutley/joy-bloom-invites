// MessageBird Webhook Service for Real-time Notifications
import { getApiBaseUrl } from './messageBirdService';

export interface WebhookEvent {
  id: string;
  type: 'message.delivered' | 'message.failed' | 'message.sent';
  data: {
    id: string;
    recipient: string;
    status: string;
    statusReason?: string;
    timestamp: string;
  };
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger: 'guest_confirmation' | 'guest_apology' | 'delivery_status' | 'failed_delivery';
  enabled: boolean;
  recipients: string[];
  template: string;
  conditions?: {
    phonePrefix?: string; // e.g., "971" for UAE
    timeDelay?: number; // minutes
  };
}

// Webhook endpoint handler for MessageBird status updates
export const handleMessageBirdWebhook = async (webhookData: WebhookEvent) => {
  try {
    console.log('📨 MessageBird webhook received:', webhookData);
    
    // Update delivery status in our database
    await updateDeliveryStatus(webhookData.data.id, webhookData.data.status);
    
    // Handle failed deliveries
    if (webhookData.type === 'message.failed') {
      await handleFailedDelivery(webhookData.data);
    }
    
    // Handle successful deliveries
    if (webhookData.type === 'message.delivered') {
      await handleSuccessfulDelivery(webhookData.data);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    throw error;
  }
};

// Update delivery status in notification logs
const updateDeliveryStatus = async (messageId: string, status: string) => {
  // This would update the notification_logs table with delivery status
  console.log(`📊 Updating delivery status for message ${messageId}: ${status}`);
};

// Handle failed delivery notifications
const handleFailedDelivery = async (data: WebhookEvent['data']) => {
  console.log(`❌ Message failed to ${data.recipient}: ${data.statusReason}`);
  
  // Check if it's a UAE number
  const isUAE = data.recipient.startsWith('971');
  if (isUAE) {
    console.log('🇦🇪 UAE delivery failed - may need alternative approach');
  }
  
  // Could trigger admin notification about failed delivery
};

// Handle successful delivery confirmations
const handleSuccessfulDelivery = async (data: WebhookEvent['data']) => {
  console.log(`✅ Message delivered successfully to ${data.recipient}`);
  
  // Update internal tracking
  // Could trigger follow-up actions
};

// Setup webhook URL for MessageBird
export const setupMessageBirdWebhook = async (apiKey: string, webhookUrl: string) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ['message.delivered', 'message.failed', 'message.sent']
      })
    });
    
    if (response.ok) {
      const webhook = await response.json();
      console.log('✅ MessageBird webhook configured:', webhook);
      return webhook;
    } else {
      throw new Error(`Failed to setup webhook: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Webhook setup failed:', error);
    throw error;
  }
};

// Get webhook status
export const getWebhookStatus = async (apiKey: string) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const webhooks = await response.json();
      return webhooks;
    } else {
      throw new Error(`Failed to get webhooks: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to get webhook status:', error);
    throw error;
  }
};