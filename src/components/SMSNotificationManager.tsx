import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Settings, Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw, Globe } from 'lucide-react';
import { getAdminContacts, type AdminContact } from '@/services/supabaseService';
import { sendSMS, sendBulkSMS, testMessageBirdConnection, checkUAESupport } from '@/services/messageBirdService';
import { useToast } from '@/hooks/use-toast';

const SMSNotificationManager = () => {
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testMessage, setTestMessage] = useState('تم تأكيد حضور جديد: أحمد محمد');
  const [loading, setLoading] = useState(false);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [checkingUAE, setCheckingUAE] = useState(false);
  const [uaeSupport, setUaeSupport] = useState<{
    supported: boolean;
    details: string;
    recommendations: string[];
  } | null>(null);
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

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مفتاح API أولاً",
        variant: "destructive"
      });
      return;
    }

    setTestingApiKey(true);
    try {
      console.log('🧪 Testing MessageBird API key...');
      const testResult = await testMessageBirdConnection(apiKey.trim());
      
      if (testResult.success) {
        toast({
          title: "مفتاح API صحيح",
          description: "تم التحقق من صحة مفتاح API بنجاح",
        });
      } else {
        toast({
          title: "مفتاح API غير صحيح",
          description: testResult.error || "الرجاء التحقق من مفتاح API في لوحة تحكم MessageBird",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاختبار",
        description: "فشل في اختبار مفتاح API",
        variant: "destructive"
      });
    } finally {
      setTestingApiKey(false);
    }
  };

  const checkUAEDelivery = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال مفتاح API أولاً",
        variant: "destructive"
      });
      return;
    }

    setCheckingUAE(true);
    try {
      console.log('🇦🇪 Checking UAE SMS support...');
      const uaeResult = await checkUAESupport(apiKey.trim());
      setUaeSupport(uaeResult);
      
      if (uaeResult.supported) {
        toast({
          title: "الإمارات مدعومة ✅",
          description: "MessageBird يدعم إرسال الرسائل النصية إلى الإمارات العربية المتحدة",
        });
      } else {
        toast({
          title: "مشكلة في دعم الإمارات",
          description: uaeResult.details,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في فحص الإمارات",
        description: "فشل في فحص دعم الإمارات",
        variant: "destructive"
      });
    } finally {
      setCheckingUAE(false);
    }
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
      
      // Count UAE-specific results
      const uaeResults = results.filter(r => {
        const clean = r.phoneNumber.replace(/\D/g, '');
        return clean.startsWith('971') || (clean.length === 9 && clean.startsWith('5'));
      });
      const uaeSuccessCount = uaeResults.filter(r => r.success).length;

      console.log(`📊 Test results: ${successCount} success, ${failCount} failed`);
      console.log(`🇦🇪 UAE results: ${uaeSuccessCount}/${uaeResults.length} successful`);

      if (successCount > 0) {
        let description = `تم إرسال ${successCount} رسالة بنجاح${failCount > 0 ? ` و فشل ${failCount}` : ''}`;
        if (uaeResults.length > 0) {
          description += `\n🇦🇪 الإمارات: ${uaeSuccessCount}/${uaeResults.length} نجح`;
        }
        
        toast({
          title: "تم الإرسال",
          description: description
        });
      } else {
        // Check if all failures are due to API key issues
        const apiKeyErrors = results.filter(r => 
          r.error?.includes('Invalid API key') || 
          r.error?.includes('incorrect access_key')
        );
        
        if (apiKeyErrors.length > 0) {
          toast({
            title: "مفتاح API غير صحيح",
            description: "الرجاء التحقق من مفتاح API في لوحة تحكم MessageBird والتأكد من صحته",
            variant: "destructive"
          });
        } else {
          toast({
            title: "فشل الإرسال",
            description: "فشل في إرسال جميع الرسائل. تحقق من مفتاح API وأرقام الهواتف",
            variant: "destructive"
          });
        }
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
                  placeholder="أدخل مفتاح API من MessageBird (مثل: cNt1noVlxmOEZ7SmlHI0TbDSUKC3lS1Q8psv)"
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
                onClick={testApiKey}
                disabled={testingApiKey || !apiKey.trim()}
                className="bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${testingApiKey ? 'animate-spin' : ''}`} />
                {testingApiKey ? 'اختبار...' : 'اختبار'}
              </Button>
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

          {/* UAE Support Check */}
          <div className="space-y-2">
            <Button
              onClick={checkUAEDelivery}
              disabled={checkingUAE || !apiKey.trim()}
              className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-white border border-orange-400/30"
            >
              <Globe className={`w-4 h-4 ml-2 ${checkingUAE ? 'animate-spin' : ''}`} />
              {checkingUAE ? 'فحص دعم الإمارات...' : '🇦🇪 فحص دعم الإمارات العربية المتحدة'}
            </Button>
            
            {uaeSupport && (
              <div className={`p-3 rounded-lg border ${uaeSupport.supported ? 'bg-green-500/10 border-green-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {uaeSupport.supported ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <p className={`text-sm font-semibold ${uaeSupport.supported ? 'text-green-400' : 'text-red-400'}`} dir="rtl">
                    {uaeSupport.supported ? 'الإمارات مدعومة ✅' : 'مشكلة في دعم الإمارات ❌'}
                  </p>
                </div>
                <p className={`text-xs mb-2 ${uaeSupport.supported ? 'text-green-300' : 'text-red-300'}`} dir="rtl">
                  {uaeSupport.details}
                </p>
                {uaeSupport.recommendations.length > 0 && (
                  <div>
                    <p className={`text-xs font-semibold mb-1 ${uaeSupport.supported ? 'text-green-400' : 'text-red-400'}`} dir="rtl">
                      توصيات:
                    </p>
                    <ul className={`text-xs space-y-1 ${uaeSupport.supported ? 'text-green-300' : 'text-red-300'}`} dir="rtl">
                      {uaeSupport.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
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
              3. تأكد من تفعيل صلاحية "Messages" للمفتاح
              <br />
              4. انسخ المفتاح والصقه هنا
              <br />
              5. استخدم زر "اختبار" للتحقق من صحة المفتاح
              <br />
              6. استخدم زر "فحص دعم الإمارات" للتأكد من إمكانية الإرسال للإمارات
            </p>
          </div>

          {/* UAE-specific information */}
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-400/30">
            <p className="text-green-400 text-sm" dir="rtl">
              <strong>🇦🇪 معلومات خاصة بالإمارات العربية المتحدة:</strong>
              <br />
              • MessageBird يدعم الإرسال إلى الإمارات (اتصالات، دو، فيرجن موبايل)
              <br />
              • استخدم التنسيق: 971xxxxxxxxx أو xxxxxxxxx للأرقام المحلية
              <br />
              • قد تحتاج إلى Sender ID مسجل لمعدلات تسليم أفضل
              <br />
              • النص العربي مدعوم مع ترميز Unicode
              <br />
              • اختبر مع مجموعة صغيرة أولاً للتأكد من التسليم
            </p>
          </div>

          {/* API Key Error Alert */}
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-400/30">
            <p className="text-red-400 text-sm" dir="rtl">
              <strong>إذا ظهر خطأ "incorrect access_key":</strong>
              <br />
              • تأكد من نسخ مفتاح API بالكامل بدون مسافات إضافية
              <br />
              • تحقق من أن المفتاح لم ينته صلاحيته
              <br />
              • تأكد من تفعيل صلاحية "Messages" في إعدادات المفتاح
              <br />
              • جرب إنشاء مفتاح API جديد إذا استمر الخطأ
              <br />
              • تأكد من أن حسابك يدعم الإرسال الدولي للإمارات
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
                {testResults.map((result, index) => {
                  const isUAE = result.phoneNumber.replace(/\D/g, '').startsWith('971') || 
                               (result.phoneNumber.replace(/\D/g, '').length === 9 && result.phoneNumber.replace(/\D/g, '').startsWith('5'));
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{result.phoneNumber}</span>
                        {isUAE && <span className="text-xs">🇦🇪</span>}
                      </div>
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
                  );
                })}
              </div>
              <div className="text-center text-white/80 text-sm">
                نجح: {testResults.filter(r => r.success).length} | 
                فشل: {testResults.filter(r => !r.success).length}
                {testResults.some(r => r.phoneNumber.replace(/\D/g, '').startsWith('971')) && (
                  <span className="ml-2">
                    | 🇦🇪 الإمارات: {testResults.filter(r => {
                      const isUAE = r.phoneNumber.replace(/\D/g, '').startsWith('971');
                      return r.success && isUAE;
                    }).length}/{testResults.filter(r => r.phoneNumber.replace(/\D/g, '').startsWith('971')).length}
                  </span>
                )}
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
              <p>📱 MessageBird يدعم الإمارات رسمياً مع جميع الشبكات الرئيسية</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSNotificationManager;