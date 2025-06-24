
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
    <div className="text-center p-6 rounded-2xl bg-white">
      <QRCode
        id="qr-code"
        value={qrData}
        size={250}
        style={{ margin: '0 auto' }}
        fgColor="#000000"
        bgColor="#FFFFFF"
      />
    </div>
  );
};

export default QRCodeSection;
