import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Send, CheckCircle, AlertTriangle, Globe, Zap } from 'lucide-react';
import { 
  isPushSupported,
  setupPushNotifications,
  sendLocalPushNotification,
  sendServiceWorkerNotification,
  isPushSubscribed,
  getStoredPushSubscription,
  unsubscribeFromPush,
  type SimplePushPayload 
} from '@/services/simplePushService';
import { useToast } from '@/hooks/use-toast';

const SimplePushNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [testNotification, setTestNotification] = useState({
    title: 'تأكيد حضور جديد ✅',
    body: 'تم تأكيد حضور أحمد محمد للزفاف - الوقت: الآن',
    icon: '/logo2.png'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPushStatus();
  }, []);

  const checkPushStatus = async () => {
    try {
      const subscribed = await isPushSubscribed();
      setIsSubscribed(subscribed);
      
      const storedSub = getStoredPushSubscription();
      setSubscription(storedSub);
      
      console.log('📱 Push status:', { subscribed, storedSub });
    } catch (error) {
      console.error('Failed to check push status:', error);
    }
  };

  const handleSubscribeToPush = async () => {
    setLoading(true);
    try {
      const newSubscription = await setupPushNotifications();
      if (newSubscription) {
        setIsSubscribed(true);
        setSubscription(newSubscription);
        toast({
          title: "تم بنجاح ✅",
          description: "تم تفعيل الإشعارات الفورية! ستصلك إشعارات عند تأكيد الحضور أو الإعتذار."
        });
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تفعيل الإشعارات. تأكد من منح الإذن للإشعارات.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تفعيل الإشعارات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
        setSubscription(null);
        toast({
          title: "تم إلغاء الاشتراك",
          description: "تم إلغاء الاشتراك في الإشعارات الفورية"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء الاشتراك",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setLoading(true);
    try {
      // Try service worker notification first, fallback to local
      let success = await sendServiceWorkerNotification(testNotification);
      
      if (!success) {
        success = await sendLocalPushNotification(testNotification);
      }
      
      if (success) {
        toast({
          title: "تم الإرسال ✅",
          description: "تم إرسال الإشعار التجريبي! تحقق من شاشة جهازك."
        });
      } else {
        toast({
          title: "خطأ في الإرسال",
          description: "فشل في إرسال الإشعار",
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

  const browserSupported = isPushSupported();

  return (
    <div className="space-y-6">
      {/* Browser Support Status */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Zap className="w-5 h-5" />
            حالة دعم الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Browser Support */}
          <div className="p-3 rounded-lg border" style={{
            backgroundColor: browserSupported ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: browserSupported ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
          }}>
            <div className="flex items-center gap-2">
              {browserSupported ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <p className={`font-semibold ${
                browserSupported ? 'text-green-400' : 'text-red-400'
              }`} dir="rtl">
                {browserSupported ? 'متصفحك يدعم الإشعارات الفورية ✅' : 'متصفحك لا يدعم الإشعارات الفورية ❌'}
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

          {/* Notification Permission Status */}
          <div className="p-3 rounded-lg border" style={{
            backgroundColor: Notification.permission === 'granted' ? 'rgba(34, 197, 94, 0.1)' : 
                           Notification.permission === 'denied' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
            borderColor: Notification.permission === 'granted' ? 'rgba(34, 197, 94, 0.3)' : 
                        Notification.permission === 'denied' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(251, 191, 36, 0.3)'
          }}>
            <div className="flex items-center gap-2">
              {Notification.permission === 'granted' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
              <p className={`font-semibold ${
                Notification.permission === 'granted' ? 'text-green-400' : 'text-yellow-400'
              }`} dir="rtl">
                إذن الإشعارات: {
                  Notification.permission === 'granted' ? 'مُمنوح ✅' :
                  Notification.permission === 'denied' ? 'مرفوض ❌' : 'لم يُطلب بعد'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications Setup */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Bell className="w-5 h-5" />
            إعداد الإشعارات الفورية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <h4 className="text-blue-400 font-semibold mb-2" dir="rtl">ما هي الإشعارات الفورية؟</h4>
            <p className="text-blue-300 text-sm" dir="rtl">
              الإشعارات الفورية تظهر على شاشة جهازك فوراً عند حدوث أي تحديث (تأكيد حضور، إعتذار، إلخ) 
              حتى لو كان التطبيق مغلق. تعمل على الهواتف والحاسوب بدون الحاجة لـ Firebase.
            </p>
          </div>

          {/* Subscribe/Unsubscribe Buttons */}
          <div className="flex gap-2">
            {!isSubscribed ? (
              <Button
                onClick={handleSubscribeToPush}
                disabled={loading || !browserSupported}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30"
              >
                <Smartphone className="w-4 h-4 ml-2" />
                {loading ? 'جاري التفعيل...' : 'تفعيل الإشعارات الفورية'}
              </Button>
            ) : (
              <Button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white border border-red-400/30"
              >
                <Bell className="w-4 h-4 ml-2" />
                {loading ? 'جاري الإلغاء...' : 'إلغاء الاشتراك'}
              </Button>
            )}
          </div>

          {/* Simple Push Info */}
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/30">
            <h4 className="text-green-400 font-semibold mb-2" dir="rtl">مميزات النظام البسيط:</h4>
            <ul className="text-green-300 text-sm space-y-1" dir="rtl">
              <li>• لا يحتاج Firebase أو إعدادات معقدة</li>
              <li>• يعمل مباشرة في المتصفح</li>
              <li>• إشعارات فورية عند تأكيد الحضور</li>
              <li>• يعمل حتى لو كان التطبيق مغلق</li>
              <li>• متوافق مع جميع المتصفحات الحديثة</li>
              <li>• آمن ولا يحتاج خوادم خارجية</li>
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
            disabled={loading || !browserSupported || Notification.permission !== 'granted'}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
          >
            <Send className="w-4 h-4 ml-2" />
            {loading ? 'جاري الإرسال...' : 'إرسال إشعار تجريبي'}
          </Button>

          {Notification.permission !== 'granted' && (
            <p className="text-yellow-400 text-sm text-center" dir="rtl">
              ⚠️ يجب تفعيل الإشعارات أولاً لإرسال الاختبار
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details */}
      {subscription && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center" dir="rtl">
              تفاصيل الاشتراك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm" dir="rtl">المنصة:</span>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                    {subscription.platform || 'Web'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm" dir="rtl">تاريخ التسجيل:</span>
                <span className="text-white text-sm">
                  {new Date(subscription.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm" dir="rtl">الحالة:</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                  نشط ✅
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimplePushNotificationManager;