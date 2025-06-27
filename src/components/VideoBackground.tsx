import { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Simple cleanup function
    const cleanup = () => {
      video.pause();
      video.currentTime = 0;
    };

    // Set up video properties
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    
    // Simple play function
    const playVideo = async () => {
      try {
        await video.play();
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

    // Cleanup on unmount
    return cleanup;
  }, [onError, onLoad]);

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
        muted
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
    </>
  );
};

export default VideoBackground;