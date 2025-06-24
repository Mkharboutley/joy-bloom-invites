
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
      className="text-center p-3 rounded-2xl relative flex items-center justify-center"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1)
        `,
        width: 'fit-content',
        margin: '0 auto'
      }}
    >
      {/* Subtle inner glow - reduced size */}
      <div 
        className="absolute inset-2 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      />
      
      {/* QR Code container with clean glass effect - reduced padding */}
      <div 
        className="relative z-10 p-3 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 4px 16px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `
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
      
      {/* Elegant corner highlights - adjusted for smaller container */}
      <div 
        className="absolute top-1 left-1 w-4 h-4 rounded-tl-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)'
        }}
      />
      <div 
        className="absolute top-1 right-1 w-4 h-4 rounded-tr-xl"
        style={{
          background: 'linear-gradient(225deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)'
        }}
      />
      <div 
        className="absolute bottom-1 left-1 w-4 h-4 rounded-bl-xl"
        style={{
          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)'
        }}
      />
      <div 
        className="absolute bottom-1 right-1 w-4 h-4 rounded-br-xl"
        style={{
          background: 'linear-gradient(315deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)'
        }}
      />
    </div>
  );
};

export default QRCodeSection;
