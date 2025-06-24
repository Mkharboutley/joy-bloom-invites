
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import QRCode from 'react-qr-code';
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
    console.log('Video failed to load from /background.mp4');
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully from /background.mp4');
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `invitation-${guest?.invitationId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'دعوة حفل الزفاف',
          text: `تم تأكيد حضور ${guest?.fullName}`,
          url: window.location.origin + `/scan/${guest?.invitationId}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/scan/${guest?.invitationId}`);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الدعوة"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 z-1" />
        <div className="relative z-10 text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 z-1" />
        <div className="relative z-10 text-white text-xl">لم يتم العثور على الدعوة</div>
      </div>
    );
  }

  const qrData = JSON.stringify({
    guestName: guest.fullName,
    invitationId: guest.invitationId,
    timestamp: guest.confirmationTimestamp?.toDate?.()?.toISOString() || new Date().toISOString()
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-1" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 space-y-6">
          {/* QR Code with background image */}
          <div 
            className="text-center p-4 rounded-2xl relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/lovable-uploads/f25bded9-eae2-45c9-bc13-e3b268a73351.png')`
            }}
          >
            <div className="absolute inset-0 bg-white/80 rounded-2xl"></div>
            <div className="relative z-10">
              <QRCode
                id="qr-code"
                value={qrData}
                size={200}
                style={{ margin: '0 auto' }}
              />
            </div>
          </div>

          {/* Greeting Message */}
          <div className="text-center space-y-2" dir="rtl">
            <h2 className="text-white text-2xl font-bold">تم تأكيد الحضور</h2>
            <h3 className="text-white text-xl">أهلاً وسهلاً</h3>
            <p className="text-white/90 text-lg">بحضوركم تكتمل سعادتنا</p>
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

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleDownloadQR}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              تحميل الرمز
            </Button>
            
            <Button
              onClick={handleShareQR}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              مشاركة الرمز
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center text-white/80 text-sm space-y-2" dir="rtl">
            <p>امسح هذا الرمز للوصول إلى تفاصيل دعوتك وموقع المناسبة</p>
            <p>يرجى حفظ هذا الرمز وإحضاره معك إلى المناسبة</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ConfirmationPage;
