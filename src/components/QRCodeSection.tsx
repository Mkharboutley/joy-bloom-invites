
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
  );
};

export default QRCodeSection;
