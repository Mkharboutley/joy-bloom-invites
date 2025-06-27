import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Send, Settings, CheckCircle, AlertTriangle, Globe } from 'lucide-react';
import { 
  setupBrowserPushNotifications, 
  registerPushSubscription, 
  sendPushNotification,
  getPushSubscriptions,
  type PushNotificationPayload 
} from '@/services/messageBirdPushService';
import { useToast } from '@/hooks/use-toast';

const PushNotificationManager = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [testNotification, setTestNotification] = useState({
    title: 'تأكيد حضور جديد',
    body: 'تم تأكيد حضور أحمد محمد للزفاف',
    icon: '/logo2.png'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPushSupport();
    loadSubscriptions();
  }, []);

  const checkPushSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    console.log('📱 Push notifications supported:', supported);
    
    if (supported) {
      // Check if already subscribed
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  };

  const loadSubscriptions = async () => {
    const apiKey = localStorage.getItem('messagebird_api_key');
    if (!apiKey) return;

    try {
      const data = await getPushSubscriptions(apiKey);
      setSubscriptions(data.items || []);
    } catch (error) {
      console.error('Failed to load push subscriptions:', error);
    }
  };

  const handleSubscribeToPush = async () => {
    const apiKey = localStorage.getItem('messagebird_api_key');
    if (!apiKey) {
      toast({
        title: "خطأ",
        description: "الرجاء إعداد مفتاح MessageBird API أولاً",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Setup browser push notifications
      const subscription = await setupBrowserPushNotifications();
      if (!subscription) {
        toast({
          title: "خطأ",
          description: "فشل في إعداد الإشعارات في المتصفح",
          variant: "destructive"
        });
        return;
      }

      // Register with MessageBird
      const result = await registerPushSubscription(apiKey, subscription);
      if (result.success) {
        setIsSubscribed(true);
        await loadSubscriptions();
        toast({
          title: "تم بنجاح",
          description: "تم تفعيل الإشعارات الفورية"
        });
      } else {
        toast({
          title: "خطأ",
          description: result.error || "فشل في تسجيل الإشعارات",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تفعيل الإشعارات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    const apiKey = localStorage.getItem('messagebird_api_key');
    if (!apiKey) {
      toast({
        title: "خطأ",
        description: "الرجاء إعداد مفتاح MessageBird API أولاً",
        variant: "destructive"
      });
      return;
    }

    if (subscriptions.length === 0) {
      toast({
        title: "خطأ",
        description: "لا توجد أجهزة مشتركة في الإشعارات",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const subscriptionIds = subscriptions.map(sub => sub.id);
      const result = await sendPushNotification(apiKey, subscriptionIds, testNotification);
      
      if (result.success) {
        toast({
          title: "تم الإرسال",
          description: "تم إرسال الإشعار التجريبي بنجاح"
        });
      } else {
        toast({
          title: "خطأ",
          description: result.error || "فشل في إرسال الإشعار",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال الإشعار",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications Setup */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Bell className="w-5 h-5" />
            إعداد الإشعارات الفورية (Push Notifications)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <h4 className="text-blue-400 font-semibold mb-2" dir="rtl">ما هي الإشعارات الفورية؟</h4>
            <p className="text-blue-300 text-sm" dir="rtl">
              الإشعارات الفورية تظهر على شاشة جهازك فوراً عند حدوث أي تحديث (تأكيد حضور، إعتذار، إلخ) 
              حتى لو كان التطبيق مغلق. تعمل على الهواتف والحاسوب.
            </p>
          </div>

          {/* Browser Support Check */}
          <div className="p-3 rounded-lg border" style={{
            backgroundColor: 'serviceWorker' in navigator ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: 'serviceWorker' in navigator ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
          }}>
            <div className="flex items-center gap-2">
              {'serviceWorker' in navigator ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <p className={`font-semibold ${
                'serviceWorker' in navigator ? 'text-green-400' : 'text-red-400'
              }`} dir="rtl">
                {'serviceWorker' in navigator ? 'متصفحك يدعم الإشعارات الفورية ✅' : 'متصفحك لا يدعم الإشعارات الفورية ❌'}
              </p>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="p-3 rounded-lg border" style={{
            backgroundColor: isSubscribed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
            borderColor: isSubscribed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 191, 36, 0.3)'
          }}>
            <div className="flex items-center gap-2">
              {isSubscribed ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
              <p className={`font-semibold ${
                isSubscribed ? 'text-green-400' : 'text-yellow-400'
              }`} dir="rtl">
                {isSubscribed ? 'مشترك في الإشعارات ✅' : 'غير مشترك في الإشعارات'}
              </p>
            </div>
          </div>

          {/* Subscribe Button */}
          {!isSubscribed && (
            <Button
              onClick={handleSubscribeToPush}
              disabled={loading || !('serviceWorker' in navigator)}
              className="w-full bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
            >
              <Smartphone className="w-4 h-4 ml-2" />
              {loading ? 'جاري التفعيل...' : 'تفعيل الإشعارات الفورية'}
            </Button>
          )}

          {/* MessageBird Integration Info */}
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
            <h4 className="text-purple-400 font-semibold mb-2" dir="rtl">مميزات MessageBird Push:</h4>
            <ul className="text-purple-300 text-sm space-y-1" dir="rtl">
              <li>• إشعارات فورية على جميع الأجهزة</li>
              <li>• تعمل حتى لو كان التطبيق مغلق</li>
              <li>• دعم للصور والأيقونات المخصصة</li>
              <li>• تقارير توصيل مفصلة</li>
              <li>• دعم للإشعارات المجمعة</li>
              <li>• أمان عالي مع تشفير end-to-end</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            اختبار الإشعارات الفورية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="عنوان الإشعار"
              value={testNotification.title}
              onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="rtl"
            />
            <Input
              placeholder="رابط الأيقونة (اختياري)"
              value={testNotification.icon}
              onChange={(e) => setTestNotification(prev => ({ ...prev, icon: e.target.value }))}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="ltr"
            />
          </div>
          
          <Textarea
            placeholder="نص الإشعار"
            value={testNotification.body}
            onChange={(e) => setTestNotification(prev => ({ ...prev, body: e.target.value }))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            dir="rtl"
            rows={3}
          />

          <Button
            onClick={handleSendTestNotification}
            disabled={loading || !isSubscribed || subscriptions.length === 0}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
          >
            <Send className="w-4 h-4 ml-2" />
            {loading ? 'جاري الإرسال...' : `إرسال إشعار تجريبي (${subscriptions.length} جهاز)`}
          </Button>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center" dir="rtl">
            الأجهزة المشتركة ({subscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className="rounded-md border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white text-right" dir="rtl">المنصة</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">تاريخ التسجيل</TableHead>
                    <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription, index) => (
                    <TableRow key={subscription.id || index} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white text-right">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {subscription.platform || 'Web'}
                        </div>
                      </TableCell>
                      <TableCell className="text-white text-right">
                        {subscription.created_at ? new Date(subscription.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </TableCell>
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
              <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد أجهزة مشتركة بعد</p>
              <p className="text-sm mt-2">قم بتفعيل الإشعارات أعلاه لبدء استقبال التنبيهات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationManager;