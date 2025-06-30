import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, AlertTriangle, Mail } from 'lucide-react';

const WhatsAppMessaging = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف",
        variant: "destructive"
      });
      return;
    }

    if (!useTemplate && !message.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الرسالة أو استخدام القالب",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Direct Zoko API call
      const zokoApiKey = import.meta.env.VITE_ZOKO_API_KEY;
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      const formattedPhone = cleaned.startsWith('+') ? cleaned : '+' + cleaned;

      let whatsappPayload;

      if (useTemplate) {
        whatsappPayload = {
          type: 'template',
          templateId: '01_new',
          channel: 'whatsapp',
          recipient: formattedPhone,
          language: 'ar',
          templateData: {
            params: [guestName || 'الضيف الكريم']
          }
        };
      } else {
        whatsappPayload = {
          type: 'text',
          channel: 'whatsapp',
          recipient: formattedPhone,
          message
        };
      }

      const response = await fetch('https://chat.zoko.io/v2/message', {
        method: 'POST',
        headers: {
          'apikey': zokoApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('Template message required')) {
          toast({
            title: "مطلوب قالب رسالة",
            description: "هذا رقم جديد. جرب استخدام خيار القالب المعتمد.",
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

      toast({
        title: "تم الإرسال",
        description: useTemplate ? "تم إرسال القالب بنجاح عبر الواتساب" : "تم إرسال الرسالة بنجاح عبر الواتساب",
      });

      setPhoneNumber('');
      setMessage('');
      setGuestName('');
      setUseTemplate(false);
      
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
          <label className="flex items-center gap-2 text-blue-100 cursor-pointer" dir="rtl">
            <input
              type="checkbox"
              checked={useTemplate}
              onChange={(e) => setUseTemplate(e.target.checked)}
              className="rounded"
            />
            <Mail className="w-4 h-4" />
            <span>استخدام القالب المعتمد (01_new) للأرقام الجديدة</span>
          </label>
        </div>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <Input
            type="tel"
            placeholder="رقم الهاتف (مع رمز البلد)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            dir="ltr"
          />

          {useTemplate && (
            <Input
              type="text"
              placeholder="اسم الضيف (اختياري)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              dir="rtl"
            />
          )}
          
          {!useTemplate && (
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[100px]"
              dir="rtl"
            />
          )}

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
                {useTemplate ? "إرسال القالب المعتمد" : "إرسال عبر الواتساب"}
              </>
            )}
          </Button>
        </form>

        {!useTemplate && (
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium" dir="rtl">قوالب الرسائل:</h4>
            <div className="grid gap-2">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(template.content)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 justify-start"
                  dir="rtl"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-green-100 text-sm" dir="rtl">
            <p className="font-medium mb-1">معلومة:</p>
            <p>القالب المعتمد (01_new) يُستخدم للأرقام الجديدة التي لم تتفاعل معك من قبل. الرسائل العادية تعمل مع الأرقام الموجودة.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessaging;