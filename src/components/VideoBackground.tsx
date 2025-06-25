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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white text-center px-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">You're Invited</h1>
          <p className="text-lg md:text-xl mb-8">Tap below to enter the wedding celebration</p>
          <button
            onClick={handleStart}
            className="text-white text-lg px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-full shadow-lg transition-all"
          >
            أهلاً و سهلاً ,إضغط هنا للإستمرار
          </button>
        </div>
      )}

      {/* Volume control (optional, can remove) */}
      {started && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full transition-all"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          <Volume2 size={20} />
        </button>
      )}

      {/* Optional black overlay for text readability */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
    </>
  );
};

export default VideoBackground;
