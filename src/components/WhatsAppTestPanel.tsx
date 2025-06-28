import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Phone, Send, TestTube, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TwilioWhatsAppService from '@/services/twilioWhatsAppService';

const WhatsAppTestPanel = () => {
  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const twilioService = TwilioWhatsAppService.getInstance();

  const handleSingleTest = async () => {
    if (!testPhone.trim() || !testName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف والاسم",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format the phone number to ensure it has the whatsapp: prefix
      const formattedPhone = TwilioWhatsAppService.formatPhoneNumber(testPhone);
      const result = await twilioService.sendWeddingInvitation(formattedPhone, testName);
      
      const testResult = {
        id: Date.now(),
        type: 'single',
        phone: formattedPhone,
        name: testName,
        success: result,
        timestamp: new Date().toLocaleString('ar-SA')
      };

      setTestResults(prev => [testResult, ...prev]);

      toast({
        title: result ? "تم الإرسال" : "فشل الإرسال",
        description: result ? "تم إرسال الدعوة بنجاح" : "فشل في إرسال الدعوة",
        variant: result ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الإرسال",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomMessageTest = async () => {
    if (!testPhone.trim() || !testMessage.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف والرسالة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Format the phone number to ensure it has the whatsapp: prefix
      const formattedPhone = TwilioWhatsAppService.formatPhoneNumber(testPhone);
      const result = await twilioService.sendMessage({
        to: formattedPhone,
        body: testMessage
      });

      const testResult = {
        id: Date.now(),
        type: 'custom',
        phone: formattedPhone,
        message: testMessage,
        success: result.success,
        sid: result.sid,
        error: result.error,
        timestamp: new Date().toLocaleString('ar-SA')
      };

      setTestResults(prev => [testResult, ...prev]);

      toast({
        title: result.success ? "تم الإرسال" : "فشل الإرسال",
        description: result.success ? `تم الإرسال - SID: ${result.sid}` : result.error,
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الإرسال",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkTest = async () => {
    const testContacts = [
      { name: 'أحمد محمد', phoneNumber: 'whatsapp:+966501234567' },
      { name: 'فاطمة علي', phoneNumber: 'whatsapp:+966507654321' },
      { name: 'محمد أحمد', phoneNumber: 'whatsapp:+966509876543' }
    ];

    setIsLoading(true);
    try {
      const result = await twilioService.sendBulkInvitations(testContacts);

      const testResult = {
        id: Date.now(),
        type: 'bulk',
        contacts: testContacts,
        successful: result.successful,
        failed: result.failed,
        results: result.results,
        timestamp: new Date().toLocaleString('ar-SA')
      };

      setTestResults(prev => [testResult, ...prev]);

      toast({
        title: "اكتمل الإرسال المجمع",
        description: `نجح: ${result.successful}, فشل: ${result.failed}`
      });

    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الإرسال المجمع",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAutoResponses = [
    { keyword: 'موقع', description: 'اختبار الرد التلقائي لطلب الموقع' },
    { keyword: 'وقت', description: 'اختبار الرد التلقائي لطلب الوقت' },
    { keyword: 'تأكيد', description: 'اختبار الرد التلقائي لتأكيد الحضور' },
    { keyword: 'نعم', description: 'اختبار الرد التلقائي للموافقة' },
    { keyword: 'لا', description: 'اختبار الرد التلقائي للاعتذار' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <TestTube className="w-5 h-5" />
            اختبار WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
              <TabsTrigger value="single" className="data-[state=active]:bg-white/20 text-white text-xs">
                رسالة واحدة
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-white/20 text-white text-xs">
                رسالة مخصصة
              </TabsTrigger>
              <TabsTrigger value="bulk" className="data-[state=active]:bg-white/20 text-white text-xs">
                إرسال مجمع
              </TabsTrigger>
              <TabsTrigger value="webhook" className="data-[state=active]:bg-white/20 text-white text-xs">
                الردود التلقائية
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-6">
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label className="text-white">رقم الهاتف (مع رمز الدولة)</Label>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="whatsapp:+966501234567"
                    className="bg-white/20 border-white/30 text-white"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    مثال: whatsapp:+966501234567 أو +966501234567
                  </p>
                </div>
                
                <div>
                  <Label className="text-white">اسم المدعو</Label>
                  <Input
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="أحمد محمد"
                    className="bg-white/20 border-white/30 text-white"
                  />
                </div>

                <Button
                  onClick={handleSingleTest}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 ml-2" />
                  {isLoading ? 'جاري الإرسال...' : 'إرسال دعوة زفاف'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-6">
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label className="text-white">رقم الهاتف</Label>
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="whatsapp:+966501234567"
                    className="bg-white/20 border-white/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">الرسالة المخصصة</Label>
                  <Textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="bg-white/20 border-white/30 text-white"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleCustomMessageTest}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4 ml-2" />
                  {isLoading ? 'جاري الإرسال...' : 'إرسال رسالة مخصصة'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 mt-6">
              <div className="space-y-4" dir="rtl">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">اختبار الإرسال المجمع</h4>
                  <p className="text-white/70 text-sm mb-4">
                    سيتم إرسال دعوات إلى 3 أرقام تجريبية (تأكد من أن الأرقام صحيحة)
                  </p>
                  <ul className="text-white/60 text-xs space-y-1">
                    <li>• أحمد محمد: +966501234567</li>
                    <li>• فاطمة علي: +966507654321</li>
                    <li>• محمد أحمد: +966509876543</li>
                  </ul>
                </div>

                <Button
                  onClick={handleBulkTest}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Users className="w-4 h-4 ml-2" />
                  {isLoading ? 'جاري الإرسال...' : 'اختبار الإرسال المجمع'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="webhook" className="space-y-4 mt-6">
              <div className="space-y-4" dir="rtl">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">اختبار الردود التلقائية</h4>
                  <p className="text-white/70 text-sm mb-4">
                    أرسل رسالة WhatsApp إلى: <strong>+18587230879</strong>
                  </p>
                  
                  <div className="space-y-2">
                    {testAutoResponses.map((test, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white/10 rounded">
                        <span className="text-white/80 text-sm">{test.description}</span>
                        <Badge variant="outline" className="text-white border-white/30">
                          "{test.keyword}"
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                  <p className="text-yellow-200 text-sm">
                    <strong>تعليمات:</strong> أرسل أي من الكلمات المفتاحية أعلاه إلى رقم WhatsApp 
                    وستحصل على رد تلقائي فوري.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center" dir="rtl">
              نتائج الاختبارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.type === 'single' ? 'رسالة واحدة' : 
                       result.type === 'custom' ? 'رسالة مخصصة' : 'إرسال مجمع'}
                    </Badge>
                    <span className="text-white/60 text-xs">{result.timestamp}</span>
                  </div>
                  
                  <div className="text-white text-sm space-y-1" dir="rtl">
                    {result.type === 'bulk' ? (
                      <div>
                        <p>نجح: {result.successful}, فشل: {result.failed}</p>
                        <p>إجمالي: {result.contacts.length}</p>
                      </div>
                    ) : (
                      <div>
                        <p>الهاتف: {result.phone}</p>
                        {result.name && <p>الاسم: {result.name}</p>}
                        {result.sid && <p>SID: {result.sid}</p>}
                        {result.error && <p className="text-red-400">خطأ: {result.error}</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppTestPanel;