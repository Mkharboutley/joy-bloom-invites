
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div className={cn(
      "backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:via-white/3 before:to-transparent before:pointer-events-none",
      "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/5 after:to-transparent after:pointer-events-none",
      className
    )}>
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          border: '0.2px solid #8cfffb',
          boxShadow: '0 0 20px rgba(140, 255, 251, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
