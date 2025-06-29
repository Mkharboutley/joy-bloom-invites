
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';

const NotificationSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    auto_notify_confirmation: true,
    auto_notify_apology: true,
    daily_summary: true,
    summary_time: '18:00'
  });

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-center" dir="rtl">
          إعدادات الإشعارات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white text-base">إشعار تلقائي عند تأكيد الحضور</Label>
            <p className="text-white/70 text-sm">إرسال إشعار فوري عند تأكيد أي ضيف حضوره</p>
          </div>
          <Switch
            checked={notificationSettings.auto_notify_confirmation}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, auto_notify_confirmation: checked})
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white text-base">إشعار تلقائي عند الاعتذار</Label>
            <p className="text-white/70 text-sm">إرسال إشعار فوري عند اعتذار أي ضيف</p>
          </div>
          <Switch
            checked={notificationSettings.auto_notify_apology}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, auto_notify_apology: checked})
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white text-base">ملخص يومي</Label>
            <p className="text-white/70 text-sm">إرسال ملخص يومي بحالة الحضور</p>
          </div>
          <Switch
            checked={notificationSettings.daily_summary}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, daily_summary: checked})
            }
          />
        </div>

        {notificationSettings.daily_summary && (
          <div>
            <Label className="text-white text-base">وقت الملخص اليومي</Label>
            <Input
              type="time"
              value={notificationSettings.summary_time}
              onChange={(e) => 
                setNotificationSettings({...notificationSettings, summary_time: e.target.value})
              }
              className="bg-white/20 border-white/30 text-white mt-2"
            />
          </div>
        )}

        <Button className="w-full bg-green-600 hover:bg-green-700">
          حفظ الإعدادات
        </Button>

        {/* Zoko Configuration Info */}
        <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            ✅ إعداد Zoko WhatsApp Business API
          </h4>
          <div className="text-green-200 text-sm space-y-2">
            <p>تم تكوين Zoko بنجاح! 🎉</p>
            <ul className="space-y-1 text-xs">
              <li>• API متصل ومُفعل</li>
              <li>• الردود التلقائية تعمل</li>
              <li>• الإرسال المجمع متاح</li>
              <li>• تتبع حالة الرسائل مُفعل</li>
            </ul>
            <p className="text-xs mt-2 opacity-80">
              Zoko أكثر استقراراً وموثوقية من Twilio للأعمال في المنطقة
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
