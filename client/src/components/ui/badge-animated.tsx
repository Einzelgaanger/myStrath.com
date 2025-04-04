import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Award,
  Shield,
  Star,
  Crown,
  Sparkles,
  Gem,
  Medal,
  Flame,
  Zap,
  Trophy,
  type LucideIcon
} from 'lucide-react';

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline:
          "text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border-transparent hover:bg-accent hover:text-accent-foreground",
        starlet:
          "border-transparent bg-purple-100 text-purple-900 dark:bg-purple-950/50 dark:text-purple-300 shadow-sm dark:border-purple-900",
        scholar:
          "border-transparent bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300 shadow-sm dark:border-blue-900",
        keeper:
          "border-transparent bg-green-100 text-green-900 dark:bg-green-950/50 dark:text-green-300 shadow-sm dark:border-green-900",
        master:
          "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 shadow-sm dark:border-amber-900",
        sage:
          "border-transparent bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-300 shadow-sm dark:border-red-900",
        guru:
          "from-indigo-400 to-cyan-400 border-transparent bg-gradient-to-r text-white dark:from-indigo-600 dark:to-cyan-600",
        einstein:
          "from-rose-400 to-orange-400 border-transparent bg-gradient-to-r text-white dark:from-rose-600 dark:to-orange-600",
        platinum:
          "from-gray-300 to-gray-100 border-transparent bg-gradient-to-r text-gray-800 dark:from-gray-700 dark:to-gray-500 dark:text-white",
        diamond:
          "from-blue-400 via-cyan-200 to-blue-400 border-transparent bg-gradient-to-r text-blue-900 dark:from-blue-600 dark:via-cyan-400 dark:to-blue-600 dark:text-white",
        cosmic:
          "from-purple-500 via-pink-500 to-purple-500 border-transparent bg-gradient-to-r text-white dark:from-purple-700 dark:via-pink-700 dark:to-purple-700",
      },
      size: {
        default: "h-6 px-2.5 py-0.5 text-xs",
        sm: "h-5 px-2 py-0 text-xs",
        lg: "h-7 px-3 py-1 text-sm",
        xl: "h-8 px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

// Map ranks to icons
const rankIcons: Record<string, LucideIcon> = {
  starlet: Star,
  scholar: Shield,
  keeper: Award,
  master: Medal,
  sage: Flame,
  guru: Crown,
  einstein: Sparkles,
  platinum: Zap,
  diamond: Gem,
  cosmic: Trophy,
  default: Award
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BadgeVariants {
  rank?: 'starlet' | 'scholar' | 'keeper' | 'master' | 'sage' | 'guru' | 'einstein' | 'platinum' | 'diamond' | 'cosmic';
  withIcon?: boolean;
  iconAnimation?: 'pulse' | 'spin' | 'bounce' | 'none';
  iconOnly?: boolean;
  points?: number;
  showPoints?: boolean;
}

export function AnimatedBadge({
  className,
  variant,
  rank,
  size,
  withIcon = true,
  iconAnimation = 'none',
  iconOnly = false,
  points,
  showPoints = false,
  children,
  ...props
}: BadgeProps) {
  // Default to the rank as variant if not specified
  const effectiveVariant = variant || (rank as any);
  
  // Determine which icon to show
  const IconComponent = rank && rankIcons[rank] ? rankIcons[rank] : rankIcons.default;

  // Define animation class
  const iconAnimationClass = {
    pulse: "animate-pulse-scale",
    spin: "animate-spin-slow",
    bounce: "animate-bounce-slow",
    none: ""
  }[iconAnimation];
  
  return (
    <div
      className={cn(
        badgeVariants({ variant: effectiveVariant, size }),
        withIcon && !iconOnly && "pl-1.5",
        iconOnly && "aspect-square p-0 flex items-center justify-center",
        className
      )}
      {...props}
    >
      {withIcon && (
        <span 
          className={cn(
            "mr-1 inline-flex",
            iconOnly ? "mr-0" : "mr-1",
            iconAnimationClass
          )}
        >
          <IconComponent className={cn("h-4 w-4", size === "lg" && "h-5 w-5")} />
        </span>
      )}
      
      {!iconOnly && (
        <>
          {children}
          {showPoints && points !== undefined && (
            <span className="ml-1 opacity-70">({points})</span>
          )}
        </>
      )}
    </div>
  );
}