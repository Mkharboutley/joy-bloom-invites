
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div className={cn(
      "backdrop-blur-2xl bg-white/15 border border-white/30 rounded-3xl shadow-2xl",
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-white/10 before:to-transparent before:pointer-events-none",
      "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/5 after:to-transparent after:pointer-events-none",
      className
    )}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
