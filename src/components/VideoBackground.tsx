
import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteButton, setShowUnmuteButton] = useState(false);

  const handleError = (e: any) => {
    console.log('Video background failed to load:', e);
    console.log('Video error details:', e.target?.error);
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log('Video background loaded successfully');
    if (onLoad) onLoad();
  };

  const handleCanPlay = async () => {
    console.log('Video can play - attempting to unmute');
    const video = videoRef.current;
    if (video) {
      // Try to play with sound first
      video.muted = false;
      try {
        await video.play();
        setIsMuted(false);
        console.log('Video playing with sound');
      } catch (error) {
        console.log('Autoplay with sound blocked, falling back to muted:', error);
        // If that fails, play muted and show unmute button
        video.muted = true;
        setIsMuted(true);
        setShowUnmuteButton(true);
        try {
          await video.play();
        } catch (mutedError) {
          console.log('Even muted autoplay failed:', mutedError);
        }
      }
    }
  };

  const toggleMute = async () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      
      if (!video.muted) {
        setShowUnmuteButton(false);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try to enable audio on user interaction
      const enableAudio = async () => {
        if (isMuted) {
          video.muted = false;
          setIsMuted(false);
          setShowUnmuteButton(false);
          console.log('Audio enabled by user interaction');
        }
      };

      // Listen for any user interaction to enable audio
      document.addEventListener('click', enableAudio, { once: true });
      document.addEventListener('touchstart', enableAudio, { once: true });

      return () => {
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
      };
    }
  }, [isMuted]);

  return (
    <>
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={false} // Start unmuted to attempt audio playback
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-1"
        onError={handleError}
        onLoadedData={handleLoad}
        onCanPlay={handleCanPlay}
        preload="auto"
        style={{ zIndex: 1 }}
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Unmute Button - only show if needed */}
      {showUnmuteButton && (
        <button
          onClick={toggleMute}
          className="fixed top-4 right-4 z-50 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 hover:bg-white/30 transition-all duration-300"
          title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      )}
      
      {/* Fallback background only if video fails */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-0" />
      
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20 z-2" />
    </>
  );
};

export default VideoBackground;
