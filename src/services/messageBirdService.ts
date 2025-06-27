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
    console.log(`🔄 Sending SMS to ${phoneNumber}: ${message}`);
    console.log(`📱 Using API Key: ${apiKey.substring(0, 8)}...`);
    
    // Clean phone number and handle different country codes
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Handle UAE numbers (971)
    if (cleanPhone.startsWith('971')) {
      // UAE number is already in correct format
      console.log(`🇦🇪 UAE number detected: ${cleanPhone}`);
    }
    // Handle Saudi numbers (966)
    else if (cleanPhone.startsWith('966')) {
      // Saudi number is already in correct format
      console.log(`🇸🇦 Saudi number detected: ${cleanPhone}`);
    }
    // Handle local UAE numbers (9 digits starting with 5)
    else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
      cleanPhone = '971' + cleanPhone;
      console.log(`🇦🇪 Local UAE number converted to: ${cleanPhone}`);
    }
    // Handle local Saudi numbers (9 digits starting with 5)
    else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
      cleanPhone = '966' + cleanPhone;
      console.log(`🇸🇦 Local Saudi number converted to: ${cleanPhone}`);
    }
    // Handle other formats
    else {
      console.log(`🌍 International number: ${cleanPhone}`);
    }
    
    console.log(`📞 Final phone number: ${cleanPhone}`);
    
    const requestBody = {
      recipients: [cleanPhone],
      originator: 'Wedding',
      body: message
    };
    
    console.log('📤 Request body:', requestBody);
    
    const response = await fetch('https://rest.messagebird.com/messages', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${apiKey}`,
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
      return {
        success: true,
        messageId: data.id
      };
    } else {
      const errorMsg = data.errors?.[0]?.description || 
                      data.error || 
                      `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ SMS failed:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  } catch (error) {
    console.error('💥 MessageBird SMS Error:', error);
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
      error: 'Invalid API key',
      phoneNumber: contact.phoneNumber
    }));
  }
  
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
  console.log(`📈 Bulk SMS completed: ${successCount}/${results.length} successful`);
  
  return results;
};