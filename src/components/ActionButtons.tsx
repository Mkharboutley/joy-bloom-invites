
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  guestName?: string;
  invitationId?: string;
}

const ActionButtons = ({ guestName, invitationId }: ActionButtonsProps) => {
  const { toast } = useToast();

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
      downloadLink.download = `invitation-${invitationId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShareQR = async () => {
    const shareUrl = `${window.location.origin}/scan/${invitationId}`;
    
    // Check if Web Share API is available and supported
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: 'دعوة حفل الزفاف',
          text: `تم تأكيد حضور ${guestName}`,
          url: shareUrl
        });
        return; // Successfully shared, exit function
      } catch (error) {
        console.log('Web Share API failed, falling back to clipboard:', error);
        // Continue to clipboard fallback
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الدعوة إلى الحافظة"
      });
    } catch (clipboardError) {
      console.log('Clipboard API failed:', clipboardError);
      toast({
        title: "خطأ",
        description: "لم يتم نسخ الرابط. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDownloadQR}
        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-medium rounded-2xl border border-emerald-400/30 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        dir="rtl"
      >
        <Download className="w-4 h-4 ml-2" />
        تنزيل الرمز
      </Button>
      
      <Button
        onClick={handleShareQR}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-2xl border border-blue-400/30 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        dir="rtl"
      >
        <Share className="w-4 h-4 ml-2" />
        مشاركة الرمز
      </Button>
    </div>
  );
};

export default ActionButtons;
