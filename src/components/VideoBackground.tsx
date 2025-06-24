
interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
  const handleError = () => {
    console.log('Video background failed to load from /background.mp4');
    if (onError) onError();
  };

  const handleLoad = () => {
    console.log('Video background loaded successfully from /background.mp4');
    if (onLoad) onLoad();
  };

  return (
    <>
      {/* Fallback background - should be behind video */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-0" />
      
      {/* Video should be on top of fallback */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-10"
        onError={handleError}
        onLoadedData={handleLoad}
        onCanPlay={() => console.log('Video can play')}
        preload="auto"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay on top of video */}
      <div className="absolute inset-0 bg-black/40 z-20" />
    </>
  );
};

export default VideoBackground;
