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
import { useState, useEffect } from "react";

interface ProfileBadgeProps {
  rank: string;
  profileImage?: string | null;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  pulseEffect?: boolean;
}

const rankIcons = {
  "Starlet Scholar": Star,
  "Knowledge Keeper": BookOpen,
  "Insight Voyager": Rocket,
  "Wisdom Weaver": Compass,
  "Truth Hunter": Crosshair,
  "Galactic Sage": BookMarked,
  "Cosmic Intellect": Brain,
  "Eternal Guardian": Shield,
  "Phoenix Prodigy": Flame,
  "Celestial Champion": Crown,
};

const rankColors = {
  "Starlet Scholar": "from-slate-300 to-slate-500 border-slate-400",
  "Knowledge Keeper": "from-green-300 to-green-600 border-green-400",
  "Insight Voyager": "from-cyan-300 to-cyan-700 border-cyan-500",
  "Wisdom Weaver": "from-blue-300 to-blue-700 border-blue-500",
  "Truth Hunter": "from-indigo-300 to-indigo-700 border-indigo-500",
  "Galactic Sage": "from-violet-300 to-violet-700 border-violet-500",
  "Cosmic Intellect": "from-purple-300 to-purple-700 border-purple-500",
  "Eternal Guardian": "from-pink-300 to-pink-700 border-pink-500",
  "Phoenix Prodigy": "from-rose-300 to-rose-700 border-rose-500",
  "Celestial Champion": "from-amber-300 to-amber-700 border-amber-500",
};

const sizeClasses = {
  sm: {
    container: "w-10 h-10",
    badge: "w-4 h-4 -top-1 -right-1",
    iconSize: 10,
    borderWidth: "border-2",
    initials: "text-xs"
  },
  md: {
    container: "w-12 h-12",
    badge: "w-5 h-5 -top-1 -right-1",
    iconSize: 12,
    borderWidth: "border-2",
    initials: "text-sm"
  },
  lg: {
    container: "w-16 h-16",
    badge: "w-7 h-7 -top-1 -right-1",
    iconSize: 16,
    borderWidth: "border-3",
    initials: "text-base"
  },
  xl: {
    container: "w-24 h-24",
    badge: "w-9 h-9 -top-1 -right-1",
    iconSize: 20,
    borderWidth: "border-4",
    initials: "text-lg"
  }
};

export function ProfileBadge({ 
  rank, 
  profileImage, 
  username = "", 
  size = "md", 
  className = "",
  pulseEffect = false
}: ProfileBadgeProps) {
  // For animation effect
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    if (pulseEffect) {
      const timer = setInterval(() => {
        setAnimate(true);
        const resetTimer = setTimeout(() => setAnimate(false), 1000);
        return () => clearTimeout(resetTimer);
      }, 5000);
      
      return () => clearInterval(timer);
    }
  }, [pulseEffect]);

  const validRank = rank in rankIcons ? rank : "Starlet Scholar";
  const Icon = rankIcons[validRank as keyof typeof rankIcons];
  const colorClass = rankColors[validRank as keyof typeof rankColors];
  const sizeClass = sizeClasses[size];
  
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Profile image */}
      <div className={cn(
        sizeClass.container,
        "rounded-full overflow-hidden relative flex items-center justify-center bg-neutral-200",
        `border ${sizeClass.borderWidth} border-white shadow-md`
      )}>
        {profileImage ? (
          <img 
            src={profileImage} 
            alt={username || "User"} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className={cn("font-semibold text-neutral-700", sizeClass.initials)}>
            {getInitials(username)}
          </span>
        )}
      </div>
      
      {/* Badge */}
      <div className={cn(
        "absolute rounded-full flex items-center justify-center z-10",
        "border-2 border-white shadow-lg",
        `bg-gradient-to-br ${colorClass}`,
        sizeClass.badge,
        animate && "animate-pulse"
      )}>
        <Icon size={sizeClass.iconSize} className="text-white" />
      </div>
    </div>
  );
}