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
      const payload = new URLSearchParams({
        phone: formattedPhone,
        name: guestName || 'ضيف'
      });

      const response = await fetch('https://wedding-messaging-7974.twil.io/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });

      const result = await response.json();

      if (result.status !== 'success') {
        toast({
          title: 'فشل الإرسال',
          description: result.message || 'لم يتم إرسال الرسالة',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'تم الإرسال',
        description: `تم إرسال الدعوة إلى ${guestName || 'الضيف'}`
      });

      setPhoneNumber('');
      setGuestName('');
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الإرسال',
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
          إرسال دعوة واتساب (قالب رسمي)
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
                إرسال القالب الآن
              </>
            )}
          </Button>
        </form>

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-green-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">معلومة:</p>
            <p>
              يتم استخدام قالب واتساب رسمي. تأكد أن الرقم المسجل فعّال على واتساب وأنه لم يمضِ أكثر من 24 ساعة على آخر تفاعل.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;
