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

    // Set up video properties
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    
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
      {/* Background image layer - fallback - covers entire document */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/admin-back.jpg)',
          opacity: 0.4,
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      />

      {/* Background video - covers entire viewport */}
      <video
        ref={videoRef}
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-5"
        onError={handleError}
        onLoadedData={handleLoadedData}
        style={{
          pointerEvents: 'none',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      >
        <source src="/G22.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for text readability - covers entire viewport */}
      <div 
        className="fixed inset-0 bg-black/20 z-10 pointer-events-none"
        style={{
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      />
    </>
  );
};

export default VideoBackground;