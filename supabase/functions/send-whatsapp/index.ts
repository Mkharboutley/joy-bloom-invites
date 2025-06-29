
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

    const zohoApiKey = Deno.env.get('ZOHO_WHATSAPP_API_KEY');
    const zohoBaseUrl = Deno.env.get('ZOHO_WHATSAPP_BASE_URL');
    const zohoPhoneNumber = Deno.env.get('ZOHO_WHATSAPP_PHONE_NUMBER');

    if (!zohoApiKey || !zohoBaseUrl || !zohoPhoneNumber) {
      console.error('Missing Zoho WhatsApp credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Zoho WhatsApp credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove any non-digits and ensure it starts with country code)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    const whatsappPayload = {
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    };

    console.log('Sending to Zoho WhatsApp API:', whatsappPayload);

    const response = await fetch(`${zohoBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zohoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload),
    });

    const responseData = await response.json();
    console.log('Zoho WhatsApp API response:', responseData);

    if (!response.ok) {
      console.error('Zoho WhatsApp API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message', details: responseData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: responseData.messages?.[0]?.id || responseData.id,
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
