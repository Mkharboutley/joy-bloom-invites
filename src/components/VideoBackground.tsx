
interface VideoBackgroundProps {
  onError?: () => void;
  onLoad?: () => void;
}

const VideoBackground = ({ onError, onLoad }: VideoBackgroundProps) => {
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

  return (
    <>
      {/* Video Background - increased z-index and removed conflicting backgrounds */}
      <video
        autoPlay
        loop
        muted
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
      
      {/* Fallback background only if video fails - lower z-index */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-0" />
      
      {/* Subtle overlay to ensure text readability - higher z-index than video but lower than content */}
      <div className="absolute inset-0 bg-black/20 z-2" />
    </>
  );
};

export default VideoBackground;
