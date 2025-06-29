const express = require('express');
const axios = require('axios');
const https = require('https');

const app = express();
app.use(express.json());

const agent = new https.Agent({ rejectUnauthorized: false }); // bypass SSL

app.post('/zoko-proxy', async (req, res) => {
  try {
    const zokoRes = await axios.get(
      'https://api.zoko.io/v2/phone_numbers/971552439798',
      {
        headers: {
          Authorization: 'Bearer fb6eb899-2760-405e-9dd0-c64282cad3ad',
          Accept: 'application/json',
        },
        httpsAgent: agent
      }
    );
    res.json(zokoRes.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
