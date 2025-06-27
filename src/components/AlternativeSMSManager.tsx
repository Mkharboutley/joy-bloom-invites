import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Settings, Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getAdminContacts, type AdminContact } from '@/services/supabaseService';
import { sendTwilioSMS, sendUnifonicSMS, testAlternativeService } from '@/services/alternativeSmsService';
import { useToast } from '@/hooks/use-toast';

const AlternativeSMSManager = () => {
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);
  const [provider, setProvider] = useState<'twilio' | 'unifonic'>('twilio');
  const [credentials, setCredentials] = useState({
    twilio: {
      accountSid: '',
      authToken: '',
      fromNumber: ''
    },
    unifonic: {
      appSid: ''
    }
  });
  const [showCredentials, setShowCredentials] = useState(false);
  const [testMessage, setTestMessage] = useState('تم تأكيد حضور جديد: أحمد محمد');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<Array<{phoneNumber: string; success: boolean; error?: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAdminContacts();
    // Load saved credentials
    const savedTwilio = localStorage.getItem('twilio_credentials');
    const savedUnifonic = localStorage.getItem('unifonic_credentials');
    
    if (savedTwilio) {
      try {
        setCredentials(prev => ({ ...prev, twilio: JSON.parse(savedTwilio) }));
      } catch (e) {
        console.error('Failed to parse saved Twilio credentials');
      }
    }
    
    if (savedUnifonic) {
      try {
        setCredentials(prev => ({ ...prev, unifonic: JSON.parse(savedUnifonic) }));
      } catch (e) {
        console.error('Failed to parse saved Unifonic credentials');
      }
    }
  }, []);

  const loadAdminContacts = async () => {
    try {
      const contacts = await getAdminContacts();
      const smsContacts = contacts.filter(contact => 
        contact.notification_type === 'sms' && contact.phone_number
      );
      setAdminContacts(smsContacts);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل جهات الاتصال",
        variant: "destructive"
      });
    }
  };

  const handleSaveCredentials = () => {
    if (provider === 'twilio') {
      if (!credentials.twilio.accountSid || !credentials.twilio.authToken || !credentials.twilio.fromNumber) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال جميع بيانات Twilio",
          variant: "destructive"
        });
        return;
      }
      localStorage.setItem('twilio_credentials', JSON.stringify(credentials.twilio));
    } else {
      if (!credentials.unifonic.appSid) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال App SID للـ Unifonic",
          variant: "destructive"
        });
        return;
      }
      localStorage.setItem('unifonic_credentials', JSON.stringify(credentials.unifonic));
    }
    
    toast({
      title: "تم الحفظ",
      description: "تم حفظ بيانات الاعتماد بنجاح"
    });
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await testAlternativeService(provider, credentials[provider]);
      
      if (result.success) {
        toast({
          title: "الاتصال صحيح",
          description: `تم التحقق من صحة بيانات ${provider === 'twilio' ? 'Twilio' : 'Unifonic'} بنجاح`,
        });
      } else {
        toast({
          title: "فشل الاتصال",
          description: result.error || "الرجاء التحقق من بيانات الاعتماد",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاختبار",
        description: "فشل في اختبار الاتصال",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Helper function to normalize phone numbers for comparison
  const normalizePhoneNumber = (phoneNumber: string): string => {
    return phoneNumber.replace(/\D/g, '');
  };

  const handleTestSMS = async () => {
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

    setLoading(true);
    setTestResults([]);

    try {
      const results = [];
      
      for (const contact of adminContacts) {
        try {
          let result;
          
          if (provider === 'twilio') {
            // Check if 'To' and 'From' numbers are the same for Twilio
            const normalizedToNumber = normalizePhoneNumber(contact.phone_number!);
            const normalizedFromNumber = normalizePhoneNumber(credentials.twilio.fromNumber);
            
            if (normalizedToNumber === normalizedFromNumber) {
              results.push({
                phoneNumber: contact.phone_number!,
                success: false,
                error: "لا يمكن إرسال رسالة إلى نفس رقم المرسل في Twilio"
              });
              continue;
            }
            
            result = await sendTwilioSMS(
              contact.phone_number!,
              testMessage,
              credentials.twilio.accountSid,
              credentials.twilio.authToken,
              credentials.twilio.fromNumber
            );
          } else {
            result = await sendUnifonicSMS(
              contact.phone_number!,
              testMessage,
              credentials.unifonic.appSid
            );
          }
          
          results.push({
            phoneNumber: contact.phone_number!,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            phoneNumber: contact.phone_number!,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      setTestResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast({
          title: "تم الإرسال",
          description: `تم إرسال ${successCount} رسالة بنجاح${failCount > 0 ? ` و فشل ${failCount}` : ''}`
        });
      } else {
        toast({
          title: "فشل الإرسال",
          description: "فشل في إرسال جميع الرسائل. تحقق من بيانات الاعتماد وأرقام الهواتف",
          variant: "destructive"
        });
      }
    } catch (error) {
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
      {/* Provider Selection */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            اختيار مزود خدمة SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setProvider('twilio')}
              variant={provider === 'twilio' ? 'default' : 'outline'}
              className={`h-20 ${provider === 'twilio' ? 'bg-blue-500/20 border-blue-400/30' : 'border-white/20'} text-white`}
            >
              <div className="text-center">
                <div className="font-bold">Twilio</div>
                <div className="text-xs">يدعم الإمارات والسعودية</div>
              </div>
            </Button>
            
            <Button
              onClick={() => setProvider('unifonic')}
              variant={provider === 'unifonic' ? 'default' : 'outline'}
              className={`h-20 ${provider === 'unifonic' ? 'bg-green-500/20 border-green-400/30' : 'border-white/20'} text-white`}
            >
              <div className="text-center">
                <div className="font-bold">Unifonic</div>
                <div className="text-xs">متخصص في الشرق الأوسط</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Configuration */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            إعداد {provider === 'twilio' ? 'Twilio' : 'Unifonic'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider === 'twilio' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white text-sm" dir="rtl">Account SID</label>
                <div className="relative">
                  <Input
                    type={showCredentials ? "text" : "password"}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={credentials.twilio.accountSid}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      twilio: { ...prev.twilio, accountSid: e.target.value }
                    }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/60 hover:text-white"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    {showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm" dir="rtl">Auth Token</label>
                <Input
                  type={showCredentials ? "text" : "password"}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={credentials.twilio.authToken}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    twilio: { ...prev.twilio, authToken: e.target.value }
                  }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  dir="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white text-sm" dir="rtl">From Number</label>
                <Input
                  placeholder="+1234567890"
                  value={credentials.twilio.fromNumber}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    twilio: { ...prev.twilio, fromNumber: e.target.value }
                  }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  dir="ltr"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white text-sm" dir="rtl">App SID</label>
                <Input
                  type={showCredentials ? "text" : "password"}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={credentials.unifonic.appSid}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    unifonic: { ...prev.unifonic, appSid: e.target.value }
                  }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  dir="ltr"
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={testingConnection}
              className="bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'اختبار...' : 'اختبار الاتصال'}
            </Button>
            
            <Button
              onClick={handleSaveCredentials}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
            >
              <Settings className="w-4 h-4 ml-2" />
              حفظ البيانات
            </Button>
          </div>

          {/* Setup Instructions */}
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <p className="text-blue-400 text-sm" dir="rtl">
              <strong>
                {provider === 'twilio' ? 'إعداد Twilio:' : 'إعداد Unifonic:'}
              </strong>
              <br />
              {provider === 'twilio' ? (
                <>
                  1. اذهب إلى{' '}
                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="underline">
                    Twilio Console
                  </a>
                  <br />
                  2. انسخ Account SID و Auth Token من لوحة التحكم
                  <br />
                  3. اشتري رقم هاتف من Twilio لإرسال الرسائل
                  <br />
                  4. أدخل الرقم في حقل "From Number"
                </>
              ) : (
                <>
                  1. اذهب إلى{' '}
                  <a href="https://unifonic.com" target="_blank" rel="noopener noreferrer" className="underline">
                    Unifonic
                  </a>
                  <br />
                  2. أنشئ حساب وتحقق من هويتك
                  <br />
                  3. احصل على App SID من لوحة التحكم
                  <br />
                  4. قم بتسجيل Sender ID إذا لزم الأمر
                </>
              )}
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
          </div>

          <Button
            onClick={handleTestSMS}
            disabled={loading || adminContacts.length === 0 || !testMessage.trim()}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminContacts.map((contact) => {
                    const phone = contact.phone_number?.replace(/\D/g, '') || '';
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AlternativeSMSManager;