import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/GlassCard';
import VideoBackground from '@/components/VideoBackground';
import EntryTone from '@/components/EntryTone';
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

  const handleVideoError = () => {
    console.log('Video failed to load from /background.mp4 on Index page');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully from /background.mp4 on Index page');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
      <EntryTone autoPlay={true} />
      
      {/* Large Floating Orbs */}
      <div className="absolute top-32 left-16 w-48 h-48 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-2xl animate-pulse z-2" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl z-2" />
      <div className="absolute bottom-40 left-12 w-56 h-56 bg-gradient-to-r from-pink-400/35 to-purple-500/35 rounded-full blur-2xl animate-bounce z-2" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-orange-400/40 to-red-400/40 rounded-full blur-xl animate-pulse z-2" style={{ animationDelay: '1s' }} />
      
      {/* Medium Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-cyan-400/50 to-blue-500/50 rounded-full blur-lg animate-bounce z-2" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full blur-lg animate-pulse z-2" style={{ animationDelay: '2s' }} />
      
      {/* Small Accent Orbs */}
      <div className="absolute top-1/2 left-8 w-16 h-16 bg-gradient-to-r from-green-400/60 to-teal-400/60 rounded-full blur-md animate-pulse z-2" />
      <div className="absolute bottom-1/4 right-8 w-20 h-20 bg-gradient-to-r from-rose-400/50 to-pink-500/50 rounded-full blur-md z-2" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-md mx-auto">
          <div className="p-6 space-y-6">
            {/* Header with Untitled.png image */}
            <div className="text-center space-y-4">
              <img 
                src="/Untitled.png" 
                alt="Wedding Header" 
                className="w-full max-w-xs mx-auto"
              />
            </div>

            {/* Wedding Date and Venue */}
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl flex items-center justify-center">
              <div className="text-white font-normal text-center text-sm space-y-1" dir="rtl">
                <p>٤ يوليو ٢٠٢٥</p>
                <p>فندق نادي الضباط، قاعة إرث</p>
              </div>
            </div>

            {/* Guest Name Input */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="الرجاء إدخال الإسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-right text-center bg-white/25 border-white/40 text-white placeholder:text-white/50 placeholder:text-xs backdrop-blur-md rounded-2xl h-12 shadow-xl focus:bg-white/30 focus:border-white/60 transition-all"
                dir="rtl"
              />
            </div>

            {/* Confirmation Button */}
            <Button
              onClick={handleConfirmation}
              disabled={isLoading}
              className="w-full font-medium py-3 rounded-xl h-12 text-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              {isLoading ? "جاري التأكيد..." : "تأكيد الحضور"}
            </Button>

            {/* Logo Footer */}
            <div className="flex justify-center pt-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain opacity-60"
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Index;
