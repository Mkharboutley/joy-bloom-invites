// File: send-whatsapp.ts (Deno Edge Function)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { phoneNumber, message, guestName, type, useTemplate = false } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing phone number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const zokoApiKey = Deno.env.get('ZOKO_API_KEY');
    if (!zokoApiKey) {
      return new Response(JSON.stringify({ error: 'Missing Zoko API key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    const formattedPhone = cleaned.startsWith('+') ? cleaned : '+' + cleaned;

    const apiUrl = 'https://chat.zoko.io/v2/message';
    let whatsappPayload;

    if (useTemplate) {
      whatsappPayload = {
        type: 'template',
        templateId: '01_new',
        channel: 'whatsapp',
        recipient: formattedPhone,
        language: 'ar',
        templateData: {
          params: [guestName || 'الضيف الكريم']
        }
      };
    } else {
      if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing message for non-template mode' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      whatsappPayload = {
        type: 'text',
        channel: 'whatsapp',
        recipient: formattedPhone,
        message
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        apikey: zokoApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whatsappPayload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'Failed to send WhatsApp message',
        details: responseData
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: responseData.message_id || responseData.id,
      status: 'sent'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
