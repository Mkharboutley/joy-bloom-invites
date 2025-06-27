import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminContactsManager from '@/components/AdminContactsManager';
import AttendanceStatusView from '@/components/AttendanceStatusView';
import ContactImport from '@/components/ContactImport';
import InvitationConfig from '@/components/InvitationConfig';
import SendInvitations from '@/components/SendInvitations';
import SMSNotificationManager from '@/components/SMSNotificationManager';
import NotificationRulesManager from '@/components/NotificationRulesManager';
import SimplePushNotificationManager from '@/components/SimplePushNotificationManager';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Image Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/admin-back.jpg)' }}
      />
      
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl text-center" dir="rtl">
                لوحة تحكم الإدارة
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Admin Dashboard Tabs */}
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-8 bg-white/10 backdrop-blur-md">
              <TabsTrigger 
                value="attendance" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                حالة الحضور
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                إشعارات الإدارة
              </TabsTrigger>
              <TabsTrigger 
                value="sms" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                إعداد SMS
              </TabsTrigger>
              <TabsTrigger 
                value="push" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                الإشعارات الفورية
              </TabsTrigger>
              <TabsTrigger 
                value="auto-notifications" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                الإشعارات التلقائية
              </TabsTrigger>
              <TabsTrigger 
                value="import" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                استيراد جهات الاتصال
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                إعداد الدعوات
              </TabsTrigger>
              <TabsTrigger 
                value="send" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                إرسال الدعوات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="space-y-6 mt-6">
              <AttendanceStatusView />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <AdminContactsManager />
            </TabsContent>
            
            <TabsContent value="sms" className="space-y-6 mt-6">
              <SMSNotificationManager />
            </TabsContent>
            
            <TabsContent value="push" className="space-y-6 mt-6">
              <SimplePushNotificationManager />
            </TabsContent>
            
            <TabsContent value="auto-notifications" className="space-y-6 mt-6">
              <NotificationRulesManager />
            </TabsContent>
            
            <TabsContent value="import" className="space-y-6 mt-6">
              <ContactImport />
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6 mt-6">
              <InvitationConfig />
            </TabsContent>
            
            <TabsContent value="send" className="space-y-6 mt-6">
              <SendInvitations />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;