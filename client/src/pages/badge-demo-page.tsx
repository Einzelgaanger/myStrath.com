import { BadgeAnimationShowcase } from "@/components/demo/badge-animation-showcase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function BadgeDemoPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient-blue">Badge Animation Demo</h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <p className="text-muted-foreground">
        This page showcases the various animations available for each achievement badge rank.
        The animations are designed to provide visual feedback and enhance the gamification aspect 
        of the platform. Each rank has its unique animation style that reflects the level's theme.
      </p>
      
      <BadgeAnimationShowcase />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Animation Details</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Default animations provide subtle motion effects that highlight the badge without being distracting.</li>
          <li>Advanced animations showcase more elaborate visual effects with unique characteristics for each rank.</li>
          <li>Higher rank badges feature more sophisticated animations to emphasize their prestigious status.</li>
          <li>Animations are optimized for performance and accessibility with fallbacks for reduced motion preferences.</li>
        </ul>
      </div>
    </div>
  );
}