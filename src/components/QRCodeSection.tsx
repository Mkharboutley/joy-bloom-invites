
import QRCode from 'react-qr-code';

interface QRCodeSectionProps {
  guestName: string;
  invitationId: string;
  timestamp: string;
}

const QRCodeSection = ({ guestName, invitationId, timestamp }: QRCodeSectionProps) => {
  // Generate the actual URL that should be opened when QR code is scanned
  const qrData = `${window.location.origin}/scan/${invitationId}`;

  return (
    <div 
      className="text-center p-6 rounded-2xl relative flex items-center justify-center min-h-[225px]"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      {/* Luxury overlay pattern */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                           linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
        }}
      />
      
      {/* Elegant border */}
      <div 
        className="absolute inset-2 rounded-xl border-2 opacity-30"
        style={{
          borderImage: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700) 1'
        }}
      />
      
      <QRCode
        id="qr-code"
        value={qrData}
        size={187}
        style={{ margin: '0 auto', position: 'relative', zIndex: 10 }}
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
    </div>
  );
};

export default QRCodeSection;
