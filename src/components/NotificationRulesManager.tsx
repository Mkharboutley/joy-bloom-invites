import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Settings, Webhook, CheckCircle, AlertTriangle, Clock, BarChart3 } from 'lucide-react';
import { getNotificationRules, type NotificationRule } from '@/services/notificationRulesService';
import { setupMessageBirdWebhook, getWebhookStatus } from '@/services/webhookService';
import { useToast } from '@/hooks/use-toast';

const NotificationRulesManager = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
    checkWebhookStatus();
  }, []);

  const loadRules = async () => {
    try {
      const data = await getNotificationRules();
      setRules(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل قواعد الإشعارات",
        variant: "destructive"
      });
    }
  };

  const checkWebhookStatus = async () => {
    const apiKey = localStorage.getItem('messagebird_api_key');
    if (!apiKey) return;

    try {
      const status = await getWebhookStatus(apiKey);
      setWebhookStatus(status);
      console.log('📊 Webhook status:', status);
    } catch (error) {
      console.error('Failed to get webhook status:', error);
    }
  };

  const handleSetupWebhook = async () => {
    const apiKey = localStorage.getItem('messagebird_api_key');
    if (!apiKey) {
      toast({
        title: "خطأ",
        description: "الرجاء إعداد مفتاح MessageBird API أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!webhookUrl.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رابط الـ Webhook",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await setupMessageBirdWebhook(apiKey, webhookUrl);
      await checkWebhookStatus();
      toast({
        title: "تم بنجاح",
        description: "تم إعداد Webhook بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إعداد Webhook",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'guest_confirmation': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'guest_apology': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'failed_delivery': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'daily_summary': return <BarChart3 className="w-4 h-4 text-blue-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTriggerName = (trigger: string) => {
    switch (trigger) {
      case 'guest_confirmation': return 'تأكيد الحضور';
      case 'guest_apology': return 'الإعتذار عن الحضور';
      case 'failed_delivery': return 'فشل التوصيل';
      case 'daily_summary': return 'التقرير اليومي';
      default: return trigger;
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhook Configuration */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Webhook className="w-5 h-5" />
            إعداد MessageBird Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <h4 className="text-blue-400 font-semibold mb-2" dir="rtl">ما هو Webhook؟</h4>
            <p className="text-blue-300 text-sm" dir="rtl">
              Webhook يسمح لـ MessageBird بإرسال تحديثات فورية عن حالة الرسائل (تم التوصيل، فشل، إلخ) 
              مما يمكننا من تتبع حالة الرسائل في الوقت الفعلي وإرسال تنبيهات تلقائية.
            </p>
          </div>

          {webhookStatus && (
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-400/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-green-400 font-semibold" dir="rtl">Webhook مُفعل</p>
              </div>
              <p className="text-green-300 text-xs" dir="rtl">
                عدد الـ Webhooks: {webhookStatus.items?.length || 0}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-white text-sm" dir="rtl">رابط Webhook (اختياري)</label>
            <Input
              placeholder="https://your-domain.com/webhook/messagebird"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              dir="ltr"
            />
            <p className="text-white/60 text-xs" dir="rtl">
              إذا كان لديك خادم ويب، يمكنك إعداد webhook لتلقي تحديثات فورية
            </p>
          </div>

          <Button
            onClick={handleSetupWebhook}
            disabled={loading || !webhookUrl.trim()}
            className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-white border border-blue-400/30"
          >
            <Webhook className="w-4 h-4 ml-2" />
            {loading ? 'جاري الإعداد...' : 'إعداد Webhook'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Bell className="w-5 h-5" />
            قواعد الإشعارات التلقائية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTriggerIcon(rule.trigger)}
                        <h3 className="text-white font-semibold">{rule.name}</h3>
                        <Badge className={rule.enabled ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-gray-500/20 text-gray-400 border-gray-400/30"}>
                          {rule.enabled ? 'مُفعل' : 'معطل'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">المحفز:</span>
                          <span className="text-white text-sm">{getTriggerName(rule.trigger)}</span>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-white/60 text-sm">القالب:</span>
                          <span className="text-white text-sm flex-1">{rule.message_template}</span>
                        </div>
                        
                        {rule.conditions && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/60 text-sm">الشروط:</span>
                            <div className="flex gap-2">
                              {rule.conditions.phone_prefix && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                  رمز البلد: {rule.conditions.phone_prefix}
                                </Badge>
                              )}
                              {rule.conditions.min_failures && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                                  حد أدنى للفشل: {rule.conditions.min_failures}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => {
                          // In a real implementation, this would update the rule
                          console.log(`Toggle rule ${rule.id}: ${checked}`);
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-400/30">
            <h4 className="text-amber-400 font-semibold mb-2" dir="rtl">كيف تعمل الإشعارات التلقائية:</h4>
            <ul className="text-amber-300 text-sm space-y-1" dir="rtl">
              <li>• <strong>تأكيد الحضور:</strong> يتم إرسال إشعار فوري عند تأكيد أي ضيف حضوره</li>
              <li>• <strong>الإعتذار:</strong> يتم إرسال إشعار عند إعتذار أي ضيف عن الحضور</li>
              <li>• <strong>فشل التوصيل:</strong> تنبيه عند فشل توصيل رسالة SMS (خاص بالإمارات)</li>
              <li>• <strong>التقرير اليومي:</strong> ملخص يومي بالإحصائيات (يمكن تفعيله)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationRulesManager;