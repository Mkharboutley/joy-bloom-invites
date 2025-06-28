# 🚀 Zoko WhatsApp Business API Setup Guide

## What You Need to Get from Zoko

### 1. 📋 Required Information

To integrate Zoko with your wedding invitation system, you need to collect these 4 pieces of information from your Zoko dashboard:

#### **API Key** 🔑
- Location: Zoko Dashboard → Settings → API Keys
- Format: `zoko_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Purpose: Authenticates your requests to Zoko API

#### **Phone Number ID** 📱
- Location: Zoko Dashboard → WhatsApp → Phone Numbers
- Format: `123456789012345`
- Purpose: Identifies which WhatsApp Business number to send from

#### **Business Account ID** 🏢
- Location: Zoko Dashboard → Settings → Business Account
- Format: `123456789012345`
- Purpose: Links to your WhatsApp Business Account

#### **Base URL** 🌐
- Default: `https://api.zoko.io/v2`
- Purpose: Zoko API endpoint (usually doesn't change)

---

## 🔧 Step-by-Step Setup

### Step 1: Get Your Zoko Credentials

1. **Login to Zoko Dashboard**
   - Go to [app.zoko.io](https://app.zoko.io)
   - Login with your approved business account

2. **Get API Key**
   ```
   Dashboard → Settings → API Keys → Generate New Key
   ```
   - Copy the API key (starts with `zoko_live_`)
   - Keep it secure!

3. **Get Phone Number ID**
   ```
   Dashboard → WhatsApp → Phone Numbers → Select your number
   ```
   - Copy the Phone Number ID (15-digit number)

4. **Get Business Account ID**
   ```
   Dashboard → Settings → Business Account → Account Details
   ```
   - Copy the Business Account ID

### Step 2: Add to Environment Variables

Add these to your `.env` file:

```bash
# Zoko WhatsApp Business API Configuration
VITE_ZOKO_API_KEY=zoko_live_your_actual_api_key_here
VITE_ZOKO_BASE_URL=https://api.zoko.io/v2
VITE_ZOKO_PHONE_NUMBER_ID=your_15_digit_phone_number_id
VITE_ZOKO_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### Step 3: Test the Integration

1. Go to Admin Dashboard → Zoko tab
2. Check connection status (should show green ✅)
3. Send a test message to your own WhatsApp
4. Try the auto-response by sending "موقع" to your business number

---

## 📱 WhatsApp Business Account Requirements

### What Zoko Needs from You:

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

## 🎯 Features You Get with Zoko

### ✅ What Works Out of the Box:

1. **Send Wedding Invitations**
   - Rich text messages with Arabic support
   - Media attachments (images, documents)
   - Bulk sending with rate limiting

2. **Auto-Responses**
   - Responds to "موقع" with venue location
   - Responds to "وقت" with event details
   - Responds to "تأكيد" with confirmation link
   - Responds to "نعم/لا" for attendance

3. **Message Tracking**
   - Delivery status (sent, delivered, read)
   - Error handling and retry logic
   - Analytics and reporting

4. **Webhook Support**
   - Real-time message receiving
   - Status updates
   - Two-way conversations

---

## 🔍 Testing Checklist

### Before Going Live:

- [ ] ✅ Connection status shows "متصل بنجاح"
- [ ] 📱 Phone number displays correctly
- [ ] 📤 Test single message sends successfully
- [ ] 📝 Custom message test works
- [ ] 👥 Bulk sending test completes
- [ ] 🤖 Auto-responses work for all keywords
- [ ] 📊 Message status updates appear in logs

---

## 🆘 Troubleshooting

### Common Issues:

#### ❌ "غير متصل" (Not Connected)
**Solutions:**
- Check API key is correct and starts with `zoko_live_`
- Verify Phone Number ID is 15 digits
- Ensure WhatsApp Business Account is approved
- Contact Zoko support if credentials are correct

#### ❌ Messages Not Sending
**Solutions:**
- Check phone number format (should be digits only, no + or whatsapp:)
- Verify recipient has WhatsApp
- Check rate limits (Zoko allows 80 messages/minute)
- Review message content for policy violations

#### ❌ Auto-Responses Not Working
**Solutions:**
- Verify webhook URL is configured in Zoko dashboard
- Check webhook endpoint is accessible
- Test with exact keywords: "موقع", "وقت", "تأكيد"

---

## 📞 Support Contacts

### Zoko Support:
- **Email**: support@zoko.io
- **WhatsApp**: Available in dashboard
- **Documentation**: [docs.zoko.io](https://docs.zoko.io)

### Our Technical Support:
- Test all features in the Zoko tab
- Check connection status regularly
- Monitor message logs for errors

---

## 🎉 You're All Set!

Once you have the 4 credentials and they're working in the test panel, your wedding invitation system will be fully operational with:

- ✅ Professional WhatsApp Business messaging
- ✅ Arabic language support
- ✅ Auto-responses for common questions
- ✅ Bulk invitation sending
- ✅ Real-time delivery tracking
- ✅ Two-way guest communication

**Zoko is much more reliable than Twilio for Arabic content and wedding invitations!** 🎊