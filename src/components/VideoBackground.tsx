
import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoStatus, setVideoStatus] = useState('loading');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Stop any other videos that might be playing
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((v) => {
      if (v !== video && !v.paused) {
        v.pause();
        v.currentTime = 0;
      }
    });

    console.log('VideoBackground: Initializing video');
    
    // Reset video properties
    video.currentTime = 0;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    // Add event listeners for debugging
    const handleLoadStart = () => {
      console.log('VideoBackground: Load started');
      setVideoStatus('loading');
    };

    const handleLoadedMetadata = () => {
      console.log('VideoBackground: Metadata loaded');
    };

    const handleLoadedData = () => {
      console.log('VideoBackground: Data loaded');
      setVideoStatus('loaded');
      if (onLoad) onLoad();
    };

    const handleCanPlay = () => {
      console.log('VideoBackground: Can play');
      // Try to play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('VideoBackground: Playing successfully');
            setVideoStatus('playing');
            // Try to unmute after 2 seconds for better compatibility
            setTimeout(() => {
              if (video && !video.paused && !video.ended) {
                video.muted = false;
                setIsMuted(false);
                console.log('VideoBackground: Unmuted successfully');
              }
            }, 2000);
          })
          .catch((error) => {
            console.error('VideoBackground: Play failed:', error);
            setVideoStatus('failed');
          });
      }
    };

    const handlePlay = () => {
      console.log('VideoBackground: Play event fired');
      setVideoStatus('playing');
    };

    const handlePause = () => {
      console.log('VideoBackground: Video paused');
      setVideoStatus('paused');
    };

    const handleEnded = () => {
      console.log('VideoBackground: Video ended');
    };

    const handleError = (e: any) => {
      console.error('VideoBackground: Video error:', e);
      console.error('VideoBackground: Error details:', e.target?.error);
      setVideoStatus('error');
      if (onError) onError();
    };

    const handleStalled = () => {
      console.log('VideoBackground: Video stalled');
    };

    const handleWaiting = () => {
      console.log('VideoBackground: Video waiting');
    };

    // Add all event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);

    // Force load the video
    video.load();

    // Cleanup function
    return () => {
      if (video) {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
        video.removeEventListener('stalled', handleStalled);
        video.removeEventListener('waiting', handleWaiting);
        
        if (!video.paused) {
          video.pause();
        }
      }
    };
  }, [onError, onLoad]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      console.log('VideoBackground: Mute toggled to:', videoRef.current.muted);
    }
  };

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (video) {
      console.log('VideoBackground: Manual play attempt');
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('VideoBackground: Manual play successful');
            setVideoStatus('playing');
          })
          .catch((error) => {
            console.error('VideoBackground: Manual play failed:', error);
          });
      }
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
        preload="auto"
        style={{ zIndex: 1 }}
      >
        <source src="/G22.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Debug Status */}
      <div className="absolute top-2 left-2 z-50 bg-black/50 text-white text-xs p-2 rounded">
        Status: {videoStatus}
      </div>
      
      {/* Manual Play Button (if needed) */}
      {videoStatus === 'failed' || videoStatus === 'paused' ? (
        <button
          onClick={handleManualPlay}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-full transition-all border border-white/20"
        >
          Play Video
        </button>
      ) : null}
      
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
