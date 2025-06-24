
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
      className="text-center p-6 rounded-2xl relative bg-cover bg-center bg-no-repeat flex items-center justify-center min-h-[225px]"
      style={{
        backgroundImage: `url('/lovable-uploads/1bf2a91d-f9cf-4b6f-8efb-7e3191c192f8.png')`
      }}
    >
      <QRCode
        id="qr-code"
        value={qrData}
        size={187}
        style={{ margin: '0 auto' }}
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
    </div>
  );
};

export default QRCodeSection;
