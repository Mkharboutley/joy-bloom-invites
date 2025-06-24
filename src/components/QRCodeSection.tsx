
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
      className="text-center p-8 rounded-3xl relative flex items-center justify-center aspect-square"
      style={{
        background: `
          radial-gradient(circle at 30% 40%, rgba(138, 43, 226, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(72, 61, 139, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(186, 85, 211, 0.7) 0%, transparent 50%),
          linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)
        `,
        boxShadow: `
          0 0 60px rgba(138, 43, 226, 0.4),
          0 0 120px rgba(138, 43, 226, 0.2),
          inset 0 2px 0 rgba(255, 255, 255, 0.1),
          inset 0 -2px 0 rgba(0, 0, 0, 0.2)
        `,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Animated shimmer effect */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-30"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 70%
            )
          `,
          animation: 'shimmer 3s ease-in-out infinite',
          backgroundSize: '200% 200%'
        }}
      />
      
      {/* Elegant corner accents */}
      <div 
        className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 rounded-tl-lg opacity-60"
        style={{ borderColor: '#FFD700' }}
      />
      <div 
        className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 rounded-tr-lg opacity-60"
        style={{ borderColor: '#FFD700' }}
      />
      <div 
        className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 rounded-bl-lg opacity-60"
        style={{ borderColor: '#FFD700' }}
      />
      <div 
        className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 rounded-br-lg opacity-60"
        style={{ borderColor: '#FFD700' }}
      />
      
      {/* Inner glow frame */}
      <div 
        className="absolute inset-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
      />
      
      {/* QR Code container with elegant backdrop */}
      <div 
        className="relative z-10 p-4 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <QRCode
          id="qr-code"
          value={qrData}
          size={120}
          style={{ margin: '0 auto', display: 'block' }}
          fgColor="#1a1a2e"
          bgColor="transparent"
        />
      </div>
      
      {/* Subtle pulse animation overlay */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-20 animate-pulse"
        style={{
          background: 'radial-gradient(circle at center, rgba(138, 43, 226, 0.3) 0%, transparent 70%)'
        }}
      />
    </div>
  );
};

export default QRCodeSection;
