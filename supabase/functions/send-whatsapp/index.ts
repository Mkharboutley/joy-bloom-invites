
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessageRequest {
  phoneNumber: string;
  message: string;
  guestName?: string;
  type: 'confirmation' | 'apology' | 'custom';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, guestName, type }: WhatsAppMessageRequest = await req.json();
    
    console.log(`Sending WhatsApp message to ${phoneNumber} for ${guestName || 'guest'}`);

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
    
    const whatsappPayload = {
      channel: "whatsapp",
      recipient: formattedPhone,
      type: "text",
      message: message
    };

    console.log('Sending to Zoko API:', whatsappPayload);
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': zokoApiKey, // Zoko uses X-API-Key header
      },
      body: JSON.stringify(whatsappPayload),
    });

    const responseData = await response.json();
    console.log('Zoko API response:', responseData);

    if (!response.ok) {
      console.error('Zoko API error:', responseData);
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
