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
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    
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
    console.log('MessageBird response:', data);

    if (response.ok) {
      return {
        success: true,
        messageId: data.id
      };
    } else {
      return {
        success: false,
        error: data.errors?.[0]?.description || `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    console.error('MessageBird SMS Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

export const sendBulkSMS = async (
  contacts: Array<{ phoneNumber: string; message: string }>,
  apiKey: string
): Promise<Array<SMSResponse & { phoneNumber: string }>> => {
  const results = [];
  
  console.log(`Sending bulk SMS to ${contacts.length} contacts`);
  
  // Send SMS with delay to avoid rate limiting
  for (const contact of contacts) {
    try {
      const result = await sendSMS(contact.phoneNumber, contact.message, apiKey);
      results.push({
        ...result,
        phoneNumber: contact.phoneNumber
      });
      
      console.log(`SMS result for ${contact.phoneNumber}:`, result);
      
      // Add 200ms delay between requests to avoid rate limiting
      if (contacts.indexOf(contact) < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`Error sending SMS to ${contact.phoneNumber}:`, error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        phoneNumber: contact.phoneNumber
      });
    }
  }
  
  return results;
};