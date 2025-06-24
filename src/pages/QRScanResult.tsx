import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import VideoBackground from '@/components/VideoBackground';
import { getGuestByInvitationId, Guest } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

const QRScanResult = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGuest = async () => {
      if (!invitationId) return;
      
      try {
        const guestData = await getGuestByInvitationId(invitationId);
        setGuest(guestData);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ في تحميل البيانات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGuest();
  }, [invitationId, toast]);

  const handleVideoError = () => {
    console.log('Video failed to load from /background.mp4 on QRScanResult page');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully from /background.mp4 on QRScanResult page');
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
        <div className="relative z-10 text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
        <div className="relative z-10 text-white text-xl">دعوة غير صالحة</div>
      </div>
    );
  }

  const venueLocation = "https://maps.google.com/?q=فندق+نادي+الضباط+قاعة+إرث";

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />

      {/* Main Content */}
      <GlassCard className="w-full max-w-md p-8 space-y-6 z-10">
        {/* Welcome Section */}
        <div className="text-center space-y-2" dir="rtl">
          <h2 className="text-white text-2xl font-bold">مرحباً بك</h2>
          <h3 className="text-white text-xl">{guest.fullName}</h3>
          <p className="text-white/80 text-sm">رقم الدعوة: {guest.invitationId}</p>
        </div>

        {/* Event Details Card */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-white text-xl font-bold text-center" dir="rtl">تفاصيل المناسبة</h3>
          
          <div className="space-y-3 text-white" dir="rtl">
            <div className="flex justify-between">
              <span className="font-semibold">التاريخ:</span>
              <span>٤ يوليو ٢٠٢٥</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">الوقت:</span>
              <span>٦:٠٠ مساءً</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">المكان:</span>
              <span>فندق نادي الضباط، قاعة إرث</span>
            </div>
          </div>
        </GlassCard>

        {/* Map Integration */}
        <div className="space-y-3">
          <h4 className="text-white text-lg font-semibold text-center" dir="rtl">موقع المناسبة</h4>
          <a
            href={venueLocation}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            فتح الموقع في خرائط جوجل
          </a>
        </div>

        {/* Footer Note */}
        <div className="text-center text-white/90 text-lg font-semibold" dir="rtl">
          <p>بحضوركم تكتمل سعادتنا</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default QRScanResult;
