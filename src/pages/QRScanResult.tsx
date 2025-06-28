import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '@/components/GlassCard';
import ApologyDialog from '@/components/ApologyDialog';
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

  const handleApologySuccess = () => {
    setGuest(prev => prev ? { ...prev, status: 'apologized' } : null);
  };

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
        <div className="relative z-20 text-white text-xl">دعوة غير صالحة</div>
      </div>
    );
  }

  const venueLocation = "https://maps.app.goo.gl/ini1momzSFJN5g4DA";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <VideoBackground onError={handleVideoError} onLoad={handleVideoLoad} />

      {/* Large Floating Orbs */}
      <div className="absolute top-32 left-16 w-48 h-48 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-2xl animate-pulse z-15" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl z-15" />
      <div className="absolute bottom-40 left-12 w-56 h-56 bg-gradient-to-r from-pink-400/35 to-purple-500/35 rounded-full blur-2xl animate-bounce z-15" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-orange-400/40 to-red-400/40 rounded-full blur-xl animate-pulse z-15" style={{ animationDelay: '1s' }} />
      
      {/* Medium Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-cyan-400/50 to-blue-500/50 rounded-full blur-lg animate-bounce z-15" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full blur-lg animate-pulse z-15" style={{ animationDelay: '2s' }} />
      
      {/* Small Accent Orbs */}
      <div className="absolute top-1/2 left-8 w-16 h-16 bg-gradient-to-r from-green-400/60 to-teal-400/60 rounded-full blur-md animate-pulse z-15" />
      <div className="absolute bottom-1/4 right-8 w-20 h-20 bg-gradient-to-r from-rose-400/50 to-pink-500/50 rounded-full blur-md z-15" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-md mx-auto">
          <div className="p-6 space-y-6">
            {/* Welcome Section - reduced spacing */}
            <div className="text-center space-y-1" dir="rtl">
              <h2 className="text-white text-xl font-bold">مرحباً بك</h2>
              <h3 className="text-white text-lg">{guest.fullName}</h3>
              <p className="text-white/80 text-xs">رقم الدعوة: {guest.invitationId}</p>
              {guest.status === 'apologized' && (
                <p className="text-red-400 text-xs font-semibold">تم الإعتذار عن الحضور</p>
              )}
            </div>

            {/* Event Details Card - reduced padding */}
            <GlassCard className="p-4 space-y-3">
              <h3 className="text-white text-base font-bold text-center" dir="rtl">تفاصيل المناسبة</h3>
              
              <div className="space-y-2 text-white" dir="rtl">
                <div className="flex justify-between">
                  <span className="font-medium text-xs">التاريخ:</span>
                  <span className="text-xs">٤ يوليو ٢٠٢٥</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-xs">الوقت:</span>
                  <span className="text-xs">٨:٣٠ مساءً</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-xs">المكان:</span>
                  <span className="text-xs">فندق إرث</span>
                </div>
              </div>
            </GlassCard>

            {/* Map Integration - reduced spacing */}
            {guest.status !== 'apologized' && (
              <div className="space-y-2">
                <h4 className="text-white text-base font-semibold text-center" dir="rtl">موقع المناسبة</h4>
                <a
                  href={venueLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-auto max-w-xs mx-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 border border-white/20 hover:border-white/40"
                  style={{ 
                    boxShadow: '0 0 0.2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.3), 0 0 8px rgba(255, 255, 255, 0.2)',
                    filter: 'drop-shadow(0 0 0.2px rgba(255, 255, 255, 0.9))'
                  }}
                >
                  <img 
                    src="/maps.png" 
                    alt="موقع الخريطة" 
                    className="h-10"
                    style={{ 
                      width: '84.8px', // 35% more than original width (48px * 1.35 = 64.8px)
                      filter: 'drop-shadow(0 0 0.2px rgba(255, 255, 255, 0.8))'
                    }}
                  />
                  <span className="text-sm">تشغيل خرائط جوجل</span>
                </a>
              </div>
            )}

            {/* Apology Button - reduced spacing */}
            {guest.status !== 'apologized' && invitationId && (
              <div className="space-y-2">
                <ApologyDialog 
                  invitationId={invitationId} 
                  onApologySuccess={handleApologySuccess}
                />
              </div>
            )}

            {/* Footer Note - reduced text size */}
            <div className="text-center text-white/90 text-base font-semibold" dir="rtl">
              {guest.status === 'apologized' ? (
                <p>نتفهم ظروفك ونتطلع لرؤيتك في مناسبة قادمة</p>
              ) : (
                <p>بحضوركم تكتمل سعادتنا</p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default QRScanResult;