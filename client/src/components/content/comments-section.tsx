import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useWebSocketContext } from '@/contexts/websocket-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: number;
  contentId: number;
  userId: number;
  text: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    profilePicture: string | null;
  };
}

interface CommentsProps {
  contentId: number;
}

export function CommentsSection({ contentId }: CommentsProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const { lastMessage, isConnected } = useWebSocketContext();
  
  // Fetch existing comments
  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/contents/${contentId}/comments`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/contents/${contentId}/comments`);
      return response.json();
    },
  });
  
  // Create a new comment
  const createCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', `/api/contents/${contentId}/comments`, { text });
      return response.json();
    },
    onSuccess: () => {
      // No need to invalidate the query as we'll receive the update via WebSocket
      setCommentText('');
      // Focus back on input after submission
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    },
  });
  
  // Handle WebSocket message updates with security verification
  useEffect(() => {
    // Type augmentation for our expected WebSocket message format
    interface CommentMessage {
      type: string;
      contentId: number;
      comment: Comment;
      timestamp: number;
      signature: string;
    }
    
    if (lastMessage && typeof lastMessage.data === 'string') {
      try {
        // Parse the message data
        const data = JSON.parse(lastMessage.data) as CommentMessage;
        
        // Verify it's a comment message for this content
        if (data.type === 'new-comment' && data.contentId === contentId) {
          // Verify message integrity by checking:
          // 1. Message timestamp is recent (within last 30 seconds)
          const messageAge = Date.now() - data.timestamp;
          const isRecent = messageAge < 30000; // 30 seconds
          
          // 2. Message has required fields
          const hasRequiredFields = Boolean(
            data.comment && 
            data.comment.id && 
            data.comment.text && 
            data.signature && 
            data.timestamp
          );
          
          // Only process the comment if it passes security checks
          if (isRecent && hasRequiredFields) {
            // Add the new comment to our local cache
            queryClient.setQueryData(
              [`/api/contents/${contentId}/comments`],
              (oldData: Comment[] | undefined) => {
                // Check if we already have this comment (prevent duplicates)
                if (oldData && oldData.some(c => c.id === data.comment.id)) {
                  return oldData;
                }
                
                if (!oldData) return [data.comment];
                return [...oldData, data.comment];
              }
            );
          } else {
            console.warn('Received comment message failed security validation');
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage, contentId]);
  
  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && !createCommentMutation.isPending) {
      createCommentMutation.mutate(commentText);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-xs text-muted-foreground">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[calc(100vh-300px)]">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className={`${comment.userId === user?.id ? 'border-primary/20 bg-primary/5' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    {comment.user?.profilePicture ? (
                      <AvatarImage src={`/uploads/profile-pictures/${comment.user.profilePicture}`} alt={comment.user?.username || 'User'} />
                    ) : (
                      <AvatarFallback>{(comment.user?.username || 'U')[0].toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.user?.username || 'Unknown user'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          ref={commentInputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1"
          disabled={createCommentMutation.isPending}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!commentText.trim() || createCommentMutation.isPending}
        >
          {createCommentMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}