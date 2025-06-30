
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Zoko API proxy endpoint
app.post('/zoko-proxy', async (req, res) => {
  try {
    console.log('Proxy request received:', req.body);
    
    const { action, data } = req.body;
    const zokoApiKey = 'fb6eb899-2760-405e-9dd0-c64282cad3ad';
    const zokoBaseUrl = 'https://api.zoko.io/v2';
    
    let url = '';
    let method = 'GET';
    let body = null;
    
    switch (action) {
      case 'test_connection':
        url = `${zokoBaseUrl}/phone_numbers/971552439798`;
        method = 'GET';
        break;
      case 'send_message':
        url = `${zokoBaseUrl}/messages`;
        method = 'POST';
        body = JSON.stringify(data.message);
        break;
      default:
        return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }
    
    console.log(`Making Zoko API call: ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${zokoApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ZokoProxy/1.0'
      },
      body
    });
    
    console.log(`Zoko API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zoko API Error:', errorText);
      
      let error;
      try {
        const errorJson = JSON.parse(errorText);
        error = errorJson.error?.message || errorJson.message || `HTTP ${response.status}`;
      } catch {
        error = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      return res.status(response.status).json({
        success: false,
        error: error
      });
    }
    
    const result = await response.json();
    console.log('Zoko API Success Response:', result);
    
    // Format response based on action
    let formattedResponse;
    switch (action) {
      case 'test_connection':
        formattedResponse = {
          success: true,
          phoneNumber: result.display_phone_number || '+971552439798',
          data: result
        };
        break;
      case 'send_message':
        formattedResponse = {
          success: true,
          messageId: result.messages?.[0]?.id,
          data: result
        };
        break;
      default:
        formattedResponse = {
          success: true,
          data: result
        };
    }
    
    res.json(formattedResponse);
    
  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Proxy server error' 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log('Ready to handle Zoko API requests');
});
