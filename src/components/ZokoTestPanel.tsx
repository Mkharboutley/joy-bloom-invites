import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Phone, Send, TestTube, Users, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ZokoWhatsAppService from '@/services/zoko/zokoWhatsAppService';

const ZokoTestPanel = () => {
  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; phoneNumber?: string; error?: string }>({ connected: false });
  const { toast } = useToast();

  const zokoService = ZokoWhatsAppService.getInstance();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const result = await zokoService.testConnection();
      setConnectionStatus({
        connected: result.success,
        phoneNumber: result.phoneNumber,
        error: result.error
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: 'Failed to test connection'
      });
    }
  };

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
      const result = await zokoService.sendWeddingInvitation(testPhone, testName);
      
      const testResult = {
        id: Date.now(),
        type: 'single',
        phone: testPhone,
        name: testName,
        success: result,
        timestamp: new Date().toLocaleString('ar-SA'),
        provider: 'Zoko'
      };

      setTestResults(prev => [testResult, ...prev]);

      toast({
        title: result ? "تم الإرسال" : "فشل الإرسال",
        description: result ? "تم إرسال الدعوة عبر Zoko بنجاح" : "فشل في إرسال الدعوة",
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
      const result = await zokoService.sendMessage({
        messaging_product: 'whatsapp',
        to: zokoService.formatPhoneNumber(testPhone),
        type: 'text',
        text: { body: testMessage }
      });

      const testResult = {
        id: Date.now(),
        type: 'custom',
        phone: testPhone,
        message: testMessage,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        timestamp: new Date().toLocaleString('ar-SA'),
        provider: 'Zoko'
      };

      setTestResults(prev => [testResult, ...prev]);

      toast({
        title: result.success ? "تم الإرسال" : "فشل الإرسال",
        description: result.success ? `تم الإرسال - ID: ${result.messageId}` : result.error,
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
      { name: 'أحمد محمد', phoneNumber: '966501234567' },
      { name: 'فاطمة علي', phoneNumber: '966507654321' },
      { name: 'محمد أحمد', phoneNumber: '966509876543' }
    ];

    setIsLoading(true);
    try {
      const result = await zokoService.sendBulkInvitations(testContacts, undefined, (sent, total) => {
        console.log(`Progress: ${sent}/${total}`);
      });

      const testResult = {
        id: Date.now(),
        type: 'bulk',
        contacts: testContacts,
        successful: result.successful,
        failed: result.failed,
        results: result.results,
        timestamp: new Date().toLocaleString('ar-SA'),
        provider: 'Zoko'
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
      {/* Connection Status */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Wifi className="w-5 h-5" />
            حالة الاتصال بـ Zoko
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            {connectionStatus.connected ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div className="text-center">
                  <p className="text-green-400 font-semibold">متصل بنجاح</p>
                  {connectionStatus.phoneNumber && (
                    <p className="text-white/70 text-sm">رقم WhatsApp: {connectionStatus.phoneNumber}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-400" />
                <div className="text-center">
                  <p className="text-red-400 font-semibold">غير متصل</p>
                  {connectionStatus.error && (
                    <p className="text-white/70 text-sm">{connectionStatus.error}</p>
                  )}
                </div>
              </>
            )}
            <Button onClick={testConnection} size="sm" variant="outline">
              إعادة اختبار
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <TestTube className="w-5 h-5" />
            اختبار Zoko WhatsApp Business API
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
                    placeholder="966501234567 أو +966501234567"
                    className="bg-white/20 border-white/30 text-white"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    مثال: 966501234567 (بدون + أو whatsapp:)
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
                  disabled={isLoading || !connectionStatus.connected}
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
                    placeholder="966501234567"
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
                  disabled={isLoading || !connectionStatus.connected}
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
                    <li>• أحمد محمد: 966501234567</li>
                    <li>• فاطمة علي: 966507654321</li>
                    <li>• محمد أحمد: 966509876543</li>
                  </ul>
                </div>

                <Button
                  onClick={handleBulkTest}
                  disabled={isLoading || !connectionStatus.connected}
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
                    أرسل رسالة WhatsApp إلى: <strong>{connectionStatus.phoneNumber || 'رقم غير متاح'}</strong>
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

                <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                  <p className="text-green-200 text-sm">
                    <strong>✅ Zoko مُفعل:</strong> أرسل أي من الكلمات المفتاحية أعلاه إلى رقم WhatsApp 
                    وستحصل على رد تلقائي فوري عبر Zoko Business API.
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
              نتائج اختبارات Zoko
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.type === 'single' ? 'رسالة واحدة' : 
                         result.type === 'custom' ? 'رسالة مخصصة' : 'إرسال مجمع'}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/30">
                        {result.provider}
                      </Badge>
                    </div>
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
                        {result.messageId && <p>Message ID: {result.messageId}</p>}
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

export default ZokoTestPanel;
