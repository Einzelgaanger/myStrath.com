import { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  "animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "h-4 w-4 border-2",
        sm: "h-6 w-6 border-2",
        default: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
        gradient: "border-t-transparent border-r-primary border-b-primary border-l-primary"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  showText?: boolean;
  text?: string;
}

export function LoadingSpinner({
  className,
  size,
  variant,
  showText = false,
  text = "Loading...",
  ...props
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '.');
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center gap-2" {...props}>
      <div className={cn(spinnerVariants({ size, variant }), className)} />
      {showText && (
        <p className="text-muted-foreground animate-pulse font-medium">
          {text}{dots}
        </p>
      )}
    </div>
  );
}

export function FullPageLoader({ text = "Loading" }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 animate-ping" />
          </div>
          <LoadingSpinner 
            size="xl" 
            variant="gradient" 
            className="relative z-10"
          />
        </div>
        <h3 className="font-semibold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {text}
        </h3>
      </div>
    </div>
  );
}