
import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface EntryToneProps {
  autoPlay?: boolean;
}

const EntryTone = ({ autoPlay = true }: EntryToneProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !autoPlay) return;

    console.log('Attempting to play entry tone audio...');
    
    // Set audio properties
    audio.volume = 0.3;
    audio.loop = true;
    
    // Try to play audio immediately
    const attemptPlay = async () => {
      try {
        await audio.play();
        setHasPlayed(true);
        setIsPlaying(true);
        setCanAutoplay(true);
        console.log('Entry tone audio playing successfully');
      } catch (error) {
        console.log('Autoplay blocked, setting up user interaction listeners:', error);
        setCanAutoplay(false);
        
        // Set up listeners for any user interaction
        const enableAudio = async (event: Event) => {
          console.log('User interaction detected, attempting to play audio');
          try {
            // Ensure audio is not muted
            audio.muted = false;
            setIsMuted(false);
            
            await audio.play();
            setHasPlayed(true);
            setIsPlaying(true);
            setCanAutoplay(true);
            console.log('Entry tone audio playing after user interaction');
            
            // Remove all listeners after successful play
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('scroll', enableAudio);
          } catch (err) {
            console.log('Failed to play audio after interaction:', err);
          }
        };

        // Add multiple event listeners to catch any user interaction
        document.addEventListener('click', enableAudio, { passive: true, once: true });
        document.addEventListener('touchstart', enableAudio, { passive: true, once: true });
        document.addEventListener('keydown', enableAudio, { passive: true, once: true });
        document.addEventListener('scroll', enableAudio, { passive: true, once: true });
      }
    };

    // Add audio event listeners
    const handlePlay = () => {
      console.log('Audio play event triggered');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Audio pause event triggered');
      setIsPlaying(false);
    };
    
    const handleError = (e: Event) => {
      console.error('Audio error:', e);
    };
    
    const handleLoadStart = () => {
      console.log('Audio load started');
    };
    
    const handleCanPlay = () => {
      console.log('Audio can play');
      // Try to play again when audio is ready
      if (!hasPlayed && !canAutoplay) {
        attemptPlay();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    // Initial play attempt
    attemptPlay();

    // Cleanup
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [autoPlay, hasPlayed, canAutoplay]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMutedState = !audio.muted;
    audio.muted = newMutedState;
    setIsMuted(newMutedState);
    
    // If unmuting and audio isn't playing, try to start it
    if (!newMutedState && !isPlaying) {
      audio.play().then(() => {
        setIsPlaying(true);
        setHasPlayed(true);
        console.log('Audio started after unmuting');
      }).catch(err => {
        console.log('Could not start audio after unmuting:', err);
      });
    }
    
    console.log('Audio muted:', newMutedState);
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        muted={isMuted}
        loop
      >
        <source src="/entry-tone.mp3" type="audio/mpeg" />
        <source src="/entry-tone.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>

      {/* Audio Control Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleMute}
          className={`bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 hover:bg-white/30 transition-all duration-300 ${!canAutoplay && !hasPlayed ? 'animate-pulse ring-2 ring-white/50' : ''}`}
          title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
        {/* Show hint if autoplay failed */}
        {!canAutoplay && !hasPlayed && (
          <div className="absolute top-full left-0 mt-2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            اضغط للاستماع للموسيقى
          </div>
        )}
      </div>
    </>
  );
};

export default EntryTone;
