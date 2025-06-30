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

  // Format phone number for international use
  const formatPhoneNumber = (input: string): string | null => {
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // If it starts with +, keep it as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // If it starts with 00, replace with +
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.substring(2);
    }
    
    // If it's a local number (starts with 0), assume it's UAE and add +971
    if (cleaned.startsWith('0')) {
      return '+971' + cleaned.substring(1);
    }
    
    // If it doesn't start with + or 0, assume it needs country code
    if (cleaned.length >= 8) {
      return '+971' + cleaned;
    }
    
    return null;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      toast({
        title: 'رقم غير صالح',
        description: 'يرجى إدخال رقم هاتف صحيح',
        variant: 'destructive'
      });
      return;
    }

    if (!guestName.trim()) {
      toast({
        title: 'اسم مطلوب',
        description: 'يرجى إدخال اسم الضيف',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get Supabase URL from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        toast({
          title: 'خطأ في الإعداد',
          description: 'متغيرات Supabase غير مُعرّفة',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          name: guestName.trim()
        })
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
        description: `تم إرسال الدعوة إلى ${guestName}`
      });

      setPhoneNumber('');
      setGuestName('');
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
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
          إرسال دعوة واتساب (Twilio)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <Input
            type="tel"
            placeholder="رقم الهاتف (مع رمز البلد)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            dir="ltr"
          />
          <Input
            type="text"
            placeholder="اسم الضيف"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            dir="rtl"
            required
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

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-green-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">معلومة:</p>
            <p>
              يتم الإرسال عبر Supabase Edge Function لتجنب مشاكل CORS. 
              تأكد من إعداد متغيرات البيئة في Supabase.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;