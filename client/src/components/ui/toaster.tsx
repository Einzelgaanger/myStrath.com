import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastIcon
} from "@/components/ui/toast"
import { Progress } from "@/components/ui/progress"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <ToastProgressBar duration={5000} open={props.open} />
            
            <div className="flex items-start gap-2 pt-1 pb-2">
              <ToastIcon variant={variant} />
              
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle className="animate-in slide-in-from-right-8 duration-300">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="animate-in slide-in-from-right-4 duration-300 delay-100">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            
            {action && (
              <div className="flex justify-end mt-2 animate-in fade-in duration-300 delay-200">
                {action}
              </div>
            )}
            
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

function ToastProgressBar({ duration = 5000, open }: { duration: number; open?: boolean }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!open) {
      setProgress(100);
      return;
    }
    
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);
    
    return () => clearInterval(interval);
  }, [duration, open]);
  
  return (
    <Progress 
      value={progress} 
      className="h-1 absolute top-0 left-0 right-0 rounded-none bg-transparent" 
      indicatorClassName="bg-primary/30 transition-all duration-150 ease-linear"
    />
  );
}
