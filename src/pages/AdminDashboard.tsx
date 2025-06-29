
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AttendanceStatusView from '@/components/AttendanceStatusView';
import WhatsAppMessaging from '@/components/WhatsAppMessaging';

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

          {/* Admin Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceStatusView />
            <WhatsAppMessaging />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
