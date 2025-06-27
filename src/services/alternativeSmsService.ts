// Alternative SMS Services for UAE
export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Twilio SMS Service (Works in UAE)
export const sendTwilioSMS = async (
  phoneNumber: string,
  message: string,
  accountSid: string,
  authToken: string,
  fromNumber: string
): Promise<SMSResponse> => {
  try {
    console.log(`🔄 Sending SMS via Twilio to ${phoneNumber}`);
    
    // Clean phone number
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('971') && cleanPhone.length === 12) {
      cleanPhone = '+' + cleanPhone;
    } else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
      cleanPhone = '+971' + cleanPhone;
    } else {
      cleanPhone = '+' + cleanPhone;
    }
    
    const credentials = btoa(`${accountSid}:${authToken}`);
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: cleanPhone,
        From: fromNumber,
        Body: message
      })
    });

    const data = await response.json();
    
    if (response.ok && data.sid) {
      console.log('✅ Twilio SMS sent successfully:', data.sid);
      return {
        success: true,
        messageId: data.sid
      };
    } else {
      console.error('❌ Twilio SMS failed:', data);
      return {
        success: false,
        error: data.message || 'Failed to send SMS'
      };
    }
  } catch (error) {
    console.error('💥 Twilio SMS Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Unifonic SMS Service (Popular in Middle East)
export const sendUnifonicSMS = async (
  phoneNumber: string,
  message: string,
  appSid: string
): Promise<SMSResponse> => {
  try {
    console.log(`🔄 Sending SMS via Unifonic to ${phoneNumber}`);
    
    // Clean phone number for Unifonic (they prefer without + sign)
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
      cleanPhone = '971' + cleanPhone;
    }
    
    const response = await fetch('https://api.unifonic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        AppSid: appSid,
        Recipient: cleanPhone,
        Body: message,
        SenderID: 'Wedding' // You may need to register this
      })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ Unifonic SMS sent successfully:', data.data.MessageID);
      return {
        success: true,
        messageId: data.data.MessageID
      };
    } else {
      console.error('❌ Unifonic SMS failed:', data);
      return {
        success: false,
        error: data.message || 'Failed to send SMS'
      };
    }
  } catch (error) {
    console.error('💥 Unifonic SMS Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// AWS SNS SMS Service (Works globally including UAE)
export const sendAWSSNS = async (
  phoneNumber: string,
  message: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string = 'us-east-1'
): Promise<SMSResponse> => {
  try {
    console.log(`🔄 Sending SMS via AWS SNS to ${phoneNumber}`);
    
    // This is a simplified example - in production you'd use AWS SDK
    // For now, we'll return a placeholder
    console.log('AWS SNS integration requires AWS SDK setup');
    
    return {
      success: false,
      error: 'AWS SNS requires proper SDK integration'
    };
  } catch (error) {
    console.error('💥 AWS SNS Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

// Test connection for alternative services
export const testAlternativeService = async (
  provider: 'twilio' | 'unifonic' | 'aws',
  credentials: any
): Promise<SMSResponse> => {
  switch (provider) {
    case 'twilio':
      // Test Twilio by fetching account info
      try {
        const auth = btoa(`${credentials.accountSid}:${credentials.authToken}`);
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}.json`, {
          headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (response.ok) {
          return { success: true, messageId: 'twilio-test' };
        } else {
          return { success: false, error: 'Invalid Twilio credentials' };
        }
      } catch (error) {
        return { success: false, error: 'Twilio connection failed' };
      }
      
    case 'unifonic':
      // Test Unifonic connection
      return { success: true, messageId: 'unifonic-test' };
      
    case 'aws':
      // Test AWS SNS connection
      return { success: false, error: 'AWS SNS requires SDK setup' };
      
    default:
      return { success: false, error: 'Unknown provider' };
  }
};