
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/GlassCard';
import { confirmAttendance } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConfirmation = async () => {
    if (!fullName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الاسم الكامل",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const guestId = await confirmAttendance(fullName);
      navigate(`/confirmation/${guestId}`);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تأكيد الحضور، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-60 blur-xl animate-pulse" />
      <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-50 blur-lg animate-bounce" />
      <div className="absolute bottom-32 left-20 w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full opacity-40 blur-md" />
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-30 blur-lg animate-pulse" />
      
      {/* Spiral/Wave Elements */}
      <div className="absolute top-10 right-5 w-16 h-64 bg-gradient-to-b from-orange-500 to-red-500 opacity-30 transform rotate-45 rounded-full blur-sm" />
      <div className="absolute bottom-10 left-5 w-12 h-48 bg-gradient-to-b from-cyan-500 to-blue-500 opacity-20 transform -rotate-45 rounded-full blur-sm" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-sm p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">💒</span>
              </div>
            </div>
            <h1 className="text-white text-xl font-bold" dir="rtl">
              دعوة حفل الزفاف
            </h1>
          </div>

          {/* Wedding Date */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <p className="text-white font-semibold text-center" dir="rtl">
              ٤ يوليو ٢٠٢٥
            </p>
          </div>

          {/* Wedding Venue */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <p className="text-white font-semibold text-center text-sm" dir="rtl">
              فندق نادي الضباط، قاعة إرث
            </p>
          </div>

          {/* Guest Name Input */}
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="الرجاء إدخال الإسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-right bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm rounded-2xl h-12"
              dir="rtl"
            />
          </div>

          {/* Confirmation Button */}
          <Button
            onClick={handleConfirmation}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-2xl h-12 border-0"
          >
            {isLoading ? "جاري التأكيد..." : "تأكيد الحضور"}
          </Button>

          {/* Bottom Dots */}
          <div className="flex justify-center space-x-2 pt-4">
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Index;
