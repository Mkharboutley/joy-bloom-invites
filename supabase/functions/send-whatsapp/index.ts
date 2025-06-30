import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, name } = await req.json()

    if (!phone) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Phone number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') // e.g., "whatsapp:+14155238886"

    if (!accountSid || !authToken || !fromNumber) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Twilio credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format phone number for WhatsApp
    const whatsappPhone = `whatsapp:${phone}`

    // Create the invitation message
    const message = `🎉 مرحباً ${name || 'الضيف الكريم'}!

تم تأكيد حضوركم لحفل زفافنا.

📅 التاريخ: ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

بحضوركم تكتمل فرحتنا ❤️`

    // Send message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const twilioPayload = new URLSearchParams({
      From: fromNumber,
      To: whatsappPhone,
      Body: message
    })

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: twilioPayload
    })

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json()
      console.error('Twilio API Error:', errorData)
      
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: errorData.message || 'Failed to send WhatsApp message' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await twilioResponse.json()
    console.log('WhatsApp message sent successfully:', result)

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'WhatsApp invitation sent successfully',
        messageId: result.sid
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-whatsapp function:', error)
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})