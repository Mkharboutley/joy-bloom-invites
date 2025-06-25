import { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleStart = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.currentTime = 0;
      video.play().catch((e) => console.error('Play failed', e));
      setStarted(true);
      setIsMuted(false);
    }
  };

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    if (onError) onError();
  };

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  return (
    <>
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={handleError}
        onLoadedData={handleLoad}
      >
        <source src="/G22.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Force user interaction to enable sound */}
      {!started && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray/100 text-white text-center px-6">
          <h1 className="text-xl md:text-2xl font-medium mb-4">
            يشرفنا دعوتكم إلى حفل الزفاف
          </h1>
          <p className="text-lg md:text-xl mb-8"></p>
          <button
            onClick={handleStart}
            className="text-white text-lg w-[240px] h-[64px] rounded-[18px] backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.5)] animate-pulse transition-all"
          >
            الرجاء إضغط هنا للإستمرار
          </button>
        </div>
      )}

      {/* Volume control */}
      {started && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-all"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          <Volume2 size={20} />
        </button>
      )}

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
    </>
  );
};

export default VideoBackground;
