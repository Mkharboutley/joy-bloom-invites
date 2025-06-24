
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoBackground from '@/components/VideoBackground';
import AdminContactsManager from '@/components/AdminContactsManager';
import WhatsAppManager from '@/components/WhatsAppManager';
import AttendanceStatusView from '@/components/AttendanceStatusView';

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
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md">
              <TabsTrigger 
                value="attendance" 
                className="data-[state=active]:bg-white/20 text-white"
                dir="rtl"
              >
                حالة الحضور
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-white/20 text-white"
                dir="rtl"
              >
                إشعارات الإدارة
              </TabsTrigger>
              <TabsTrigger 
                value="whatsapp" 
                className="data-[state=active]:bg-white/20 text-white"
                dir="rtl"
              >
                رسائل WhatsApp
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="space-y-6 mt-6">
              <AttendanceStatusView />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <AdminContactsManager />
            </TabsContent>
            
            <TabsContent value="whatsapp" className="space-y-6 mt-6">
              <WhatsAppManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
