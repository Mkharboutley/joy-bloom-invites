import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import QRCodeSection from '@/components/QRCodeSection';
import EventDetails from '@/components/EventDetails';
import ActionButtons from '@/components/ActionButtons';
import VideoBackground from '@/components/VideoBackground';
import { getGuestById, Guest } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

const ConfirmationPage = () => {
  const { guestId } = useParams<{ guestId: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGuest = async () => {
      if (!guestId) return;
      
      try {
        const guestData = await getGuestById(guestId);
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
  }, [guestId, toast]);

  const handleVideoError = () => {
    console.log('Video failed to load from /G22.mp4');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully from /G22.mp4');
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
        <div className="relative z-20 text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
        <div className="relative z-20 text-white text-xl">لم يتم العثور على الدعوة</div>
      </div>
    );
  }

  const timestamp = guest.confirmationTimestamp?.toDate?.()?.toISOString() || new Date().toISOString();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />
      
      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-5 space-y-3">
          {/* Confirmation Message - reduced margin and spacing */}
          <div className="text-center space-y-1 -mt-3 mb-3" dir="rtl">
            <h2 className="text-white text-xl font-bold">تم تأكيد حضوركم</h2>
            <p className="text-white/90 text-base">بحضوركم تكتمل سعادتنا</p>
          </div>

          <QRCodeSection 
            guestName={guest.fullName}
            invitationId={guest.invitationId}
            timestamp={timestamp}
          />

          <EventDetails />

          <ActionButtons 
            guestName={guest.fullName}
            invitationId={guest.invitationId}
          />

          {/* Footer Note - reduced spacing */}
          <div className="text-center text-white/80 text-xs space-y-1 mt-3" dir="rtl">
            <p>امسح هذا الرمز للوصول إلى تفاصيل دعوتك وموقع المناسبة</p>
            <p>يرجى حفظ هذا الرمز وإحضاره معك إلى المناسبة</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ConfirmationPage;