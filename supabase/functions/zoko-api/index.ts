
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

    // Validate config presence
    if (!config.apiKey || !config.baseUrl || !config.phoneNumberId) {
      console.error("Missing Zoko config in environment variables.")
      console.error("Config status:", {
        apiKey: config.apiKey ? 'present' : 'missing',
        baseUrl: config.baseUrl ? 'present' : 'missing',
        phoneNumberId: config.phoneNumberId ? 'present' : 'missing'
      })
    }

    console.log('Zoko Edge Function - Action:', action)
    console.log('Zoko Edge Function - Config:', { 
      apiKey: config.apiKey.substring(0, 8) + '...',
      baseUrl: config.baseUrl,
      phoneNumberId: config.phoneNumberId
    })

    // Sanitize baseUrl to prevent malformed URLs
    const baseUrl = config.baseUrl.replace(/\/+$/, '');

    let response: Response
    let result: any

    switch (action) {
      case 'test_connection':
        // Test connection by getting phone number info
        console.log('Testing Zoko connection...')
        const testUrl = `${baseUrl}/phone_numbers/${config.phoneNumberId}`
        console.log('Request URL:', testUrl)
        console.log('Request Headers:', {
          'Authorization': `Bearer ${config.apiKey.substring(0, 8)}...`,
          'Content-Type': 'application/json',
          'User-Agent': 'ZokoEdgeFunction/1.0'
        })
        
        // Add timeout logic with AbortController
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        
        try {
          response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
              'User-Agent': 'ZokoEdgeFunction/1.0',
              'Accept': 'application/json'
            },
            signal: controller.signal
          })
          
          clearTimeout(timeout);
          console.log('Zoko API Response Status:', response.status)
          console.log('Zoko API Response Headers:', Object.fromEntries(response.headers.entries()))
          
          if (!response.ok) {
            console.error(`Fetch failed: ${response.status} ${response.statusText}`)
            const errorText = await response.text()
            console.error('Zoko API Error Response:', errorText)
            
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
                status: response.status === 401 ? 401 : 
                       response.status === 403 ? 403 : 
                       response.status === 404 ? 404 : 502
              }
            )
          }

          result = await response.json()
          console.log('Zoko API Success Response:', result)
          
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
          
        } catch (error: any) {
          clearTimeout(timeout);
          console.error('Fetch Error:', error.message || error)
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            cause: error.cause,
            stack: error.stack
          })
          
          // Check if it's a timeout/abort error
          if (error.name === 'AbortError') {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Request timeout: Zoko API took too long to respond (8 seconds). Please check if Zoko API is accessible.'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 504
              }
            )
          }
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `Network error: ${error.message || 'Unknown error'}. Please check if Zoko API is accessible and credentials are correct.`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 502
            }
          )
        }

      case 'send_message':
        // Send WhatsApp message
        console.log('Sending message via Zoko:', data.message)
        const sendUrl = `${baseUrl}/messages`
        console.log('Send message URL:', sendUrl)
        
        // Add timeout logic for send message
        const sendController = new AbortController();
        const sendTimeout = setTimeout(() => sendController.abort(), 10000);
        
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
            signal: sendController.signal
          })
          
          clearTimeout(sendTimeout);
          console.log('Send message response status:', response.status)
          
          if (!response.ok) {
            console.error(`Send message fetch failed: ${response.status} ${response.statusText}`)
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
                status: response.status === 401 ? 401 : 
                       response.status === 403 ? 403 : 
                       response.status === 404 ? 404 : 502
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
          
        } catch (error: any) {
          clearTimeout(sendTimeout);
          console.error('Send message fetch error:', error.message || error)
          
          if (error.name === 'AbortError') {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Request timeout: Message sending took too long (10 seconds)'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 504
              }
            )
          }
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `Network error while sending message: ${error.message || 'Unknown error'}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 502
            }
          )
        }

      case 'get_analytics':
        // Get message analytics
        const analyticsUrl = `${baseUrl}/messages/${data.messageId}`
        
        // Add timeout logic for analytics
        const analyticsController = new AbortController();
        const analyticsTimeout = setTimeout(() => analyticsController.abort(), 8000);
        
        try {
          response = await fetch(analyticsUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'User-Agent': 'ZokoEdgeFunction/1.0',
              'Accept': 'application/json'
            },
            signal: analyticsController.signal
          })
          
          clearTimeout(analyticsTimeout);
          console.log('Analytics response status:', response.status)
          
          if (!response.ok) {
            console.error(`Analytics fetch failed: ${response.status} ${response.statusText}`)
            const errorText = await response.text()
            console.error('Zoko API Analytics Error:', errorText)
            return new Response(
              JSON.stringify({
                success: false,
                error: `Failed to fetch message analytics: ${response.status} ${response.statusText}`
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: response.status === 401 ? 401 : 
                       response.status === 403 ? 403 : 
                       response.status === 404 ? 404 : 502
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
          
        } catch (error: any) {
          clearTimeout(analyticsTimeout);
          console.error('Analytics fetch error:', error.message || error)
          
          if (error.name === 'AbortError') {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Request timeout: Analytics request took too long (8 seconds)'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 504
              }
            )
          }
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `Network error while fetching analytics: ${error.message || 'Unknown error'}`
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 502
            }
          )
        }

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
        error: `Internal server error: ${error.message || 'Unknown error'}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
