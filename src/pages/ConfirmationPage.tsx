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
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="text-white text-xl">لم يتم العثور على الدعوة</div>
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full object-cover z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/lovable-uploads/f25bded9-eae2-45c9-bc13-e3b268a73351.png')`
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-1" />
      
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
