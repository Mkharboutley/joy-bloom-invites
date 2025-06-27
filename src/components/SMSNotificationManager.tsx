import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Settings, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAdminContacts, type AdminContact } from '@/services/supabaseService';
import { sendSMS, sendBulkSMS } from '@/services/messageBirdService';
import { useToast } from '@/hooks/use-toast';

const SMSNotificationManager = () => {
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testMessage, setTestMessage] = useState('تم تأكيد حضور جديد: أحمد محمد');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{phoneNumber: string; success: boolean; error?: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminContacts();
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('messagebird_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const loadAdminContacts = async () => {
    try {
      console.log('🔄 Loading admin contacts...');
      const contacts = await getAdminContacts();
      const smsContacts = contacts.filter(contact => 
        contact.notification_type === 'sms' && contact.phone_number
      );
      console.log(`📋 Found ${smsContacts.length} SMS contacts out of ${contacts.length} total contacts`);
      setAdminContacts(smsContacts);
    } catch (error) {
      console.error('❌ Error loading admin contacts:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل جهات الاتصال",
        variant: "destructive"
      });
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مفتاح MessageBird API",
        variant: "destructive"
      });
      return;
    }
    
    if (apiKey.trim().length < 10) {
      toast({
        title: "خطأ",
        description: "مفتاح API غير صحيح - يجب أن يكون أطول من 10 أحرف",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('messagebird_api_key', apiKey.trim());
    console.log('💾 API key saved to localStorage');
    toast({
      title: "تم الحفظ",
      description: "تم حفظ مفتاح API بنجاح"
    });
  };

  const validatePhoneNumbers = () => {
    const invalidContacts = adminContacts.filter(contact => {
      const phone = contact.phone_number?.replace(/\D/g, '') || '';
      // Accept UAE (971) and Saudi (966) numbers, or 9-digit local numbers
      const isValidUAE = phone.startsWith('971') && phone.length === 12;
      const isValidSaudi = phone.startsWith('966') && phone.length === 12;
      const isValidLocal = phone.length === 9 && phone.startsWith('5');
      
      return !(isValidUAE || isValidSaudi || isValidLocal);
    });
    
    if (invalidContacts.length > 0) {
      console.warn('⚠️ Invalid phone numbers found:', invalidContacts);
      toast({
        title: "تحذير",
        description: `${invalidContacts.length} أرقام هواتف غير صحيحة. استخدم التنسيق: 971xxxxxxxxx (الإمارات) أو 966xxxxxxxxx (السعودية)`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleTestSMS = async () => {
    console.log('🧪 Starting SMS test...');
    
    if (!apiKey.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مفتاح MessageBird API أولاً",
        variant: "destructive"
      });
      return;
    }

    if (adminContacts.length === 0) {
      toast({
        title: "خطأ",
        description: "لا توجد جهات اتصال SMS مضافة",
        variant: "destructive"
      });
      return;
    }

    if (!testMessage.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال نص الرسالة",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumbers()) {
      return;
    }

    setLoading(true);
    setTestResults([]);

    try {
      console.log(`📤 Preparing to send test SMS to ${adminContacts.length} contacts`);
      console.log('📝 Test message:', testMessage);
      
      const contacts = adminContacts.map(contact => ({
        phoneNumber: contact.phone_number!,
        message: testMessage
      }));

      console.log('📞 Contact list:', contacts);

      const results = await sendBulkSMS(contacts, apiKey.trim());
      setTestResults(results);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      console.log(`📊 Test results: ${successCount} success, ${failCount} failed`);

      if (successCount > 0) {
        toast({
          title: "تم الإرسال",
          description: `تم إرسال ${successCount} رسالة بنجاح${failCount > 0 ? ` و فشل ${failCount}` : ''}`
        });
      } else {
        toast({
          title: "فشل الإرسال",
          description: "فشل في إرسال جميع الرسائل. تحقق من مفتاح API وأرقام الهواتف",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Error sending test SMS:', error);
      toast({
        title: "خطأ",
        description: `حدث خطأ أثناء إرسال الرسائل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            إعداد MessageBird SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white text-sm" dir="rtl">مفتاح MessageBird API</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="أدخل مفتاح API من MessageBird (مثل: NFo58JnOC5jH4khza8pFYXtEzaCiKejmRZUc)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/60 hover:text-white"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSaveApiKey}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
              >
                <Settings className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
            {apiKey && (
              <div className="flex items-center gap-2 text-sm">
                {apiKey.length >= 10 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">مفتاح API صحيح ✅</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">مفتاح API قصير جداً</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <p className="text-blue-400 text-sm" dir="rtl">
              <strong>كيفية الحصول على مفتاح API:</strong>
              <br />
              1. اذهب إلى{' '}
              <a 
                href="https://dashboard.messagebird.com/en/developers/access" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-300"
              >
                MessageBird Dashboard
              </a>
              <br />
              2. انقر على "Add access key"
              <br />
              3. انسخ المفتاح والصقه هنا
              <br />
              4. تأكد من أن المفتاح يبدأ بأحرف وأرقام (مثل: NFo58JnOC5jH...)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test SMS */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            اختبار إرسال الرسائل النصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white text-sm" dir="rtl">رسالة الاختبار</label>
            <Textarea
              placeholder="أدخل نص الرسالة للاختبار"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="rtl"
              rows={3}
            />
            <p className="text-white/60 text-xs" dir="rtl">
              عدد الأحرف: {testMessage.length} (الحد الأقصى: 160 حرف لرسالة واحدة)
            </p>
          </div>

          <Button
            onClick={handleTestSMS}
            disabled={loading || !apiKey || adminContacts.length === 0 || !testMessage.trim()}
            className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-2" />
            {loading ? 'جاري الإرسال...' : `إرسال اختبار إلى ${adminContacts.length} جهة اتصال`}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-semibold" dir="rtl">نتائج الاختبار:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded text-sm">
                    <span className="text-white">{result.phoneNumber}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={result.success ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-red-500/20 text-red-400 border-red-400/30"}>
                        {result.success ? 'نجح ✅' : 'فشل ❌'}
                      </Badge>
                      {!result.success && result.error && (
                        <span className="text-red-400 text-xs max-w-40 truncate" title={result.error}>
                          {result.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-white/80 text-sm">
                نجح: {testResults.filter(r => r.success).length} | 
                فشل: {testResults.filter(r => !r.success).length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Contacts List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            جهات اتصال SMS ({adminContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminContacts.length > 0 ? (
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">رقم الهاتف</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">البلد</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminContacts.map((contact) => {
                    const phone = contact.phone_number?.replace(/\D/g, '') || '';
                    const isValidUAE = phone.startsWith('971') && phone.length === 12;
                    const isValidSaudi = phone.startsWith('966') && phone.length === 12;
                    const isValidLocal = phone.length === 9 && phone.startsWith('5');
                    const isValid = isValidUAE || isValidSaudi || isValidLocal;
                    
                    let country = '';
                    if (phone.startsWith('971') || (phone.length === 9 && phone.startsWith('5'))) {
                      country = '🇦🇪 الإمارات';
                    } else if (phone.startsWith('966')) {
                      country = '🇸🇦 السعودية';
                    } else {
                      country = '🌍 دولي';
                    }
                    
                    return (
                      <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                        <TableCell className="text-white text-right">{contact.name}</TableCell>
                        <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                        <TableCell className="text-white text-right">{country}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={isValid ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"}>
                            {isValid ? 'صحيح ✅' : 'تحقق من الرقم ⚠️'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-white/60 py-8" dir="rtl">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد جهات اتصال SMS مضافة بعد</p>
              <p className="text-sm mt-2">اذهب إلى تبويب "إشعارات الإدارة" لإضافة جهات اتصال</p>
            </div>
          )}

          {/* Phone Number Format Guide */}
          <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-400/30">
            <h4 className="text-amber-400 font-semibold mb-2" dir="rtl">تنسيق أرقام الهواتف المدعومة:</h4>
            <div className="text-amber-300 text-sm space-y-1" dir="rtl">
              <p>🇦🇪 <strong>الإمارات:</strong> 971509011275 أو 509011275</p>
              <p>🇸🇦 <strong>السعودية:</strong> 966501234567 أو 501234567</p>
              <p>⚠️ تأكد من إدخال الرقم بدون مسافات أو رموز (+، 00)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSNotificationManager;