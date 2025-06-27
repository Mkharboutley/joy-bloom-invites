// MessageBird SMS Service - Updated for UAE Support
export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Test MessageBird connection without sending actual SMS
export const testMessageBirdConnection = async (apiKey: string): Promise<SMSResponse> => {
  try {
    console.log('🧪 Testing MessageBird API connection...');
    console.log(`📱 Using API Key: ${apiKey.substring(0, 8)}...`);
    
    // Validate API key format
    if (!apiKey || apiKey.trim().length < 10) {
      console.error('❌ Invalid API key format');
      return {
        success: false,
        error: 'Invalid API key format - must be at least 10 characters'
      };
    }
    
    // Test API key by making a simple balance request
    const response = await fetch('https://rest.messagebird.com/balance', {
      method: 'GET',
      headers: {
        'Authorization': `AccessKey ${apiKey.trim()}`,
        'Accept': 'application/json'
      }
    });

    console.log(`📡 Balance API Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📥 Balance API Raw response:', responseText);
    
    if (response.ok) {
      console.log('✅ MessageBird API key is valid');
      return {
        success: true,
        messageId: 'connection-test'
      };
    } else {
      // Handle specific API key errors
      if (response.status === 401 || response.status === 403) {
        const errorMsg = 'Invalid API key or insufficient permissions. Please check your MessageBird API key.';
        console.error('❌ Authentication error:', errorMsg);
        return {
          success: false,
          error: errorMsg
        };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse error response as JSON:', parseError);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const errorMsg = data.errors?.[0]?.description || 
                      data.error || 
                      `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ API key test failed:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  } catch (error) {
    console.error('💥 MessageBird Connection Test Error:', error);
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error - please check your internet connection'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

export const sendSMS = async (
  phoneNumber: string, 
  message: string, 
  apiKey: string
): Promise<SMSResponse> => {
  try {
    console.log(`🔄 Sending SMS to ${phoneNumber}: ${message}`);
    console.log(`📱 Using API Key: ${apiKey.substring(0, 8)}...`);
    
    // Validate API key format
    if (!apiKey || apiKey.trim().length < 10) {
      console.error('❌ Invalid API key format');
      return {
        success: false,
        error: 'Invalid API key format - must be at least 10 characters'
      };
    }
    
    // Clean phone number and handle UAE numbers specifically
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Handle UAE numbers (971) - MessageBird supports UAE
    if (cleanPhone.startsWith('971')) {
      // UAE number is already in correct format
      console.log(`🇦🇪 UAE number detected: ${cleanPhone}`);
    }
    // Handle local UAE numbers (9 digits starting with 5)
    else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
      cleanPhone = '971' + cleanPhone;
      console.log(`🇦🇪 Local UAE number converted to: ${cleanPhone}`);
    }
    // Handle Saudi numbers (966)
    else if (cleanPhone.startsWith('966')) {
      // Saudi number is already in correct format
      console.log(`🇸🇦 Saudi number detected: ${cleanPhone}`);
    }
    // Handle other formats
    else {
      console.log(`🌍 International number: ${cleanPhone}`);
    }
    
    console.log(`📞 Final phone number: ${cleanPhone}`);
    
    // MessageBird request body - optimized for UAE delivery
    const requestBody = {
      recipients: [cleanPhone],
      originator: 'Wedding', // You can customize this sender ID
      body: message,
      datacoding: 'unicode' // Important for Arabic text support
    };
    
    console.log('📤 Request body:', requestBody);
    
    const response = await fetch('https://rest.messagebird.com/messages', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      return {
        success: false,
        error: `Invalid response format: ${responseText.substring(0, 100)}`
      };
    }

    console.log('📋 Parsed response:', data);

    if (response.ok && data.id) {
      console.log('✅ SMS sent successfully, ID:', data.id);
      
      // Check if message was delivered to UAE
      if (cleanPhone.startsWith('971')) {
        console.log('🇦🇪 SMS sent to UAE number successfully');
      }
      
      return {
        success: true,
        messageId: data.id
      };
    } else {
      // Handle specific errors for UAE
      if (response.status === 401 || response.status === 403) {
        const errorMsg = 'Invalid API key or insufficient permissions. Please check your MessageBird API key.';
        console.error('❌ Authentication error:', errorMsg);
        return {
          success: false,
          error: errorMsg
        };
      }
      
      // Check for UAE-specific delivery issues
      const errorMsg = data.errors?.[0]?.description || 
                      data.error || 
                      `HTTP ${response.status}: ${response.statusText}`;
      
      // Log specific UAE delivery information
      if (cleanPhone.startsWith('971')) {
        console.error('🇦🇪 UAE SMS delivery failed:', errorMsg);
        
        // Check for common UAE delivery issues
        if (errorMsg.includes('not supported') || errorMsg.includes('blocked')) {
          return {
            success: false,
            error: 'UAE SMS delivery may be restricted. MessageBird supports UAE but some carriers may block messages. Try using a verified sender ID or contact MessageBird support.'
          };
        }
      }
      
      console.error('❌ SMS failed:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  } catch (error) {
    console.error('💥 MessageBird SMS Error:', error);
    
    // Handle network errors specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error - please check your internet connection'
      };
    }
    
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
  
  console.log(`📨 Starting bulk SMS to ${contacts.length} contacts`);
  
  // Validate API key first
  if (!apiKey || apiKey.trim().length < 10) {
    console.error('❌ Invalid API key provided');
    return contacts.map(contact => ({
      success: false,
      error: 'Invalid API key - must be at least 10 characters',
      phoneNumber: contact.phoneNumber
    }));
  }
  
  // Count UAE numbers for logging
  const uaeNumbers = contacts.filter(contact => {
    const clean = contact.phoneNumber.replace(/\D/g, '');
    return clean.startsWith('971') || (clean.length === 9 && clean.startsWith('5'));
  });
  
  console.log(`🇦🇪 Found ${uaeNumbers.length} UAE numbers out of ${contacts.length} total contacts`);
  
  // Send SMS with delay to avoid rate limiting
  for (const contact of contacts) {
    try {
      console.log(`📤 Processing contact ${contacts.indexOf(contact) + 1}/${contacts.length}: ${contact.phoneNumber}`);
      
      const result = await sendSMS(contact.phoneNumber, contact.message, apiKey);
      results.push({
        ...result,
        phoneNumber: contact.phoneNumber
      });
      
      console.log(`📊 Result for ${contact.phoneNumber}:`, result.success ? '✅ Success' : `❌ Failed: ${result.error}`);
      
      // Add 500ms delay between requests to avoid rate limiting
      if (contacts.indexOf(contact) < contacts.length - 1) {
        console.log('⏳ Waiting 500ms before next SMS...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`💥 Error sending SMS to ${contact.phoneNumber}:`, error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        phoneNumber: contact.phoneNumber
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const uaeSuccessCount = results.filter(r => {
    const clean = r.phoneNumber.replace(/\D/g, '');
    const isUAE = clean.startsWith('971') || (clean.length === 9 && clean.startsWith('5'));
    return r.success && isUAE;
  }).length;
  
  console.log(`📈 Bulk SMS completed: ${successCount}/${results.length} successful`);
  console.log(`🇦🇪 UAE SMS results: ${uaeSuccessCount}/${uaeNumbers.length} successful`);
  
  return results;
};

// Check MessageBird UAE coverage specifically
export const checkUAESupport = async (apiKey: string): Promise<{
  supported: boolean;
  details: string;
  recommendations: string[];
}> => {
  try {
    console.log('🇦🇪 Checking MessageBird UAE support...');
    
    // Test with a UAE number format (without actually sending)
    const testResponse = await fetch('https://rest.messagebird.com/lookup/971501234567/hlr', {
      method: 'GET',
      headers: {
        'Authorization': `AccessKey ${apiKey.trim()}`,
        'Accept': 'application/json'
      }
    });
    
    if (testResponse.status === 200) {
      return {
        supported: true,
        details: 'MessageBird supports UAE SMS delivery. UAE carriers: Etisalat, du, Virgin Mobile UAE are supported.',
        recommendations: [
          'Use a verified sender ID for better delivery rates',
          'Ensure your MessageBird account is verified',
          'Consider using unicode encoding for Arabic text',
          'Test with small batches first'
        ]
      };
    } else if (testResponse.status === 401) {
      return {
        supported: false,
        details: 'Invalid API key. Please check your MessageBird credentials.',
        recommendations: ['Verify your API key in MessageBird dashboard']
      };
    } else {
      return {
        supported: true,
        details: 'MessageBird generally supports UAE, but HLR lookup failed. This may be due to account limitations.',
        recommendations: [
          'Contact MessageBird support to verify UAE access',
          'Ensure your account has international SMS permissions',
          'Try sending a test message to confirm delivery'
        ]
      };
    }
  } catch (error) {
    return {
      supported: true,
      details: 'Unable to verify UAE support automatically, but MessageBird generally supports UAE SMS delivery.',
      recommendations: [
        'Test with a small batch of UAE numbers',
        'Contact MessageBird support if you experience delivery issues',
        'Ensure your account has proper permissions for international SMS'
      ]
    };
  }
};