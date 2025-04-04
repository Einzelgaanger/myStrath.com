import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { GraduationCap, Shield, BookOpen, Award, Lock } from 'lucide-react';

interface SplashScreenProps {
  duration?: number;
  minDuration?: number;
  logo?: string;
  title?: string;
  className?: string;
  onDone?: () => void;
}

export function SplashScreen({
  duration = 2500,
  minDuration = 1000,
  logo,
  title = 'Stratizens',
  className,
  onDone
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [securityIconsVisible, setSecurityIconsVisible] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Security messages to display during loading
  const securityMessages = [
    "Securing connection...",
    "Encrypting data channels...",
    "Verifying integrity...",
    "Establishing secure session...",
    "Ready! All systems secure."
  ];

  useEffect(() => {
    // Start loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + (100 - prev) * 0.15;
        return Math.min(next, 99.9); // Never quite reach 100% until we're done
      });
    }, 100);

    // Set minimum loading time
    const minTimeoutId = setTimeout(() => {
      // After minDuration, wait for both min time and actual loading
      if (loadingProgress > 99) {
        clearInterval(interval);
        setLoadingProgress(100);
        startFadeOut();
      }
    }, minDuration);

    // Set maximum loading time
    const maxTimeoutId = setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      startFadeOut();
    }, duration);

    // Start security messages after a short delay
    const messagesTimeoutId = setTimeout(() => {
      setShowMessages(true);
    }, 300);

    // Show security icons with a delay
    const iconsTimeoutId = setTimeout(() => {
      setSecurityIconsVisible(true);
    }, 800);

    // Cycle through security messages
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev < securityMessages.length - 1 ? prev + 1 : prev));
    }, duration / securityMessages.length);

    // Apply the background pattern
    if (mainContainerRef.current) {
      mainContainerRef.current.style.backgroundImage = `
        radial-gradient(circle at 25px 25px, rgba(var(--primary-rgb), 0.15) 2%, transparent 0%),
        radial-gradient(circle at 75px 75px, rgba(var(--primary-rgb), 0.1) 2%, transparent 0%)
      `;
      mainContainerRef.current.style.backgroundSize = '100px 100px';
    }

    // Cleanup
    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
      clearTimeout(minTimeoutId);
      clearTimeout(maxTimeoutId);
      clearTimeout(messagesTimeoutId);
      clearTimeout(iconsTimeoutId);
    };
  }, [duration, minDuration, loadingProgress, securityMessages.length]);

  // Handle fade out animation
  const startFadeOut = () => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 800); // Duration of fade-out animation
  };

  if (!visible) return null;

  return (
    <div
      ref={mainContainerRef}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-all duration-700',
        fadeOut && 'opacity-0 scale-110',
        className
      )}
    >
      {/* Background Security Icons */}
      <div className={cn(
        "absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-1000",
        securityIconsVisible && "opacity-5"
      )}>
        <div className="absolute -top-10 -left-10 animate-float-slow text-primary/10">
          <Shield size={120} />
        </div>
        <div className="absolute top-1/4 -right-10 animate-float-slow delay-300 text-primary/10">
          <Lock size={100} />
        </div>
        <div className="absolute bottom-1/4 -left-5 animate-float-slow delay-700 text-primary/10">
          <BookOpen size={80} />
        </div>
        <div className="absolute -bottom-10 right-10 animate-float-slow delay-500 text-primary/10">
          <Award size={90} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-8 p-8 z-10">
        {/* Logo with enhanced animation */}
        <div className="relative h-28 w-28 animate-pulse-scale">
          <div className="absolute -inset-4 bg-primary/5 rounded-full animate-ping-slow opacity-75"></div>
          {logo ? (
            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg">
              <GraduationCap size={56} className="animate-bounce-slow" />
            </div>
          )}
          {/* Orbital circles */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-orbit"></div>
          <div className="absolute inset-0 rounded-full border border-primary/5 animate-orbit-reverse delay-300"></div>
        </div>

        {/* Title with enhanced animation */}
        <div className="overflow-hidden">
          <h1 className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl animate-gradient-x">
            {title}
          </h1>
        </div>

        {/* Security Status Indicator */}
        {showMessages && (
          <div className="flex items-center justify-center space-x-2 animate-fade-in">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm font-medium text-muted-foreground transition-all duration-300 animate-fade-in-slide">
              {securityMessages[messageIndex]}
            </p>
          </div>
        )}

        {/* Enhanced Loading Progress Bar */}
        <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-muted shadow-inner">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/90 to-primary transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
          {/* Glowing effect */}
          <div
            className="absolute inset-y-0 left-0 bg-white opacity-30 blur-sm transition-all duration-300 ease-out"
            style={{ 
              width: `${Math.max(0, loadingProgress - 5)}%`,
              transform: 'translateX(5px)'
            }}
          ></div>
        </div>
        
        {/* Loading Percentage */}
        <p className="text-sm text-muted-foreground font-mono">
          {loadingProgress < 100 ? `${Math.round(loadingProgress)}%` : 'Complete!'}
        </p>
      </div>
    </div>
  );
}