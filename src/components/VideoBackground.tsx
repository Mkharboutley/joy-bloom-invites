
import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Stop any other videos that might be playing
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((v) => {
        if (v !== video && !v.paused) {
          v.pause();
          v.currentTime = 0;
        }
      });

      // Reset video to start
      video.currentTime = 0;
      video.muted = true;
      
      // Try to play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video started playing successfully');
            // Try to unmute after 1 second
            setTimeout(() => {
              if (video && !video.paused) {
                video.muted = false;
                setIsMuted(false);
                console.log('Video unmuted successfully');
              }
            }, 1000);
          })
          .catch((error) => {
            console.log('Video autoplay failed:', error);
          });
      }
    }

    // Cleanup function to pause video when component unmounts
    return () => {
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, []);

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log('Video background loaded successfully');
    if (onLoad) onLoad();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <>
      {/* Video Background */}
      <video
        ref={videoRef}
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-1"
        onError={handleError}
        onLoadedData={handleLoad}
        preload="auto"
        style={{ zIndex: 1 }}
      >
        <source src="/G22.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Volume Control Button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/20"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
      
      {/* Fallback background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-0" />
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20 z-2" />
    </>
  );
};

export default VideoBackground;
