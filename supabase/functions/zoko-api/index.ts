
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
    
    // Get Zoko config from environment variables or fallback to hardcoded values
    const config: ZokoConfig = {
      apiKey: Deno.env.get('VITE_ZOKO_API_KEY') || 'fb6eb899-2760-405e-9dd0-c64282cad3ad',
      baseUrl: Deno.env.get('VITE_ZOKO_BASE_URL') || 'https://api.zoko.io/v2',
      phoneNumberId: Deno.env.get('VITE_ZOKO_PHONE_NUMBER_ID') || '971552439798',
    }

    console.log('Zoko Edge Function - Action:', action)
    console.log('Zoko Edge Function - Config:', { 
      apiKey: config.apiKey.substring(0, 8) + '...',
      baseUrl: config.baseUrl,
      phoneNumberId: config.phoneNumberId
    })

    let response: Response
    let result: any

    switch (action) {
      case 'test_connection':
        // Test connection by getting phone number info
        console.log('Testing Zoko connection...')
        const testUrl = `${config.baseUrl}/phone_numbers/${config.phoneNumberId}`
        console.log('Request URL:', testUrl)
        console.log('Request Headers:', {
          'Authorization': `Bearer ${config.apiKey.substring(0, 8)}...`,
          'Content-Type': 'application/json',
          'User-Agent': 'ZokoEdgeFunction/1.0'
        })
        
        try {
          response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
              'User-Agent': 'ZokoEdgeFunction/1.0',
              'Accept': 'application/json'
            },
          })
        } catch (fetchError: any) {
          console.error('Fetch error details:', {
            name: fetchError.name,
            message: fetchError.message,
            cause: fetchError.cause,
            stack: fetchError.stack
          })
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `Network error: ${fetchError.message}. Please check if Zoko API is accessible and credentials are correct.`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }
        
        console.log('Zoko API Response Status:', response.status)
        console.log('Zoko API Response Headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Zoko API Error Response:', errorText)
          console.error('Zoko API Error Status:', response.status, response.statusText)
          
          let error
          try {
            const errorJson = JSON.parse(errorText)
            error = errorJson.error?.message || errorJson.message || `HTTP ${response.status}: ${response.statusText}`
          } catch {
            error = `HTTP ${response.status}: ${response.statusText} - ${errorText}`
          }
          
          // Add specific error messages for common issues
          if (response.status === 401) {
            error += ' (Invalid API key or unauthorized access)'
          } else if (response.status === 404) {
            error += ' (Phone number not found or invalid phone number ID)'
          } else if (response.status === 403) {
            error += ' (Access forbidden - check API permissions)'
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
        console.log('Zuko API Success Response:', result)
        
        return new Response(
          JSON.stringify({
            success: true,
            phoneNumber: result.display_phone_number || `+${config.phoneNumberId}`,
            data: result
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'send_message':
        // Send WhatsApp message
        console.log('Sending message via Zoko:', data.message)
        const sendUrl = `${config.baseUrl}/messages`
        console.log('Send message URL:', sendUrl)
        
        try {
          response = await fetch(sendUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
              'User-Agent': 'ZokoEdgeFunction/1.0',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data.message),
          })
        } catch (fetchError: any) {
          console.error('Send message fetch error:', fetchError)
          return new Response(
            JSON.stringify({
              success: false,
              error: `Network error while sending message: ${fetchError.message}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Zoko API Send Message Error:', errorText)
          
          let error
          try {
            const errorJson = JSON.parse(errorText)
            error = errorJson.error?.message || errorJson.message || `HTTP ${response.status}: ${response.statusText}`
          } catch {
            error = `HTTP ${response.status}: ${response.statusText} - ${errorText}`
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
        console.log('Zoko send message response:', result)

        return new Response(
          JSON.stringify({
            success: true,
            messageId: result.messages?.[0]?.id,
            data: result
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'get_analytics':
        // Get message analytics
        const analyticsUrl = `${config.baseUrl}/messages/${data.messageId}`
        
        try {
          response = await fetch(analyticsUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'User-Agent': 'ZokoEdgeFunction/1.0',
              'Accept': 'application/json'
            },
          })
        } catch (fetchError: any) {
          console.error('Analytics fetch error:', fetchError)
          return new Response(
            JSON.stringify({
              success: false,
              error: `Network error while fetching analytics: ${fetchError.message}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Zoko API Analytics Error:', errorText)
          return new Response(
            JSON.stringify({
              success: false,
              error: `Failed to fetch message analytics: ${response.status} ${response.statusText}`
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
            error: `Invalid action: ${action}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
    }

  } catch (error: any) {
    console.error('Zoko Edge Function Error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Internal server error: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
