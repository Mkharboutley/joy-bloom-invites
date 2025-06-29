
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, AlertTriangle } from 'lucide-react';

const WhatsAppMessaging = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف والرسالة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Sending custom WhatsApp message');
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phoneNumber: phoneNumber.trim(),
          message: message.trim(),
          type: 'custom'
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        
        // Check if it's the template message error
        if (error.message?.includes('Edge Function returned a non-2xx status code')) {
          toast({
            title: "مطلوب قالب رسالة معتمد",
            description: "يبدو أن هذا رقم جديد. الواتساب يتطلب قوالب رسائل معتمدة للتواصل الأول. يرجى إنشاء قوالب رسائل في لوحة تحكم Zoko أولاً.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ في الإرسال",
            description: "فشل في إرسال الرسالة، يرجى المحاولة مرة أخرى",
            variant: "destructive"
          });
        }
        return;
      }

      console.log('Message sent successfully:', data);
      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرسالة بنجاح عبر الواتساب",
      });

      // Clear form
      setPhoneNumber('');
      setMessage('');
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    setMessage(template);
  };

  const templates = [
    {
      name: "تذكير بالحفل",
      content: "🎉 تذكير بحفل زفافنا\n\n📅 التاريخ: ٤ يوليو ٢٠٢٥\n📍 المكان: فندق إرث\n🕕 الوقت: ٦:٠٠ مساءً\n\nننتظر حضوركم بفارغ الصبر ❤️"
    },
    {
      name: "طلب تأكيد الحضور",
      content: "السلام عليكم\n\nنتشرف بحضورك لحفل زفافنا\n\n📅 ٤ يوليو ٢٠٢٥ - فندق إرث\n\nيرجى تأكيد الحضور عبر الرابط المرفق\n\nبحضوركم تكتمل فرحتنا 🤲"
    },
    {
      name: "شكر على التأكيد",
      content: "شكراً لكم على تأكيد الحضور 🙏\n\nننتظركم بفارغ الصبر في يومنا المميز\n\n📅 ٤ يوليو ٢٠٢٥\n📍 فندق إرث\n\nبحضوركم تكتمل سعادتنا ❤️"
    }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2" dir="rtl">
          <MessageCircle className="w-5 h-5" />
          إرسال رسائل واتساب
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Message Warning */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">تنبيه مهم:</p>
            <p>للأرقام الجديدة، يتطلب الواتساب استخدام قوالب رسائل معتمدة للتواصل الأول. يرجى إنشاء قوالب في لوحة تحكم Zoko.</p>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <Input
              type="tel"
              placeholder="رقم الهاتف (مع رمز البلد)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              dir="ltr"
            />
          </div>
          
          <div>
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[100px]"
              dir="rtl"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              "جاري الإرسال..."
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                إرسال عبر الواتساب
              </>
            )}
          </Button>
        </form>

        <div className="space-y-2">
          <h4 className="text-white text-sm font-medium" dir="rtl">قوالب الرسائل:</h4>
          <div className="grid gap-2">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => insertTemplate(template.content)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 justify-start"
                dir="rtl"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;
