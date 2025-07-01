
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

const SMSMessaging = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // UAE phone number formatter
  const formatUAEPhone = (input: string): string | null => {
    const cleaned = input.replace(/\s+/g, '').replace(/-/g, '');

    // Handle different UAE number formats
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

  const sendSMSMessage = async (phoneNumber: string, guestName: string) => {
    try {
      console.log(`=== SMS SENDING ATTEMPT ===`);
      console.log(`Sending SMS to ${guestName} at ${phoneNumber}`);
      
      const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
      const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
      const twilioSMSNumber = import.meta.env.VITE_TWILIO_SMS_NUMBER;
      
      console.log(`Twilio Account SID: ${twilioAccountSid}`);
      console.log(`Twilio SMS Number: ${twilioSMSNumber}`);
      console.log(`Target Phone Number: ${phoneNumber}`);
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioSMSNumber) {
        console.error('Missing Twilio credentials');
        throw new Error('Twilio credentials not configured. Please add VITE_TWILIO_SMS_NUMBER to your environment variables.');
      }

      const message = `🎉 أهلاً ${guestName}!

تم إرسال دعوة حفل زفافنا إليكم.

📅 التاريخ: ٤ يوليو ٢٠٢٥
🕰️ الوقت: ٨:٣٠ مساءً
📍 المكان: فندق إرث

بحضوركم تكتمل فرحتنا ❤️`;

      const twilioPayload = new URLSearchParams({
        From: twilioSMSNumber,
        To: phoneNumber,
        Body: message
      });

      console.log(`SMS Payload:`, Object.fromEntries(twilioPayload));

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: twilioPayload
      });

      console.log(`SMS Response Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('=== SMS ERROR ===');
        console.error('SMS Error Data:', errorData);
        console.error('=== END SMS ERROR ===');
        throw new Error(errorData.message || 'Failed to send SMS message');
      }

      const data = await response.json();
      console.log('=== SMS SUCCESS ===');
      console.log('SMS message sent successfully:', data);
      console.log('Message SID:', data.sid);
      console.log('Status:', data.status);
      console.log('=== END SMS SUCCESS ===');
      return true;
    } catch (error) {
      console.error('=== SMS CATCH ERROR ===');
      console.error('Error in SMS message:', error);
      console.error('=== END SMS CATCH ERROR ===');
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(`=== SMS FORM SUBMISSION ===`);
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

    setIsLoading(true);

    try {
      await sendSMSMessage(formattedPhone, guestName || 'ضيف');
      
      toast({
        title: 'تم الإرسال',
        description: `تم إرسال الدعوة عبر الرسائل النصية إلى ${guestName || 'الضيف'} بنجاح`
      });

      setPhoneNumber('');
      setGuestName('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.',
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
          <MessageSquare className="w-5 h-5" />
          إرسال دعوة نصية (SMS)
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'جاري الإرسال...' : (
              <>
                <Send className="w-4 h-4 ml-2" />
                إرسال الدعوة النصية
              </>
            )}
          </Button>
        </form>

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-green-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">نظام الرسائل النصية:</p>
            <p>
              يستخدم النظام الآن الرسائل النصية (SMS) عبر Twilio لضمان وصول الدعوات.
              <br />
              الرسائل النصية أكثر موثوقية وتصل لجميع الهواتف بدون قيود.
            </p>
          </div>
        </div>

        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-amber-100 text-sm" dir="rtl">
          <p className="font-medium mb-1">ملاحظة مهمة:</p>
          <p>تأكد من إضافة رقم Twilio SMS إلى متغيرات البيئة: VITE_TWILIO_SMS_NUMBER</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SMSMessaging;
