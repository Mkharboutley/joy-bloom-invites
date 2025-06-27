import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Settings, Eye, EyeOff } from 'lucide-react';
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
      const contacts = await getAdminContacts();
      const smsContacts = contacts.filter(contact => 
        contact.notification_type === 'sms' && contact.phone_number
      );
      setAdminContacts(smsContacts);
    } catch (error) {
      console.error('Error loading admin contacts:', error);
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
    
    localStorage.setItem('messagebird_api_key', apiKey);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ مفتاح API بنجاح"
    });
  };

  const handleTestSMS = async () => {
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

    setLoading(true);
    setTestResults([]);

    try {
      const contacts = adminContacts.map(contact => ({
        phoneNumber: contact.phone_number!,
        message: testMessage
      }));

      const results = await sendBulkSMS(contacts, apiKey);
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
          description: "فشل في إرسال جميع الرسائل",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسائل",
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
                  placeholder="أدخل مفتاح API من MessageBird"
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
            />
          </div>

          <Button
            onClick={handleTestSMS}
            disabled={loading || !apiKey || adminContacts.length === 0}
            className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
          >
            <Send className="w-4 h-4 ml-2" />
            {loading ? 'جاري الإرسال...' : `إرسال اختبار إلى ${adminContacts.length} جهة اتصال`}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-semibold" dir="rtl">نتائج الاختبار:</h4>
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-white text-sm">{result.phoneNumber}</span>
                    <Badge className={result.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {result.success ? 'نجح' : 'فشل'}
                    </Badge>
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
                    <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white text-right">{contact.name}</TableCell>
                      <TableCell className="text-white text-right">{contact.phone_number}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                          نشط
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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

export default SMSNotificationManager;