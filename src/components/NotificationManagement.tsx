
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bell, MessageSquare, Users, Zap, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminContactManager from './notification/AdminContactManager';
import NotificationLogsTable from './notification/NotificationLogsTable';
import NotificationSettings from './notification/NotificationSettings';
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
          <AdminContactManager 
            contacts={adminContacts} 
            onContactsUpdate={fetchAdminContacts}
          />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppInvitationManager />
        </TabsContent>

        <TabsContent value="zoko" className="space-y-4">
          <ZokoTestPanel />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <NotificationLogsTable logs={notificationLogs} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagement;
