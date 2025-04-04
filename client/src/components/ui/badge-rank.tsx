import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Star, 
  BookOpen, 
  Rocket, 
  Compass, 
  Crosshair, 
  BookMarked, 
  Brain, 
  Shield, 
  Flame, 
  Crown 
} from "lucide-react";

interface BadgeRankProps {
  rank: string;
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
  showBadgeIcon?: boolean;
  animated?: boolean;
  animationType?: "default" | "advanced";
}

export function BadgeRank({ 
  rank, 
  className, 
  showIcon = true, 
  iconSize = 16, 
  showBadgeIcon = false,
  animated = false,
  animationType = "default"
}: BadgeRankProps) {
  const rankData = {
    "Starlet Scholar": {
      color: "bg-slate-400 hover:bg-slate-400/80 border-slate-500",
      gradientClass: "from-slate-300 to-slate-500",
      icon: Star,
      description: "Taking the first steps in sharing knowledge.",
      animation: "animate-pulse-grow",
      advancedAnimation: "animate-sparkle"
    },
    "Knowledge Keeper": {
      color: "bg-green-400 hover:bg-green-400/80 border-green-500",
      gradientClass: "from-green-300 to-green-600",
      icon: BookOpen,
      description: "Developing a habit of sharing resources.",
      animation: "animate-pulse-slow",
      advancedAnimation: "animate-bounce-rotate"
    },
    "Insight Voyager": {
      color: "bg-cyan-500 hover:bg-cyan-500/80 border-cyan-600",
      gradientClass: "from-cyan-400 to-cyan-700",
      icon: Rocket,
      description: "Your sharing creates ripples of knowledge.",
      animation: "animate-float",
      advancedAnimation: "animate-orbit"
    },
    "Wisdom Weaver": {
      color: "bg-blue-500 hover:bg-blue-500/80 border-blue-600",
      gradientClass: "from-blue-400 to-blue-700",
      icon: Compass,
      description: "Crafting a web of knowledge for others.",
      animation: "animate-pulse-slow",
      advancedAnimation: "animate-spin-pulse"
    },
    "Truth Hunter": {
      color: "bg-indigo-500 hover:bg-indigo-500/80 border-indigo-600",
      gradientClass: "from-indigo-400 to-indigo-700",
      icon: Crosshair,
      description: "Seeking deeper academic insights.",
      animation: "animate-pulse",
      advancedAnimation: "animate-bounce-rotate"
    },
    "Galactic Sage": {
      color: "bg-violet-500 hover:bg-violet-500/80 border-violet-600",
      gradientClass: "from-violet-400 to-violet-700",
      icon: BookMarked,
      description: "Your knowledge transcends understanding.",
      animation: "animate-float-slow",
      advancedAnimation: "animate-sage-glow"
    },
    "Cosmic Intellect": {
      color: "bg-purple-500 hover:bg-purple-500/80 border-purple-600",
      gradientClass: "from-purple-400 to-purple-700",
      icon: Brain,
      description: "Your contributions have universal appeal.",
      animation: "animate-pulse-slow",
      advancedAnimation: "animate-cosmic-pulsate"
    },
    "Eternal Guardian": {
      color: "bg-pink-500 hover:bg-pink-500/80 border-pink-600",
      gradientClass: "from-pink-400 to-pink-700",
      icon: Shield,
      description: "A protector of knowledge for generations.",
      animation: "animate-pulse",
      advancedAnimation: "animate-orbit"
    },
    "Phoenix Prodigy": {
      color: "bg-rose-500 hover:bg-rose-500/80 border-rose-600", 
      gradientClass: "from-rose-400 to-rose-700",
      icon: Flame,
      description: "Rising with brilliant insights that ignite others.",
      animation: "animate-pulse-slow",
      advancedAnimation: "animate-flame"
    },
    "Celestial Champion": {
      color: "bg-amber-500 hover:bg-amber-500/80 border-amber-600 font-bold",
      gradientClass: "from-amber-400 to-amber-700",
      icon: Crown,
      description: "The pinnacle of academic sharing excellence.",
      animation: "animate-pulse-slow",
      advancedAnimation: "animate-sparkle badge-cosmic-bg"
    }
  };
  
  // Default to Starlet Scholar if invalid badge
  const data = rankData[rank as keyof typeof rankData] || rankData["Starlet Scholar"];
  const Icon = data.icon;
  
  // Determine animation class based on props
  const animationClass = animated 
    ? (animationType === "advanced" ? data.advancedAnimation : data.animation) 
    : "";

  if (showBadgeIcon) {
    return (
      <div className={cn("relative inline-block", className)}>
        <div className={cn(
          "absolute -right-1 -top-1 z-10 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-md",
          `bg-gradient-to-br ${data.gradientClass}`,
          animated && animationType === "advanced" && data.advancedAnimation
        )}>
          <Icon className={cn("text-white", animated && data.animation)} size={14} />
        </div>
        <Badge className={cn(data.color, "pr-2 pl-2", animationClass)}>
          {rank}
        </Badge>
      </div>
    );
  }
  
  return (
    <Badge className={cn(data.color, className, animationClass)}>
      {showIcon && (
        <Icon 
          className={cn(
            "mr-1", 
            animated && animationType === "default" && data.animation
          )} 
          size={iconSize} 
        />
      )}
      {rank}
    </Badge>
  );
}