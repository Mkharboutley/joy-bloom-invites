import { useRef, useEffect } from 'react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set up video to play automatically with sound
      video.muted = false;
      video.currentTime = 0;
      
      // Attempt to play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay failed:', error);
          // If autoplay fails, try muted first then unmute
          video.muted = true;
          video.play().then(() => {
            // After a short delay, try to unmute
            setTimeout(() => {
              video.muted = false;
            }, 1000);
          }).catch((e) => {
            console.error('Video play failed completely:', e);
            if (onError) onError();
          });
        });
      }
    }
  }, [onError]);

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    if (onError) onError();
  };

  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  return (
    <>
      {/* Background image layer - using admin-back.jpg since 22.png doesn't exist */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: 'url(/admin-back.jpg)',
          opacity: 0.4, // Slightly higher opacity to be more visible
          transition: 'opacity 2s ease-out'
        }}
      />

      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-5"
        onError={handleError}
        onLoadedData={handleLoad}
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