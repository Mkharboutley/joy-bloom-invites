// MessageBird SMS Service
export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendSMS = async (
  phoneNumber: string, 
  message: string, 
  apiKey: string
): Promise<SMSResponse> => {
  try {
    const response = await fetch('https://rest.messagebird.com/messages', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients: [phoneNumber],
        originator: 'Wedding',
        body: message
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.id
      };
    } else {
      return {
        success: false,
        error: data.errors?.[0]?.description || 'Failed to send SMS'
      };
    }
  } catch (error) {
    console.error('MessageBird SMS Error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

export const sendBulkSMS = async (
  contacts: Array<{ phoneNumber: string; message: string }>,
  apiKey: string
): Promise<Array<SMSResponse & { phoneNumber: string }>> => {
  const results = [];
  
  // Send SMS with delay to avoid rate limiting
  for (const contact of contacts) {
    const result = await sendSMS(contact.phoneNumber, contact.message, apiKey);
    results.push({
      ...result,
      phoneNumber: contact.phoneNumber
    });
    
    // Add 100ms delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};