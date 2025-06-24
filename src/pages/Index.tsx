
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/wedding-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 z-1" />

      {/* Main Content */}
      <GlassCard className="w-full max-w-md p-8 space-y-6 z-10">
        {/* Wedding Logo/Image */}
        <div className="text-center">
          <img 
            src="/wedding-logo.png" 
            alt="Wedding Logo" 
            className="w-32 h-32 mx-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Wedding Date */}
        <div className="bg-white/30 backdrop-blur-sm rounded-full px-6 py-3 text-center border border-white/40">
          <p className="text-white font-semibold text-lg" dir="rtl">
            ٤ يوليو ٢٠٢٥
          </p>
        </div>

        {/* Wedding Venue */}
        <div className="bg-white/30 backdrop-blur-sm rounded-full px-6 py-3 text-center border border-white/40">
          <p className="text-white font-semibold text-lg" dir="rtl">
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
            className="text-right bg-white/30 border-white/40 text-white placeholder:text-white/70 backdrop-blur-sm"
            dir="rtl"
          />
          
          <Button
            onClick={handleConfirmation}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-full"
          >
            {isLoading ? "جاري التأكيد..." : "تأكيد الحضور"}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Index;
