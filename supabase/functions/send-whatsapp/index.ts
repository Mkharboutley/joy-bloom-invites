
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessageRequest {
  phoneNumber: string;
  message: string;
  guestName?: string;
  type: 'confirmation' | 'apology' | 'custom';
  useTemplate?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, guestName, type, useTemplate = false }: WhatsAppMessageRequest = await req.json();
    
    console.log(`Sending WhatsApp message to ${phoneNumber} for ${guestName || 'guest'}`);
    console.log(`Use template: ${useTemplate}`);

    const zokoApiKey = Deno.env.get('ZOKO_API_KEY');

    if (!zokoApiKey) {
      console.error('Missing Zoko API key');
      return new Response(
        JSON.stringify({ error: 'Missing Zoko API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove any non-digits and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Use the exact Zoko API endpoint
    const apiUrl = 'https://chat.zoko.io/v2/message';
    
    let whatsappPayload;

    if (useTemplate) {
      // Use the correct Zoko template message structure
      whatsappPayload = {
        type: "template",
        templateId: "01",
        channel: "whatsapp",
        recipient: formattedPhone,
        language: "ar",
        templateData: {
          params: [guestName || "الضيف الكريم"]
        }
      };
    } else {
      // Use regular text message for existing contacts
      whatsappPayload = {
        type: "text",
        channel: "whatsapp",
        recipient: formattedPhone,
        message: message
      };
    }

    console.log('=== DEBUG: Full payload being sent to Zoko ===');
    console.log(JSON.stringify(whatsappPayload, null, 2));
    console.log('=== END DEBUG ===');
    console.log('API URL:', apiUrl);
    console.log('API Key (first 10 chars):', zokoApiKey.substring(0, 10) + '...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'apikey': zokoApiKey,
      },
      body: JSON.stringify(whatsappPayload),
    });

    const responseData = await response.json();
    console.log('=== ZOKO API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    console.log('=== END RESPONSE ===');

    if (!response.ok) {
      console.error('Zoko API error:', responseData);
      
      // Handle the specific "new customer" error - suggest using template
      if (response.status === 409 && responseData.message?.includes('template message')) {
        return new Response(
          JSON.stringify({ 
            error: 'Template message required', 
            message: 'This appears to be a new contact. Try using the template message option.',
            details: responseData,
            requiresTemplate: true
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // For 404 template errors, provide more specific guidance
      if (response.status === 404 && responseData.message?.includes('template not found')) {
        return new Response(
          JSON.stringify({ 
            error: 'Template not found', 
            message: 'The template "01" with Arabic language was not found. Please check your Zoko dashboard to ensure the template exists and is approved.',
            details: responseData,
            suggestion: 'Verify template ID "01" exists and is approved in your Zoko dashboard'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message', details: responseData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: responseData.message_id || responseData.id,
        status: 'sent'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
