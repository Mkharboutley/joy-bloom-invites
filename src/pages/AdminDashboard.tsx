
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoBackground from '@/components/VideoBackground';
import AdminContactsManager from '@/components/AdminContactsManager';
import AttendanceStatusView from '@/components/AttendanceStatusView';
import ContactImport from '@/components/ContactImport';
import InvitationConfig from '@/components/InvitationConfig';
import SendInvitations from '@/components/SendInvitations';

const AdminDashboard = () => {
  const handleVideoError = () => {
    console.log('Video failed to load from /background.mp4 on Admin Dashboard');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully from /background.mp4 on Admin Dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
      
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
            <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-md">
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
              <TabsTrigger 
                value="whatsapp" 
                className="data-[state=active]:bg-white/20 text-white text-xs"
                dir="rtl"
              >
                إدارة WhatsApp
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="space-y-6 mt-6">
              <AttendanceStatusView />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <AdminContactsManager />
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
            
            <TabsContent value="whatsapp" className="space-y-6 mt-6">
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
                <p className="text-yellow-400 text-center" dir="rtl">
                  هذا التبويب للإدارة القديمة لـ WhatsApp. استخدم التبويبات الجديدة لإدارة شاملة.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
