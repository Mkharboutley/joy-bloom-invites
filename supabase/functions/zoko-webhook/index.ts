import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const webhookData = await req.json()
    console.log('Received Zoko webhook:', JSON.stringify(webhookData, null, 2))

    // Get Zoko credentials from environment
    const zokoApiKey = Deno.env.get('ZOKO_API_KEY') || ''
    const zokoBaseUrl = Deno.env.get('ZOKO_BASE_URL') || 'https://api.zoko.io/v2'

    // Handle incoming message from Zoko webhook
    if (webhookData.object === 'whatsapp_business_account' && webhookData.entry) {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.messages) {
            for (const message of change.value.messages) {
              await handleIncomingMessage(message, change.value.metadata.phone_number_id, zokoApiKey, zokoBaseUrl)
            }
          }

          // Handle message status updates
          if (change.field === 'messages' && change.value.statuses) {
            for (const status of change.value.statuses) {
              await handleMessageStatus(status)
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in zoko-webhook function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleIncomingMessage(message: any, phoneNumberId: string, apiKey: string, baseUrl: string) {
  const from = message.from
  const messageText = message.text?.body?.toLowerCase() || ''
  const senderName = message.profile?.name || 'ضيف كريم'

  console.log(`Received message from ${from}: ${message.text?.body}`)

  let responseMessage = ''

  // Auto-respond based on message content
  if (messageText.includes('موقع') || messageText.includes('عنوان') || messageText.includes('مكان')) {
    responseMessage = `📍 *موقع فندق إرث:*

🏨 العنوان: فندق إرث
🗺️ رابط الخريطة: https://maps.app.goo.gl/E9sp6ayDb96DTnNG6

🚗 *معلومات إضافية:*
• يتوفر موقف سيارات مجاني
• يمكن الوصول بسهولة عبر أوبر/كريم

نتطلع لرؤيتكم! 🎉`

  } else if (messageText.includes('وقت') || messageText.includes('تاريخ') || messageText.includes('متى')) {
    responseMessage = `🎊 *تفاصيل حفل الزفاف:*

📅 التاريخ: الجمعة، ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

⏰ *ملاحظات مهمة:*
• يُفضل الحضور قبل ١٥ دقيقة
• الحفل سيبدأ في الموعد المحدد

بحضوركم تكتمل سعادتنا! ✨`

  } else if (messageText.includes('تأكيد') || messageText.includes('حضور')) {
    responseMessage = `🎉 *تأكيد الحضور:*

${senderName}، لتأكيد حضوركم يرجى زيارة الرابط التالي:
${Deno.env.get('SITE_URL') || 'https://your-site.com'}

أو يمكنكم الرد بـ:
• "نعم" أو "موافق" لتأكيد الحضور
• "لا" أو "اعتذر" للاعتذار

شكراً لكم! 💕`

  } else if (messageText.includes('نعم') || messageText.includes('موافق') || messageText.includes('أوافق')) {
    responseMessage = `✅ *تم تأكيد حضوركم!*

شكراً لكم ${senderName}!
تم تأكيد حضوركم لحفل الزفاف.

📋 *تفاصيل سريعة:*
📅 الجمعة، ٤ يوليو ٢٠٢٥
🕰️ ٨:٣٠ مساءً
📍 فندق إرث

🎫 سيتم إرسال رمز QR للدعوة قريباً.
نتطلع لرؤيتكم! 🎊`

  } else if (messageText.includes('لا') || messageText.includes('اعتذر') || messageText.includes('أعتذر')) {
    responseMessage = `😔 *اعتذار مقبول*

${senderName}، تم استلام اعتذاركم عن الحضور.
نتفهم ظروفكم ونتطلع لرؤيتكم في مناسبة قادمة إن شاء الله.

شكراً لإعلامنا مسبقاً. 🤍`

  } else {
    responseMessage = `أهلاً وسهلاً ${senderName}! 🙏

شكراً لتواصلكم معنا!

🔍 *للاستفسارات السريعة:*
• اكتبوا "موقع" لمعرفة عنوان الفندق
• اكتبوا "وقت" لمعرفة تفاصيل الحفل  
• اكتبوا "تأكيد" لتأكيد الحضور

أو تواصلوا معنا مباشرة للمساعدة.
بحضوركم تكتمل سعادتنا! 💕`
  }

  // Send auto-response via Zoko API
  if (responseMessage) {
    try {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: responseMessage }
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log('Auto-response sent successfully via Zoko:', result.messages?.[0]?.id)
      } else {
        console.error('Failed to send auto-response via Zoko:', result)
      }
    } catch (error) {
      console.error('Error sending auto-response via Zoko:', error)
    }
  }
}

async function handleMessageStatus(status: any) {
  console.log(`Message ${status.id} status: ${status.status} for ${status.recipient_id}`)
  
  // Here you could update your database with the message status
  // For example, update notification_logs table
  if (status.errors && status.errors.length > 0) {
    console.error('Message delivery error:', status.errors)
  }
}