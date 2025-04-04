import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

type WebSocketContextType = {
  sendMessage: (data: any) => void;
  isConnected: boolean;
  lastMessage: WebSocketEventMap['message'] | null;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  
  // Determine WebSocket URL based on the current environment
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws`;

  // Track received message IDs to prevent replay attacks
  const processedMessageIds = useRef<Set<string>>(new Set());
  
  // Original WebSocket message handler
  const onMessageReceived = useCallback((event: WebSocketEventMap['message']) => {
    // Process the message for security verification
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        
        // Verify message has required security fields if it's a comment
        if (data.type === 'new-comment' && data.signature) {
          // Create a unique message ID from timestamp and comment ID
          const messageId = `${data.timestamp}-${data.comment?.id}`;
          
          // Check if we've already processed this message (replay protection)
          if (processedMessageIds.current.has(messageId)) {
            console.warn('Rejected duplicate WebSocket message', messageId);
            return null; // Ignore duplicate messages
          }
          
          // Verify the message is recent (prevent replay attacks)
          const messageAge = Date.now() - (data.timestamp || 0);
          if (messageAge > 60000) { // Older than 1 minute
            console.warn('Rejected outdated WebSocket message', messageAge);
            return null;
          }
          
          // Message passes basic checks, add to processed set
          processedMessageIds.current.add(messageId);
          
          // Limit the size of our processed message cache (memory management)
          if (processedMessageIds.current.size > 1000) {
            // Remove oldest entries when we have too many
            const oldestEntries = Array.from(processedMessageIds.current).slice(0, 500);
            oldestEntries.forEach(id => processedMessageIds.current.delete(id));
          }
        }
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
    
    // Return the original event for React state updates
    return event;
  }, []);
  
  // Set up WebSocket connection with enhanced security handlers
  const { lastMessage, sendMessage: rawSendMessage, readyState } = useWebSocket(wsUrl, {
    onOpen: () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      
      // Show toast notification when connected
      toast({
        title: 'Connected',
        description: 'Real-time connection established.',
        variant: 'default',
        duration: 3000,
      });
      
      // Authenticate the WebSocket connection if user is logged in
      if (user) {
        authenticateConnection();
      }
    },
    onClose: () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Lost connection to the server. Attempting to reconnect...',
        variant: 'destructive',
      });
      setIsConnected(false);
    },
    onMessage: onMessageReceived,
    reconnectInterval: 3000,
    reconnectAttempts: 10,
  });
  
  // Update connection status when readyState changes
  useEffect(() => {
    setIsConnected(readyState === WebSocket.OPEN);
  }, [readyState]);
  
  // Handle authentication when the user changes
  useEffect(() => {
    if (user && isConnected) {
      authenticateConnection();
    }
  }, [user, isConnected]);
  
  // Authenticate the WebSocket connection
  const authenticateConnection = useCallback(() => {
    if (user && isConnected) {
      const authMessage = {
        type: 'authenticate',
        userId: user.id,
      };
      rawSendMessage(JSON.stringify(authMessage));
      console.log('Sent authentication to WebSocket server');
    }
  }, [user, isConnected, rawSendMessage]);
  
  // Wrapper for sending messages that handles JSON stringification
  const sendMessage = useCallback((data: any) => {
    if (isConnected) {
      try {
        rawSendMessage(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('Cannot send message: WebSocket not connected');
      toast({
        title: 'Connection Issue',
        description: 'Unable to send message. Please wait for reconnection.',
        variant: 'destructive',
      });
    }
  }, [isConnected, rawSendMessage, toast]);
  
  const value = {
    sendMessage,
    isConnected,
    lastMessage,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}