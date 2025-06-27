import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface QRCodeSectionProps {
  guestName: string;
  invitationId: string;
  timestamp: string;
}

type QRStyle = {
  id: string;
  name: string;
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
};

const qrStyles: QRStyle[] = [
  {
    id: 'classic',
    name: 'كلاسيكي',
    fgColor: '#1a1a2e',
    bgColor: 'transparent',
    level: 'M'
  },
  {
    id: 'elegant',
    name: 'أنيق',
    fgColor: '#2d3748',
    bgColor: 'rgba(255,255,255,0.95)',
    level: 'H',
    style: { borderRadius: '8px' },
    containerStyle: { 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%)',
      borderRadius: '12px'
    }
  },
  {
    id: 'modern',
    name: 'عصري',
    fgColor: '#4a5568',
    bgColor: 'rgba(255,255,255,0.98)',
    level: 'H',
    style: { borderRadius: '4px' },
    containerStyle: { 
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '16px',
      border: '2px solid rgba(255,255,255,0.6)'
    }
  },
  {
    id: 'minimal',
    name: 'بسيط',
    fgColor: '#1a202c',
    bgColor: 'rgba(255,255,255,0.92)',
    level: 'M',
    containerStyle: { 
      background: 'rgba(255,255,255,0.92)',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }
  },
  {
    id: 'premium',
    name: 'فاخر',
    fgColor: '#2d3748',
    bgColor: 'rgba(248,250,252,0.98)',
    level: 'H',
    containerStyle: { 
      background: 'linear-gradient(145deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.98) 100%)',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
    }
  }
];

const QRCodeSection = ({ guestName, invitationId, timestamp }: QRCodeSectionProps) => {
  const [selectedStyle, setSelectedStyle] = useState<QRStyle>(qrStyles[0]);
  const [showStylePicker, setShowStylePicker] = useState(false);

  // Generate the actual URL that should be opened when QR code is scanned
  const qrData = `${window.location.origin}/scan/${invitationId}`;

  return (
    <div className="space-y-4">
      {/* Style Picker Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowStylePicker(!showStylePicker)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl px-4 py-2 text-sm"
        >
          <Palette className="w-4 h-4 ml-2" />
          تغيير شكل الرمز
        </Button>
      </div>

      {/* Style Options */}
      {showStylePicker && (
        <div className="grid grid-cols-3 gap-2 p-3 bg-white/10 rounded-xl border border-white/20">
          {qrStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                setSelectedStyle(style);
                setShowStylePicker(false);
              }}
              className={`p-2 rounded-lg text-xs text-white transition-all ${
                selectedStyle.id === style.id 
                  ? 'bg-white/30 border-2 border-white/60' 
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
      )}

      {/* QR Code Display */}
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
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-2 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        />
        
        {/* QR Code container with selected style */}
        <div 
          className="relative z-10 p-3"
          style={{
            borderRadius: '12px',
            ...selectedStyle.containerStyle,
            boxShadow: selectedStyle.containerStyle?.boxShadow || `
              0 4px 16px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `
          }}
        >
          <QRCode
            id="qr-code"
            value={qrData}
            size={120}
            style={{ 
              margin: '0 auto', 
              display: 'block',
              ...selectedStyle.style
            }}
            fgColor={selectedStyle.fgColor}
            bgColor={selectedStyle.bgColor}
            level={selectedStyle.level}
          />
        </div>
        
        {/* Elegant corner highlights */}
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

      {/* Style Info */}
      <div className="text-center">
        <p className="text-white/60 text-xs">
          النمط المحدد: {selectedStyle.name}
        </p>
      </div>
    </div>
  );
};

export default QRCodeSection;