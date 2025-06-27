import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { 
  getSimpleNotificationRules, 
  saveSimpleNotificationRules,
  type SimpleNotificationRule 
} from '@/services/simpleNotificationService';
import { useToast } from '@/hooks/use-toast';

const NotificationRulesManager = () => {
  const [rules, setRules] = useState<SimpleNotificationRule[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    try {
      const data = getSimpleNotificationRules();
      setRules(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل قواعد الإشعارات",
        variant: "destructive"
      });
    }
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    try {
      const updatedRules = rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      );
      setRules(updatedRules);
      saveSimpleNotificationRules(updatedRules);
      
      toast({
        title: "تم التحديث",
        description: `تم ${enabled ? 'تفعيل' : 'تعطيل'} القاعدة بنجاح`
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث القاعدة",
        variant: "destructive"
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'guest_confirmation': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'guest_apology': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'delivery_failure': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTriggerName = (trigger: string) => {
    switch (trigger) {
      case 'guest_confirmation': return 'تأكيد الحضور';
      case 'guest_apology': return 'الإعتذار عن الحضور';
      case 'delivery_failure': return 'فشل التوصيل';
      default: return trigger;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Info */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-center flex items-center justify-center gap-2" dir="rtl">
            <Settings className="w-5 h-5" />
            نظام الإشعارات البسيط
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-400/30">
            <h4 className="text-green-400 font-semibold mb-2" dir="rtl">مميزات النظام البسيط:</h4>
            <ul className="text-green-300 text-sm space-y-1" dir="rtl">
              <li>• لا يحتاج Firebase أو إعدادات معقدة</li>
              <li>• يعمل مباشرة مع Supabase</li>
              <li>• إشعارات فورية في المتصفح</li>
              <li>• رسائل SMS عبر MessageBird</li>
              <li>• قواعد قابلة للتخصيص</li>
              <li>• آمن ولا يحتاج خوادم خارجية</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <h4 className="text-blue-400 font-semibold mb-2" dir="rtl">كيف يعمل النظام:</h4>
            <ul className="text-blue-300 text-sm space-y-1" dir="rtl">
              <li>• عند تأكيد الحضور: إشعار فوري + SMS للإدارة</li>
              <li>• عند الإعتذار: إشعار فوري + SMS للإدارة</li>
              <li>• عند فشل SMS: إشعار فوري للإدارة</li>
              <li>• جميع الإشعارات تعمل حتى لو كان التطبيق مغلق</li>
            </ul>
          </div>
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
                        
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">الطرق:</span>
                          <div className="flex gap-2">
                            {rule.notification_types.map(type => (
                              <Badge key={type} className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                {type === 'sms' ? 'رسائل نصية' : 'إشعارات فورية'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-400/30">
            <h4 className="text-amber-400 font-semibold mb-2" dir="rtl">ملاحظات مهمة:</h4>
            <ul className="text-amber-300 text-sm space-y-1" dir="rtl">
              <li>• تأكد من تفعيل الإشعارات الفورية في تبويب "الإشعارات الفورية"</li>
              <li>• تأكد من إعداد MessageBird API في تبويب "إعداد SMS"</li>
              <li>• أضف جهات اتصال الإدارة في تبويب "إشعارات الإدارة"</li>
              <li>• النظام يعمل بدون Firebase ويتكامل مع Supabase</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationRulesManager;