
import { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface EntryToneProps {
  autoPlay?: boolean;
}

const EntryTone = ({ autoPlay = true }: EntryToneProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && autoPlay && !hasPlayed) {
      // Try to play audio on component mount
      const playAudio = async () => {
        try {
          await audio.play();
          setHasPlayed(true);
          console.log('Entry tone played successfully');
        } catch (error) {
          console.log('Autoplay blocked, waiting for user interaction:', error);
          // Add event listener for user interaction
          const enableAudio = async () => {
            try {
              await audio.play();
              setHasPlayed(true);
              console.log('Entry tone played after user interaction');
            } catch (err) {
              console.log('Failed to play audio:', err);
            }
          };

          document.addEventListener('click', enableAudio, { once: true });
          document.addEventListener('touchstart', enableAudio, { once: true });
        }
      };

      playAudio();
    }
  }, [autoPlay, hasPlayed]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(audio.muted);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        muted={isMuted}
      >
        <source src="/entry-tone.mp3" type="audio/mpeg" />
        <source src="/entry-tone.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>

      {/* Audio Control Button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-3 hover:bg-white/30 transition-all duration-300"
        title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </>
  );
};

export default EntryTone;
