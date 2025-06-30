
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wedding-f09cd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZGRpbmctZjA5Y2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTU4NzE3NiwiZXhwIjoyMDUxMTYzMTc2fQ.gM8gJfGGnm6OZ9LKQ1fwpMvH1KYf_5JKUcIGRLfWyzs'
);

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
      console.log('Calling Supabase edge function...');
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phone: formattedPhone,
          name: guestName || 'ضيف'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: 'خطأ في الإرسال',
          description: 'حدث خطأ أثناء الاتصال بالخدمة',
          variant: 'destructive'
        });
        return;
      }

      if (data.status !== 'success') {
        toast({
          title: 'فشل الإرسال',
          description: data.message || 'لم يتم إرسال الرسالة',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'تم الإرسال',
        description: data.message || `تم إرسال الدعوة إلى ${guestName || 'الضيف'}`
      });

      setPhoneNumber('');
      setGuestName('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
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
          إرسال دعوة واتساب (عبر Supabase Edge Function)
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
                إرسال عبر Supabase
              </>
            )}
          </Button>
        </form>

        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">تحديث:</p>
            <p>
              تم حل مشكلة CORS! الآن يتم الإرسال عبر Supabase Edge Function الذي يتولى التعامل مع Twilio API بشكل آمن.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;
