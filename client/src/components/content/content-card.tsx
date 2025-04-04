import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Content, contentTypes } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentsModal } from "./comments-modal";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Clock,
  ExternalLink,
  Check,
  Download,
  Trash2,
} from "lucide-react";

interface ContentCardProps {
  content: Content;
  userInteraction?: { isLiked: boolean; isDisliked: boolean; isCompleted: boolean };
  contentType?: string;
  onLike?: () => void;
  onDislike?: () => void;
  onComplete?: () => void;
  onViewComments?: () => void;
  onDelete?: () => void;
}

export default function ContentCard({ 
  content, 
  userInteraction,
  contentType,
  onLike,
  onDislike,
  onComplete,
  onViewComments,
  onDelete
}: ContentCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [isLiked, setIsLiked] = useState(userInteraction?.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(userInteraction?.isDisliked || false);
  const [isCompleted, setIsCompleted] = useState(userInteraction?.isCompleted || false);
  const [likesCount, setLikesCount] = useState(content.likes || 0);
  const [dislikesCount, setDislikesCount] = useState(content.dislikes || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [unreadComments, setUnreadComments] = useState(0);
  
  // Like/dislike interaction mutation
  const interactionMutation = useMutation({
    mutationFn: async ({ contentId, action }: { contentId: number; action: string }) => {
      const res = await apiRequest("POST", `/api/contents/${contentId}/interaction`, { action });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update interaction");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      // Update likes/dislikes count
      setLikesCount(data.likes);
      setDislikesCount(data.dislikes);
      
      // Invalidate query cache for this content
      queryClient.invalidateQueries({ queryKey: ["/api/contents", content.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mark as completed mutation
  const completeMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const res = await apiRequest("POST", `/api/contents/${contentId}/complete`, {});
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to mark as completed");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Update completed state
      setIsCompleted(true);
      
      // Show success toast
      toast({
        title: "Marked as completed",
        description: "You've earned points for completing this resource!",
      });
      
      // Invalidate query cache for this content
      queryClient.invalidateQueries({ queryKey: ["/api/contents", content.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const res = await apiRequest("DELETE", `/api/contents/${contentId}`, {});
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete content");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Content deleted",
        description: "The content has been deleted successfully",
      });
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      
      // Call onDelete callback if provided
      onDelete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle like button click
  const handleLike = () => {
    if (onLike) {
      onLike();
      return;
    }
    
    let action: string;
    
    if (isLiked) {
      // If already liked, unlike it
      action = "unlike";
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      // If not liked, like it and remove dislike if exists
      action = "like";
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      
      if (isDisliked) {
        setIsDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
      }
    }
    
    interactionMutation.mutate({ contentId: content.id, action });
  };
  
  // Handle dislike button click
  const handleDislike = () => {
    if (onDislike) {
      onDislike();
      return;
    }
    
    let action: string;
    
    if (isDisliked) {
      // If already disliked, undislike it
      action = "undislike";
      setIsDisliked(false);
      setDislikesCount((prev) => Math.max(0, prev - 1));
    } else {
      // If not disliked, dislike it and remove like if exists
      action = "dislike";
      setIsDisliked(true);
      setDislikesCount((prev) => prev + 1);
      
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
    }
    
    interactionMutation.mutate({ contentId: content.id, action });
  };
  
  // Handle mark as completed
  const handleMarkAsCompleted = () => {
    if (onComplete) {
      onComplete();
      return;
    }
    
    if (!isCompleted) {
      completeMutation.mutate(content.id);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(content.id);
    }
  };
  
  // Get content type badge
  const getContentTypeBadge = () => {
    switch (content.type) {
      case contentTypes.ASSIGNMENT:
        return <Badge variant="default">Assignment</Badge>;
      case contentTypes.NOTE:
        return <Badge variant="secondary">Notes</Badge>;
      case contentTypes.PAST_PAPER:
        return <Badge variant="outline">Past Paper</Badge>;
      case contentTypes.RESOURCE:
        return <Badge variant="destructive">Resource</Badge>;
      default:
        return <Badge variant="outline">{content.type}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };
  
  // Get time remaining for assignments
  const getTimeRemaining = () => {
    if (content.type !== contentTypes.ASSIGNMENT || !content.dueDate) return null;
    
    const dueDate = new Date(content.dueDate);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Overdue";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="line-clamp-1">{content.title}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(content.uploadedAt)}</span>
                {getContentTypeBadge()}
              </CardDescription>
            </div>
            {isCompleted && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {content.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLike}
              className={isLiked ? "bg-green-50 text-green-700 border-green-200" : ""}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {likesCount}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDislike}
              className={isDisliked ? "bg-red-50 text-red-700 border-red-200" : ""}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              {dislikesCount}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCommentsOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Comments
              {unreadComments > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-xs">
                  {unreadComments}
                </span>
              )}
            </Button>
            
            {content.filePath && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/uploads/${content.filePath}`} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            )}
            
            {content.type === contentTypes.ASSIGNMENT && content.dueDate && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining()}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onComplete && (
            <Button 
              variant="outline" 
              onClick={handleMarkAsCompleted}
              className={isCompleted ? "bg-green-50 text-green-700 border-green-200" : ""}
            >
              {isCompleted ? "Completed" : "Mark as Complete"}
            </Button>
          )}
          
          {user?.id === content.uploaderId && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {isCommentsOpen && (
        <CommentsModal
          contentId={content.id}
          isOpen={isCommentsOpen}
          onOpenChange={setIsCommentsOpen}
          contentTitle={content.title}
        />
      )}
    </>
  );
}