const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface ZokoConfig {
  apiKey: string;
  baseUrl: string;
  phoneNumberId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, data } = await req.json()
    
    // Get Zoko config from environment variables
    const config: ZokoConfig = {
      apiKey: Deno.env.get('VITE_ZOKO_API_KEY') || 'fb6eb899-2760-405e-9dd0-c64282cad3ad',
      baseUrl: Deno.env.get('VITE_ZOKO_BASE_URL') || 'https://api.zoko.io/v2',
      phoneNumberId: Deno.env.get('VITE_ZOKO_PHONE_NUMBER_ID') || '971552439798',
    }

    console.log('Zoko API request:', { action, config: { ...config, apiKey: config.apiKey.substring(0, 8) + '...' } })

    let response: Response
    let result: any

    switch (action) {
      case 'test_connection':
        // Test connection by getting phone number info
        response = await fetch(`${config.baseUrl}/phone_numbers/${config.phoneNumberId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Zoko API Error:', errorText)
          
          let error
          try {
            const errorJson = JSON.parse(errorText)
            error = errorJson.error?.message || errorJson.message || `HTTP ${response.status}`
          } catch {
            error = `HTTP ${response.status}: ${response.statusText}`
          }
          
          return new Response(
            JSON.stringify({
              success: false,
              error: error
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }

        result = await response.json()
        return new Response(
          JSON.stringify({
            success: true,
            phoneNumber: result.display_phone_number || `+${config.phoneNumberId}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'send_message':
        // Send WhatsApp message
        response = await fetch(`${config.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.message),
        })

        result = await response.json()
        console.log('Zoko send message response:', result)

        if (!response.ok) {
          console.error('Zoko API Error:', result)
          return new Response(
            JSON.stringify({
              success: false,
              error: result.error?.message || result.message || `HTTP ${response.status}: ${response.statusText}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            messageId: result.messages?.[0]?.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'get_analytics':
        // Get message analytics
        response = await fetch(`${config.baseUrl}/messages/${data.messageId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        })

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to fetch message analytics'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }

        result = await response.json()
        return new Response(
          JSON.stringify({
            success: true,
            data: result
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid action'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
    }

  } catch (error: any) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})