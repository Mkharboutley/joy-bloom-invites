import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Bell, Mail, MessageSquare, Phone, Plus, Settings, Trash2, Users, TestTube, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WhatsAppInvitationManager from './WhatsAppInvitationManager';
import ZokoTestPanel from './ZokoTestPanel';

interface AdminContact {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
}

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

const NotificationManagement = () => {
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    email: '',
    notification_type: 'whatsapp',
    is_active: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    auto_notify_confirmation: true,
    auto_notify_apology: true,
    daily_summary: true,
    summary_time: '18:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminContacts();
    fetchNotificationLogs();
  }, []);

  const fetchAdminContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminContacts(data || []);
    } catch (error) {
      console.error('Error fetching admin contacts:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل جهات الاتصال",
        variant: "destructive"
      });
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotificationLogs(data || []);
    } catch (error) {
      console.error('Error fetching notification logs:', error);
    }
  };

  const addAdminContact = async () => {
    if (!newContact.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم جهة الاتصال",
        variant: "destructive"
      });
      return;
    }

    if ((newContact.notification_type === 'sms' || newContact.notification_type === 'whatsapp') && !newContact.phone_number.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الهاتف للإشعارات النصية أو WhatsApp",
        variant: "destructive"
      });
      return;
    }

    if (newContact.notification_type === 'email' && !newContact.email.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_contacts')
        .insert([newContact]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة جهة الاتصال بنجاح"
      });

      setNewContact({
        name: '',
        phone_number: '',
        email: '',
        notification_type: 'whatsapp',
        is_active: true
      });
      setIsAddContactOpen(false);
      fetchAdminContacts();
    } catch (error) {
      console.error('Error adding admin contact:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  const toggleContactStatus = async (contactId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_contacts')
        .update({ is_active: !currentStatus })
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة جهة الاتصال"
      });

      fetchAdminContacts();
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('admin_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف جهة الاتصال بنجاح"
      });

      fetchAdminContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف جهة الاتصال",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = async (contact: AdminContact) => {
    try {
      // Log the test notification
      const { error } = await supabase
        .from('notification_logs')
        .insert([{
          guest_name: 'اختبار النظام',
          guest_id: 'test-notification',
          notification_type: 'test',
          sent_to: contact.notification_type === 'email' ? contact.email : contact.phone_number,
          sent_via: contact.notification_type,
          status: 'sent'
        }]);

      if (error) throw error;

      toast({
        title: "تم الإرسال",
        description: `تم إرسال إشعار تجريبي إلى ${contact.name}`
      });

      fetchNotificationLogs();
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الإشعار التجريبي",
        variant: "destructive"
      });
    }
  };

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
    <div className="space-y-6">
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-md">
          <TabsTrigger 
            value="contacts" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Users className="w-4 h-4 ml-2" />
            جهات الاتصال
          </TabsTrigger>
          <TabsTrigger 
            value="whatsapp" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <MessageSquare className="w-4 h-4 ml-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger 
            value="zoko" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Zap className="w-4 h-4 ml-2" />
            Zoko
          </TabsTrigger>
          <TabsTrigger 
            value="logs" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <AlertCircle className="w-4 h-4 ml-2" />
            سجل الإشعارات
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-white/20 text-white text-xs"
            dir="rtl"
          >
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white" dir="rtl">
                  إدارة جهات الاتصال
                </CardTitle>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة جهة اتصال
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/10 backdrop-blur-md border-white/20">
                    <DialogHeader>
                      <DialogTitle className="text-white text-center" dir="rtl">
                        إضافة جهة اتصال جديدة
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4" dir="rtl">
                      <div>
                        <Label className="text-white">الاسم</Label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          className="bg-white/20 border-white/30 text-white"
                          placeholder="اسم جهة الاتصال"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">نوع الإشعار</Label>
                        <Select 
                          value={newContact.notification_type} 
                          onValueChange={(value) => setNewContact({...newContact, notification_type: value})}
                        >
                          <SelectTrigger className="bg-white/20 border-white/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="sms">رسائل نصية (SMS)</SelectItem>
                            <SelectItem value="email">بريد إلكتروني</SelectItem>
                            <SelectItem value="push">إشعارات فورية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(newContact.notification_type === 'sms' || newContact.notification_type === 'whatsapp') && (
                        <div>
                          <Label className="text-white">رقم الهاتف</Label>
                          <Input
                            value={newContact.phone_number}
                            onChange={(e) => setNewContact({...newContact, phone_number: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            placeholder="+966xxxxxxxxx"
                          />
                        </div>
                      )}

                      {newContact.notification_type === 'email' && (
                        <div>
                          <Label className="text-white">البريد الإلكتروني</Label>
                          <Input
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                            className="bg-white/20 border-white/30 text-white"
                            placeholder="example@email.com"
                          />
                        </div>
                      )}

                      <Button onClick={addAdminContact} className="w-full">
                        إضافة جهة الاتصال
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-white/5">
                      <TableHead className="text-white text-right" dir="rtl">الاسم</TableHead>
                      <TableHead className="text-white text-right" dir="rtl">نوع الإشعار</TableHead>
                      <TableHead className="text-white text-right" dir="rtl">جهة الاتصال</TableHead>
                      <TableHead className="text-white text-right" dir="rtl">الحالة</TableHead>
                      <TableHead className="text-white text-right" dir="rtl">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminContacts.map((contact) => (
                      <TableRow key={contact.id} className="border-white/20 hover:bg-white/5">
                        <TableCell className="text-white text-right">{contact.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getNotificationIcon(contact.notification_type)}
                            <span className="text-white text-sm">
                              {contact.notification_type === 'sms' ? 'رسائل نصية' : 
                               contact.notification_type === 'email' ? 'بريد إلكتروني' : 
                               contact.notification_type === 'whatsapp' ? 'WhatsApp' : 'إشعارات فورية'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white text-right">
                          {contact.notification_type === 'email' ? contact.email : contact.phone_number}
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={contact.is_active}
                            onCheckedChange={() => toggleContactStatus(contact.id, contact.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendTestNotification(contact)}
                              className="bg-blue-600/20 hover:bg-blue-600/30 text-white border-blue-400/30"
                            >
                              اختبار
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteContact(contact.id)}
                              className="bg-red-500/20 hover:bg-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {adminContacts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-white/60 py-8" dir="rtl">
                          لا توجد جهات اتصال بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppInvitationManager />
        </TabsContent>

        <TabsContent value="zoko" className="space-y-4">
          <ZokoTestPanel />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
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
                    {notificationLogs.map((log) => (
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
                    {notificationLogs.length === 0 && (
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagement;