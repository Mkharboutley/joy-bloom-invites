
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, MessageSquare, Phone, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddContactDialog from './AddContactDialog';

interface AdminContact {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
}

interface AdminContactManagerProps {
  contacts: AdminContact[];
  onContactsUpdate: () => void;
}

const AdminContactManager = ({ contacts, onContactsUpdate }: AdminContactManagerProps) => {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const { toast } = useToast();

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

      onContactsUpdate();
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

      onContactsUpdate();
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

      onContactsUpdate();
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
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white" dir="rtl">
            إدارة جهات الاتصال
          </CardTitle>
          <AddContactDialog
            isOpen={isAddContactOpen}
            onOpenChange={setIsAddContactOpen}
            onContactAdded={onContactsUpdate}
          />
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
              {contacts.map((contact) => (
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
              {contacts.length === 0 && (
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
  );
};

export default AdminContactManager;
