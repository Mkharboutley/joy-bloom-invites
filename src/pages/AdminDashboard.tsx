import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendanceStatusView from '@/components/AttendanceStatusView';
import NotificationManagement from '@/components/NotificationManagement';

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
              <div className="flex items-center justify-center space-x-4">
                <img 
                  src="/logo2.png" 
                  alt="Logo" 
                  className="w-[195px] h-[101.25px] object-contain opacity-80"
                />
                <CardTitle className="text-white text-2xl text-center" dir="rtl">
                  لوحة التحكم
                </CardTitle>
              </div>
            </CardHeader>
          </Card>

          {/* Admin Dashboard Tabs */}
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md">
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
                إدارة الإشعارات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="space-y-6 mt-6">
              <AttendanceStatusView />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <NotificationManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;