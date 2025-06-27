import QRCode from 'react-qr-code';

interface QRCodeSectionProps {
  guestName: string;
  invitationId: string;
  timestamp: string;
}

const QRCodeSection = ({ guestName, invitationId, timestamp }: QRCodeSectionProps) => {
  // Generate the actual URL that should be opened when QR code is scanned
  const qrData = `${window.location.origin}/scan/${invitationId}`;

  // You can change this to switch between different shapes
  // Options: 'rounded', 'hexagon', 'circle', 'diamond', 'octagon'
  const shapeType = 'circle';

  const renderShape = () => {
    switch (shapeType) {
      case 'circle':
        return (
          <div 
            className="text-center p-4 relative flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3),
                inset 0 -1px 0 rgba(255, 255, 255, 0.1)
              `,
              width: '180px',
              height: '180px',
              margin: '0 auto'
            }}
          >
            {/* Inner circle with QR code */}
            <div 
              className="relative z-10 p-3 flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '140px',
                height: '140px',
                boxShadow: `
                  0 4px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <QRCode
                id="qr-code"
                value={qrData}
                size={100}
                style={{ margin: '0 auto', display: 'block' }}
                fgColor="#1a1a2e"
                bgColor="transparent"
              />
            </div>
          </div>
        );

      case 'hexagon':
        return (
          <div 
            className="text-center p-4 relative flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `,
              width: '180px',
              height: '180px',
              margin: '0 auto'
            }}
          >
            {/* Inner hexagon with QR code */}
            <div 
              className="relative z-10 p-3 flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                width: '140px',
                height: '140px',
                boxShadow: `
                  0 4px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <QRCode
                id="qr-code"
                value={qrData}
                size={100}
                style={{ margin: '0 auto', display: 'block' }}
                fgColor="#1a1a2e"
                bgColor="transparent"
              />
            </div>
          </div>
        );

      case 'diamond':
        return (
          <div 
            className="text-center p-4 relative flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transform: 'rotate(45deg)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `,
              width: '160px',
              height: '160px',
              margin: '0 auto'
            }}
          >
            {/* Inner diamond with QR code */}
            <div 
              className="relative z-10 p-3 flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: '120px',
                height: '120px',
                transform: 'rotate(-45deg)',
                boxShadow: `
                  0 4px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <QRCode
                id="qr-code"
                value={qrData}
                size={90}
                style={{ margin: '0 auto', display: 'block' }}
                fgColor="#1a1a2e"
                bgColor="transparent"
              />
            </div>
          </div>
        );

      case 'octagon':
        return (
          <div 
            className="text-center p-4 relative flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `,
              width: '180px',
              height: '180px',
              margin: '0 auto'
            }}
          >
            {/* Inner octagon with QR code */}
            <div 
              className="relative z-10 p-3 flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                width: '140px',
                height: '140px',
                boxShadow: `
                  0 4px 16px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <QRCode
                id="qr-code"
                value={qrData}
                size={100}
                style={{ margin: '0 auto', display: 'block' }}
                fgColor="#1a1a2e"
                bgColor="transparent"
              />
            </div>
          </div>
        );

      default: // 'rounded'
        return (
          <div 
            className="text-center p-3 rounded-3xl relative flex items-center justify-center"
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
            {/* Subtle inner glow */}
            <div 
              className="absolute inset-2 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            />
            
            {/* QR Code container with clean glass effect */}
            <div 
              className="relative z-10 p-3 rounded-2xl"
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
          </div>
        );
    }
  };

  return renderShape();
};

export default QRCodeSection;