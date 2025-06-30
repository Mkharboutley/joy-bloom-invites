
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
      console.log(`Sending WhatsApp message to ${guestName} at ${phoneNumber}`);
      
      const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
      const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      const twilioWhatsAppNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
        console.error('Missing Twilio credentials');
        throw new Error('Twilio credentials not configured');
      }

      const whatsappPhone = `whatsapp:${phoneNumber}`;

      const message = `🎉 أهلاً ${guestName}!

تم إرسال دعوة حفل زفافنا إليكم.

📅 التاريخ: ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

بحضوركم تكتمل فرحتنا ❤️`;

      const twilioPayload = new URLSearchParams({
        From: twilioWhatsAppNumber,
        To: whatsappPhone,
        Body: message
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: twilioPayload
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending WhatsApp message:', errorData);
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      console.log('WhatsApp message sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in WhatsApp message:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPhone = formatUAEPhone(phoneNumber);
    if (!formattedPhone) {
      toast({
        title: 'رقم غير صالح',
        description: 'يرجى إدخال رقم إماراتي صحيح بالصيغة 05xxxxxxxx أو +9715xxx أو 009715xxx',
        variant: 'destructive'
      });
      return;
    }

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
            <p className="font-medium mb-1">ملاحظة:</p>
            <p>
              تأكد من إعداد متغيرات البيئة لـ Twilio في ملف .env الخاص بك:
              <br />
              VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, VITE_TWILIO_WHATSAPP_NUMBER
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;
