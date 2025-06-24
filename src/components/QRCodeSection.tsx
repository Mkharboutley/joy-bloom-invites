
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
      className="text-center p-6 rounded-2xl relative flex items-center justify-center aspect-square"
      style={{
        background: 'linear-gradient(135deg, #2D1B69 0%, #11047A 25%, #4A154B 50%, #7B2869 75%, #B91372 100%)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,215,0,0.2)'
      }}
    >
      {/* Luxury diamond pattern overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-8"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,215,0,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(255,215,0,0.15) 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, rgba(255,215,0,0.15) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,215,0,0.15) 0%, transparent 50%),
            linear-gradient(45deg, transparent 48%, rgba(255,215,0,0.1) 50%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(255,215,0,0.1) 50%, transparent 52%)
          `
        }}
      />
      
      {/* Elegant ornamental border */}
      <div 
        className="absolute inset-3 rounded-xl border-2 opacity-40"
        style={{
          borderColor: '#FFD700',
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.05) 50%, transparent 70%)'
        }}
      />
      
      {/* Inner decorative frame */}
      <div 
        className="absolute inset-6 rounded-lg border opacity-25"
        style={{
          borderColor: '#FFED4E'
        }}
      />
      
      <QRCode
        id="qr-code"
        value={qrData}
        size={140}
        style={{ margin: '0 auto', position: 'relative', zIndex: 10 }}
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
    </div>
  );
};

export default QRCodeSection;
