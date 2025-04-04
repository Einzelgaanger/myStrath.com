import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, MessageSquare } from "lucide-react";
import { CommentsSection } from "./comments-section";
import { useWebSocketContext } from "@/contexts/websocket-context";

interface CommentsModalProps {
  contentId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
}

export function CommentsModal({ 
  contentId, 
  isOpen, 
  onOpenChange, 
  contentTitle 
}: CommentsModalProps) {
  const queryClient = useQueryClient();
  const { lastMessage, isConnected } = useWebSocketContext();
  const [isMuted, setIsMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Handle new comments from WebSocket
  useEffect(() => {
    if (lastMessage && 
        lastMessage.type === 'new-comment' && 
        lastMessage.contentId === contentId && 
        !isOpen && 
        !isMuted) {
      setUnreadCount(prev => prev + 1);
    }
  }, [lastMessage, contentId, isOpen, isMuted]);
  
  // Reset unread count when modal opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);
  
  // Toggle mute notifications
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setUnreadCount(0);
    }
  };
  
  // Refresh comments
  const handleRefreshComments = () => {
    queryClient.invalidateQueries({
      queryKey: [`/api/contents/${contentId}/comments`],
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments
              {unreadCount > 0 && !isOpen && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-muted-foreground mr-2">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMute}
                className={isMuted ? "text-muted-foreground" : "text-primary"}
              >
                {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogDescription className="line-clamp-1">
            {contentTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <CommentsSection contentId={contentId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}