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

    // Set up video properties for audio playback
    video.muted = false; // Enable audio
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.volume = 0.3; // Set moderate volume
    
    const playVideo = async () => {
      try {
        // Try to play with audio first
        await video.play();
        console.log('Video with audio started successfully');
        if (onLoad) onLoad();
      } catch (error) {
        console.log('Autoplay with audio failed, trying muted:', error);
        // If autoplay with audio fails, try muted
        video.muted = true;
        try {
          await video.play();
          console.log('Video started muted');
          if (onLoad) onLoad();
        } catch (mutedError) {
          console.log('Video failed completely:', mutedError);
          if (onError) onError();
        }
      }
    };

    // Start playing when ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    // Add click handler to unmute if needed
    const handleUserInteraction = () => {
      if (video.muted) {
        video.muted = false;
        video.volume = 0.3;
        console.log('Video unmuted after user interaction');
      }
    };

    // Listen for any user interaction to enable audio
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    // Cleanup
    return () => {
      video.pause();
      video.currentTime = 0;
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
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
      {/* Background image layer - fallback */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/admin-back.jpg)',
          opacity: 0.4
        }}
      />

      {/* Background video with audio */}
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

      {/* Audio control hint (optional) */}
      <div className="absolute bottom-4 right-4 z-20 text-white/60 text-xs pointer-events-none">
        🔊 Click anywhere to enable audio
      </div>
    </>
  );
};

export default VideoBackground;