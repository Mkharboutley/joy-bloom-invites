
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Phone, Bell } from 'lucide-react';

interface NotificationLog {
  id: string;
  guest_name: string;
  guest_id: string;
  notification_type: string;
  sent_to: string;
  sent_via: string;
  status: string;
  created_at: string;
}

interface NotificationLogsTableProps {
  logs: NotificationLog[];
}

const NotificationLogsTable = ({ logs }: NotificationLogsTableProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'push':
        return <Bell className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { label: 'تم الإرسال', variant: 'default' as const },
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
      failed: { label: 'فشل', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-center" dir="rtl">
          سجل الإشعارات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-white/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-white/5">
                <TableHead className="text-white text-right" dir="rtl">اسم الضيف</TableHead>
                <TableHead className="text-white text-right" dir="rtl">نوع الإشعار</TableHead>
                <TableHead className="text-white text-right" dir="rtl">أرسل إلى</TableHead>
                <TableHead className="text-white text-right" dir="rtl">الطريقة</TableHead>
                <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                <TableHead className="text-white text-right" dir="rtl">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-white/20 hover:bg-white/5">
                  <TableCell className="text-white text-right">{log.guest_name}</TableCell>
                  <TableCell className="text-white text-right">
                    {log.notification_type === 'confirmation' ? 'تأكيد حضور' : 
                     log.notification_type === 'apology' ? 'اعتذار' : 'اختبار'}
                  </TableCell>
                  <TableCell className="text-white text-right">{log.sent_to}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getNotificationIcon(log.sent_via)}
                      <span className="text-white text-sm">
                        {log.sent_via === 'sms' ? 'SMS' : 
                         log.sent_via === 'email' ? 'Email' : 
                         log.sent_via === 'whatsapp' ? 'WhatsApp' : 'Push'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(log.status)}
                  </TableCell>
                  <TableCell className="text-white text-right">
                    {new Date(log.created_at).toLocaleDateString('ar-SA')}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-white/60 py-8" dir="rtl">
                    لا توجد إشعارات بعد
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationLogsTable;
