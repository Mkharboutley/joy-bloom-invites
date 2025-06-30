# 🚀 Twilio WhatsApp Business API Setup Guide

## What You Need to Get from Twilio

### 1. 📋 Required Information

To integrate Twilio WhatsApp Business API with your wedding invitation system, you need to collect these 3 pieces of information from your Twilio console:

#### **Account SID** 🔑
- Location: Twilio Console → Dashboard → Account Info
- Format: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Purpose: Identifies your Twilio account

#### **Auth Token** 🔐
- Location: Twilio Console → Dashboard → Account Info
- Format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Purpose: Authenticates your API requests

#### **WhatsApp Phone Number** 📱
- Location: Twilio Console → Messaging → Try it out → Send a WhatsApp message
- Format: `whatsapp:+14155238886` (Twilio Sandbox) or your approved number
- Purpose: The phone number that will send WhatsApp messages

---

## 🔧 Step-by-Step Setup

### Step 1: Get Your Twilio Credentials

1. **Login to Twilio Console**
   - Go to [console.twilio.com](https://console.twilio.com)
   - Login with your Twilio account

2. **Get Account SID and Auth Token**
   ```
   Dashboard → Account Info section
   ```
   - Copy the Account SID (starts with `AC`)
   - Copy the Auth Token (click to reveal)
   - Keep them secure!

3. **Get WhatsApp Phone Number**
   ```
   Messaging → Try it out → Send a WhatsApp message
   ```
   - For testing: Use Twilio Sandbox number (e.g., `whatsapp:+14155238886`)
   - For production: Use your approved WhatsApp Business number

### Step 2: Add to Environment Variables

Add these to your `.env` file:

```bash
# Twilio WhatsApp Business API Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Step 3: Test the Integration

1. Go to Admin Dashboard → WhatsApp Messaging
2. Enter a test phone number (your own)
3. Send a test message
4. Check that the message is received on WhatsApp

---

## 📱 WhatsApp Business Account Requirements

### For Twilio Sandbox (Testing):
1. **Join Sandbox**
   - Send "join [sandbox-keyword]" to the Twilio sandbox number
   - Example: Send "join [your-sandbox-keyword]" to +1 415 523 8886

### For Production WhatsApp Business:
1. **Verified Business**
   - Business registration documents
   - Valid business phone number
   - Business address

2. **WhatsApp Business Account**
   - Must be approved by Meta/WhatsApp
   - Business verification completed
   - Display name approved

3. **Phone Number**
   - Dedicated business phone number
   - Cannot be used on regular WhatsApp
   - Must be verified with SMS/call

---

## 🎯 Features You Get with Twilio

### ✅ What Works Out of the Box:

1. **Send Wedding Invitations**
   - Rich text messages with Arabic support
   - Emoji support
   - Bulk sending capabilities

2. **Auto-Responses** (requires webhook setup)
   - Can be configured to respond to incoming messages
   - Requires additional webhook endpoint setup

3. **Message Tracking**
   - Delivery status (sent, delivered, read, failed)
   - Error handling and retry logic
   - Message SID for tracking

4. **Template Messages** (for approved accounts)
   - Pre-approved message templates
   - Higher delivery rates
   - Better for business communication

---

## 🔍 Testing Checklist

### Before Going Live:

- [ ] ✅ Account SID and Auth Token are correct
- [ ] 📱 WhatsApp number is properly formatted
- [ ] 📤 Test single message sends successfully
- [ ] 📝 Custom message test works
- [ ] 👥 Bulk sending test completes
- [ ] 📊 Message delivery status is tracked

---

## 🆘 Troubleshooting

### Common Issues:

#### ❌ "Authentication Error"
**Solutions:**
- Check Account SID starts with `AC`
- Verify Auth Token is correct and not expired
- Ensure credentials are properly set in environment variables

#### ❌ Messages Not Sending
**Solutions:**
- Check phone number format (should include country code)
- Verify recipient has joined Twilio sandbox (for testing)
- Check Twilio account balance
- Review message content for policy violations

#### ❌ "Invalid 'To' Phone Number"
**Solutions:**
- Ensure phone number includes country code (e.g., +966501234567)
- Format should be: `whatsapp:+[country_code][phone_number]`
- Remove any spaces or special characters

#### ❌ "Sandbox Not Joined"
**Solutions:**
- Recipient must send "join [your-sandbox-keyword]" to sandbox number
- For production, use approved WhatsApp Business number

---

## 📞 Support Contacts

### Twilio Support:
- **Documentation**: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Support**: Available in Twilio Console
- **Community**: [twilio.com/community](https://www.twilio.com/community)

### Our Technical Support:
- Test all features in the WhatsApp Messaging tab
- Check message logs for errors
- Monitor delivery status

---

## 🎉 You're All Set!

Once you have the 3 credentials and they're working in the test panel, your wedding invitation system will be fully operational with:

- ✅ Professional WhatsApp Business messaging via Twilio
- ✅ Arabic language support
- ✅ Bulk invitation sending
- ✅ Real-time delivery tracking
- ✅ Reliable message delivery
- ✅ Scalable messaging infrastructure

**Twilio provides enterprise-grade reliability for your wedding invitations!** 🎊

## 💰 Pricing Information

### Twilio WhatsApp Pricing:
- **Sandbox**: Free for testing
- **Production**: ~$0.005 - $0.02 per message (varies by country)
- **No monthly fees**: Pay only for messages sent
- **Volume discounts**: Available for high-volume usage

### Saudi Arabia Specific:
- **Outbound messages**: ~$0.016 per message
- **Template messages**: Lower rates for approved templates
- **Session messages**: 24-hour conversation window