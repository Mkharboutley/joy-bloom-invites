
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
      // Try to play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video started playing, now try to unmute
            setTimeout(() => {
              if (video) {
                video.muted = false;
                setIsMuted(false);
              }
            }, 1000); // Wait 1 second then unmute
          })
          .catch((error) => {
            console.log('Video autoplay failed:', error);
            // If autoplay fails, the video will still be visible but paused
          });
      }
    }
  }, []);

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    console.log('Video error details:', e.target?.error);
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log('Video background loaded successfully');
    if (onLoad) onLoad();
  };

  const handleCanPlay = () => {
    console.log('Video can play - background should be visible');
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
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-1"
        onError={handleError}
        onLoadedData={handleLoad}
        onCanPlay={handleCanPlay}
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
      
      {/* Fallback background only if video fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-0" />
      
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20 z-2" />
    </>
  );
};

export default VideoBackground;
