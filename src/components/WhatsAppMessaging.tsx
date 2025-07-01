import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, AlertTriangle } from 'lucide-react';

const WhatsAppMessaging = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ✅ UAE number formatter
  const formatUAEPhone = (input: string): string | null => {
    const cleaned = input.replace(/\s+/g, '').replace(/-/g, '');

    if (/^009715\d{8}$/.test(cleaned)) {
      return `+${cleaned.substring(2)}`;
    }

    if (/^\+9715\d{8}$/.test(cleaned)) {
      return cleaned;
    }

    if (/^05\d{8}$/.test(cleaned)) {
      return `+971${cleaned.substring(1)}`;
    }

    return null;
  };

  const sendWhatsAppMessage = async (phoneNumber: string, guestName: string) => {
    try {
      console.log(`=== TWILIO DEBUG START ===`);
      console.log(`Sending WhatsApp template message to ${guestName} at ${phoneNumber}`);
      
      const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
      const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      const twilioWhatsAppNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;
      
      console.log(`Twilio Account SID: ${twilioAccountSid}`);
      console.log(`Twilio WhatsApp Number: ${twilioWhatsAppNumber}`);
      console.log(`Target Phone Number: ${phoneNumber}`);
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
        console.error('Missing Twilio credentials');
        throw new Error('Twilio credentials not configured');
      }

      const whatsappPhone = `whatsapp:${phoneNumber}`;
      console.log(`Final WhatsApp Phone Format: ${whatsappPhone}`);

      // Using a simple hello_world template as fallback, or create a custom template
      const twilioPayload = new URLSearchParams({
        From: twilioWhatsAppNumber,
        To: whatsappPhone,
        ContentSid: 'HX9e794dd2bcf2dd85447a7e245e8d4c8a8', // Default Twilio hello_world template
        ContentVariables: JSON.stringify({
          "1": guestName || "ضيف",
          "2": "٤ يوليو ٢٠٢٥",
          "3": "٨:٣٠ مساءً",
          "4": "فندق إرث"
        })
      });

      console.log(`Payload being sent:`, Object.fromEntries(twilioPayload));

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: twilioPayload
      });

      console.log(`Response Status: ${response.status}`);
      console.log(`Response Status Text: ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('=== TWILIO ERROR RESPONSE ===');
        console.error('Full Error Data:', errorData);
        console.error('Error Code:', errorData.code);
        console.error('Error Message:', errorData.message);
        console.error('Error More Info:', errorData.more_info);
        console.error('=== END TWILIO ERROR ===');
        
        // If template fails, try freeform as fallback
        if (errorData.code === 63016 || errorData.message?.includes('template')) {
          console.log('Template failed, trying freeform message...');
          return await sendFreeformMessage(phoneNumber, guestName, twilioAccountSid, twilioAuthToken, twilioWhatsAppNumber);
        }
        
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      console.log('=== TWILIO SUCCESS RESPONSE ===');
      console.log('WhatsApp template message sent successfully:', data);
      console.log('Message SID:', data.sid);
      console.log('Message Status:', data.status);
      console.log('=== END TWILIO SUCCESS ===');
      return true;
    } catch (error) {
      console.error('=== TWILIO CATCH ERROR ===');
      console.error('Error in WhatsApp template message:', error);
      console.error('=== END TWILIO CATCH ERROR ===');
      throw error;
    }
  };

  const sendFreeformMessage = async (phoneNumber: string, guestName: string, accountSid: string, authToken: string, fromNumber: string) => {
    try {
      console.log(`=== FREEFORM MESSAGE ATTEMPT ===`);
      const whatsappPhone = `whatsapp:${phoneNumber}`;
      console.log(`Freeform WhatsApp Phone Format: ${whatsappPhone}`);
      
      const message = `🎉 أهلاً ${guestName}!

تم إرسال دعوة حفل زفافنا إليكم.

📅 التاريخ: ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

بحضوركم تكتمل فرحتنا ❤️`;

      const twilioPayload = new URLSearchParams({
        From: fromNumber,
        To: whatsappPhone,
        Body: message
      });

      console.log(`Freeform Payload:`, Object.fromEntries(twilioPayload));

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: twilioPayload
      });

      console.log(`Freeform Response Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('=== FREEFORM ERROR ===');
        console.error('Freeform Error Data:', errorData);
        console.error('=== END FREEFORM ERROR ===');
        throw new Error(errorData.message || 'Failed to send freeform message');
      }

      const data = await response.json();
      console.log('=== FREEFORM SUCCESS ===');
      console.log('WhatsApp freeform message sent successfully:', data);
      console.log('=== END FREEFORM SUCCESS ===');
      return true;
    } catch (error) {
      console.error('=== FREEFORM CATCH ERROR ===');
      console.error('Error in freeform message:', error);
      console.error('=== END FREEFORM CATCH ERROR ===');
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(`=== FORM SUBMISSION DEBUG ===`);
    console.log(`Raw Phone Input: "${phoneNumber}"`);
    console.log(`Guest Name: "${guestName}"`);

    const formattedPhone = formatUAEPhone(phoneNumber);
    console.log(`Formatted Phone Result: ${formattedPhone}`);
    
    if (!formattedPhone) {
      console.error('Phone formatting failed for input:', phoneNumber);
      toast({
        title: 'رقم غير صالح',
        description: 'يرجى إدخال رقم إماراتي صحيح بالصيغة 05xxxxxxxx أو +9715xxx أو 009715xxx',
        variant: 'destructive'
      });
      return;
    }

    console.log(`=== PROCEEDING WITH SEND ===`);
    setIsLoading(true);

    try {
      await sendWhatsAppMessage(formattedPhone, guestName || 'ضيف');
      
      toast({
        title: 'تم الإرسال',
        description: `تم إرسال الدعوة إلى ${guestName || 'الضيف'} بنجاح`
      });

      setPhoneNumber('');
      setGuestName('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2" dir="rtl">
          <MessageCircle className="w-5 h-5" />
          إرسال دعوة واتساب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <Input
            type="tel"
            placeholder="رقم الهاتف (05xxxxxxxx أو +9715xxx أو 009715xxx)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            dir="ltr"
          />
          <Input
            type="text"
            placeholder="اسم الضيف (اختياري)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            dir="rtl"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? 'جاري الإرسال...' : (
              <>
                <Send className="w-4 h-4 ml-2" />
                إرسال الدعوة
              </>
            )}
          </Button>
        </form>

        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-orange-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">ملاحظة مهمة:</p>
            <p>
              يستخدم النظام قوالب الرسائل المعتمدة من واتساب للأعمال. 
              <br />
              قد تحتاج لإنشاء قالب مخصص في حساب Twilio الخاص بك لرسائل الزفاف.
            </p>
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">حل مؤقت:</p>
            <p>
              إذا فشل إرسال القالب، سيتم المحاولة بالرسالة العادية. 
              <br />
              لأفضل النتائج، تأكد من الرد على رسالة من المستلم أولاً.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;
