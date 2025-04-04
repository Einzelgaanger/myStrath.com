import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "hover:shadow-md",
        interactive: "hover:shadow-md hover:-translate-y-1 cursor-pointer",
        outline: "bg-background hover:bg-accent/10 hover:shadow-md",
        filled: "bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-md",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md",
        ghost: "border-none shadow-none hover:bg-accent/10 hover:shadow-none",
        glowing: "hover:shadow-md hover:shadow-primary/40 border-primary/20"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
      withGlowEffect?: boolean;
      glowColor?: string;
      hoverScale?: boolean;
      backgroundPattern?: 'dots' | 'lines' | 'grid' | 'none';
}

// Animated Card component
const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, variant, withGlowEffect, glowColor = "primary", hoverScale, backgroundPattern = 'none', ...props }, ref) => {
  // Pattern classes
  const patternClasses = {
    dots: "bg-dots",
    lines: "bg-lines",
    grid: "bg-grid",
    none: ""
  }[backgroundPattern];

  return (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        hoverScale && "hover:scale-[1.02]",
        withGlowEffect && "card-glow",
        patternClasses,
        className
      )}
      style={
        withGlowEffect
          ? {
              "--glow-color": `hsl(var(--${glowColor}))`,
            } as React.CSSProperties
          : undefined
      }
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};