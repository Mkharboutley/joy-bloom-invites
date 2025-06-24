
import { Button } from '@/components/ui/button';
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'دعوة حفل الزفاف',
          text: `تم تأكيد حضور ${guestName}`,
          url: window.location.origin + `/scan/${invitationId}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/scan/${invitationId}`);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الدعوة"
      });
    }
  };

  return (
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
  );
};

export default ActionButtons;
