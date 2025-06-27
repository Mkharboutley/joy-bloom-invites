import { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent multiple instances from playing
    if (isPlayingRef.current) return;

    // Stop all other video elements on the page to prevent audio overlap
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(v => {
      if (v !== video) {
        v.pause();
        v.muted = true;
        v.currentTime = 0;
      }
    });

    // Cleanup function to stop any existing playback
    const cleanup = () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        isPlayingRef.current = false;
      }
    };

    // Stop any existing playback first
    cleanup();

    // Set up video properties
    video.muted = true; // Always start muted to avoid autoplay issues
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.volume = 0.3; // Set lower volume when unmuted
    
    // Attempt to play the video
    const playVideo = async () => {
      if (isPlayingRef.current) return;
      
      try {
        await video.play();
        isPlayingRef.current = true;
        if (onLoad) onLoad();
        
        // Try to unmute after successful play (with user interaction)
        setTimeout(() => {
          if (video && !video.paused && !isPlayingRef.current) {
            video.muted = false;
          }
        }, 1000);
      } catch (error) {
        console.log('Video autoplay failed:', error);
        isPlayingRef.current = false;
        if (onError) onError();
      }
    };

    // Start playing when video is ready
    if (video.readyState >= 3) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    // Add event listeners for better control
    const handlePause = () => {
      isPlayingRef.current = false;
    };

    const handlePlay = () => {
      isPlayingRef.current = true;
    };

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    // Cleanup on unmount
    return () => {
      cleanup();
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, [onError, onLoad]);

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    isPlayingRef.current = false;
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
          opacity: 0.4,
          transition: 'opacity 2s ease-out'
        }}
      />

      {/* Background video - single instance with audio control */}
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
          pointerEvents: 'none' // Prevent interaction issues
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