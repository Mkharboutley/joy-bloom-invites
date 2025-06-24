
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            نظام تأكيد حضور الزفاف
          </h1>
          <p className="text-xl text-white/80" dir="rtl">
            منصة شاملة لإدارة دعوات الزفاف وتأكيد الحضور
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl" dir="rtl">دعوة الضيوف</CardTitle>
              <CardDescription className="text-white/70" dir="rtl">
                صفحة الدعوة الرئيسية لتأكيد الحضور
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/invitation">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  عرض الدعوة
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-xl" dir="rtl">لوحة التحكم</CardTitle>
              <CardDescription className="text-white/70" dir="rtl">
                إدارة ومتابعة تأكيدات الحضور
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/dashboard">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  لوحة التحكم
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4" dir="rtl">المميزات</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
              <div className="space-y-2">
                <div className="text-lg font-semibold" dir="rtl">تأكيد فوري</div>
                <div className="text-sm" dir="rtl">تأكيد الحضور بضغطة واحدة</div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold" dir="rtl">رمز QR</div>
                <div className="text-sm" dir="rtl">رمز QR فريد لكل ضيف</div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold" dir="rtl">متابعة حية</div>
                <div className="text-sm" dir="rtl">تحديثات فورية في الوقت الفعلي</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
