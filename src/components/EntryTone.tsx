
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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && autoPlay && !hasPlayed) {
      console.log('Attempting to play entry tone audio...');
      
      // Set audio properties
      audio.volume = 0.3;
      audio.loop = true;
      
      // Try to play audio on component mount
      const playAudio = async () => {
        try {
          await audio.play();
          setHasPlayed(true);
          setIsPlaying(true);
          console.log('Entry tone audio playing successfully');
        } catch (error) {
          console.log('Autoplay blocked, waiting for user interaction:', error);
          
          // Add event listeners for user interaction
          const enableAudio = async () => {
            try {
              await audio.play();
              setHasPlayed(true);
              setIsPlaying(true);
              console.log('Entry tone audio playing after user interaction');
              // Remove listeners after successful play
              document.removeEventListener('click', enableAudio);
              document.removeEventListener('touchstart', enableAudio);
              document.removeEventListener('keydown', enableAudio);
            } catch (err) {
              console.log('Failed to play audio after interaction:', err);
            }
          };

          document.addEventListener('click', enableAudio, { passive: true });
          document.addEventListener('touchstart', enableAudio, { passive: true });
          document.addEventListener('keydown', enableAudio, { passive: true });
        }
      };

      // Add audio event listeners
      audio.addEventListener('play', () => {
        console.log('Audio play event triggered');
        setIsPlaying(true);
      });
      
      audio.addEventListener('pause', () => {
        console.log('Audio pause event triggered');
        setIsPlaying(false);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
      
      audio.addEventListener('loadstart', () => {
        console.log('Audio load started');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('Audio can play');
      });

      playAudio();
    }
  }, [autoPlay, hasPlayed]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
      console.log('Audio muted:', audio.muted);
    }
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

      {/* Audio Control Button - Only Mute/Unmute */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleMute}
          className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 hover:bg-white/30 transition-all duration-300"
          title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </>
  );
};

export default EntryTone;
