
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div className={cn(
      "backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl",
      "relative overflow-hidden",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
