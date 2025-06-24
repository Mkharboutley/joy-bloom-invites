
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
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Large Floating Orbs */}
      <div className="absolute top-32 left-16 w-48 h-48 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-2xl animate-pulse" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-12 w-56 h-56 bg-gradient-to-r from-pink-400/35 to-purple-500/35 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-orange-400/40 to-red-400/40 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Medium Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-cyan-400/50 to-blue-500/50 rounded-full blur-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Small Accent Orbs */}
      <div className="absolute top-1/2 left-8 w-16 h-16 bg-gradient-to-r from-green-400/60 to-teal-400/60 rounded-full blur-md animate-pulse" />
      <div className="absolute bottom-1/4 right-8 w-20 h-20 bg-gradient-to-r from-rose-400/50 to-pink-500/50 rounded-full blur-md" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-md mx-auto">
          <div className="p-8 space-y-8">
            {/* Header with PNG Image */}
            <div className="text-center space-y-6">
              <img 
                src="/Untitled.png" 
                alt="Wedding Invitation" 
                className="w-full max-w-xs mx-auto"
              />
            </div>

            {/* Wedding Date */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-xl h-14 flex items-center">
              <p className="text-white font-semibold text-center w-full" dir="rtl">
                ٤ يوليو ٢٠٢٥
              </p>
            </div>

            {/* Wedding Venue */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-xl h-14 flex items-center">
              <p className="text-white font-semibold text-center w-full" dir="rtl">
                فندق نادي الضباط، قاعة إرث
              </p>
            </div>

            {/* Guest Name Input */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="الرجاء إدخال الإسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-right bg-white/25 border-white/40 text-white placeholder:text-white/80 backdrop-blur-md rounded-2xl h-14 text-lg shadow-xl focus:bg-white/30 focus:border-white/60 transition-all"
                dir="rtl"
              />
            </div>

            {/* Confirmation Button */}
            <Button
              onClick={handleConfirmation}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl h-14 text-lg border-0 shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              {isLoading ? "جاري التأكيد..." : "تأكيد الحضور"}
            </Button>

            {/* Decorative Bottom Dots */}
            <div className="flex justify-center space-x-3 pt-6">
              <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              <div className="w-3 h-3 bg-white/70 rounded-full"></div>
              <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Index;
