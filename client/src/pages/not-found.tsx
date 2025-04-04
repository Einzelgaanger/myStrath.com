import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card-animated";
import { useLocation } from "wouter";
import { AlertTriangle, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const [location, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        {/* 404 Status */}
        <h1 className="text-8xl font-bold text-center mb-6 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse-scale">
          404
        </h1>
        
        {/* Card with details */}
        <Card 
          variant="glowing" 
          withGlowEffect 
          glowColor="destructive"
          className="w-full mb-8 border-destructive/20"
        >
          <div className="p-6">
            <div className="flex items-center mb-4 gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive animate-bounce-slow" />
              <h2 className="text-2xl font-semibold">Page Not Found</h2>
            </div>
            
            <div className="border-l-2 border-destructive/20 pl-4 py-1 mb-6">
              <p className="text-muted-foreground">
                The page you are looking for doesn't exist or has been moved.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Requested: <span className="font-mono text-xs">{location}</span>
              </p>
            </div>
            
            {/* Navigation options */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                variant="default" 
                className="gap-2 flex-1" 
                onClick={() => navigate("/")}
              >
                <Home size={16} />
                <span>Go Home</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2 flex-1" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Search suggestion */}
        <div className="text-center text-sm text-muted-foreground animate-fade-in-up">
          <p>Try searching for what you're looking for</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Search size={14} className="text-primary" />
            <span className="text-primary">Use the search bar in the dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
