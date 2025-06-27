import { useRef, useEffect, useState } from 'react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set up video properties
    video.muted = true; // Start muted to allow autoplay
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.volume = 0.5; // Set moderate volume
    
    const playVideo = async () => {
      try {
        await video.play();
        console.log('Video started successfully');
        if (onLoad) onLoad();
      } catch (error) {
        console.log('Video autoplay failed:', error);
        if (onError) onError();
      }
    };

    // Start playing when ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    // Cleanup
    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [onError, onLoad]);

  const enableAudio = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      setAudioEnabled(true);
      setShowAudioPrompt(false);
      console.log('Audio enabled');
    }
  };

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    if (onError) onError();
  };

  const handleLoadedData = () => {
    console.log('Video loaded successfully');
    if (onLoad) onLoad();
  };

  return (
    <>
      {/* Background image layer - fallback */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/admin-back.jpg)',
          opacity: 0.4
        }}
      />

      {/* Background video */}
      <video
        ref={videoRef}
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-5"
        onError={handleError}
        onLoadedData={handleLoadedData}
        style={{
          pointerEvents: 'none'
        }}
      >
        <source src="/G22.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

      {/* Audio enable button */}
      {showAudioPrompt && (
        <button
          onClick={enableAudio}
          className="fixed bottom-6 right-6 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg"
          style={{
            pointerEvents: 'auto'
          }}
        >
          <span className="text-lg">🔊</span>
          <span className="text-sm font-medium">تشغيل الصوت</span>
        </button>
      )}

      {/* Audio status indicator */}
      {audioEnabled && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-500/20 backdrop-blur-md text-white px-3 py-2 rounded-full border border-green-400/30 flex items-center gap-2">
          <span className="text-sm">🎵</span>
          <span className="text-xs">الصوت مُفعل</span>
        </div>
      )}
    </>
  );
};

export default VideoBackground;