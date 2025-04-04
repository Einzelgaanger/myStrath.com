import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

export type WebSocketHookOptions = {
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  protocols?: string | string[];
  autoAuthenticate?: boolean;
};

type WebSocketHookReturn = {
  sendMessage: (data: string) => void;
  lastMessage: WebSocketEventMap['message'] | null;
  readyState: number;
  getWebSocket: () => WebSocket | null;
};

export function useWebSocket(
  url: string,
  options: WebSocketHookOptions = {}
): WebSocketHookReturn {
  const { user } = useAuth();
  const [lastMessage, setLastMessage] = useState<WebSocketEventMap['message'] | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(options.reconnectAttempts || 5);
  const reconnectIntervalRef = useRef(options.reconnectInterval || 5000);
  const didUnmountRef = useRef(false);
  const autoAuthenticateRef = useRef(options.autoAuthenticate !== false); // Default to true

  const connect = useCallback(() => {
    if (didUnmountRef.current) return;

    // Close existing connection if any
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.close();
    }

    console.log(`Connecting to WebSocket at ${url}`);
    webSocketRef.current = new WebSocket(url, options.protocols);
    webSocketRef.current.onopen = (event) => {
      console.log('WebSocket connection opened');
      setReadyState(WebSocket.OPEN);
      reconnectAttemptsRef.current = 0;

      // Automatically authenticate if enabled and user is available
      if (autoAuthenticateRef.current && user) {
        const authMessage = {
          type: 'authenticate',
          token: 'user-token', // This would be a real token in production
          userId: user.id
        };
        webSocketRef.current?.send(JSON.stringify(authMessage));
      }

      if (options.onOpen) options.onOpen(event);
    };

    webSocketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed');
      setReadyState(WebSocket.CLOSED);
      
      // Attempt to reconnect if not intentionally closed and we haven't reached max attempts
      if (
        !didUnmountRef.current &&
        reconnectAttemptsRef.current < maxReconnectAttemptsRef.current
      ) {
        reconnectAttemptsRef.current += 1;
        const timeout = window.setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})`);
          connect();
        }, reconnectIntervalRef.current);
        
        // Store timeout ID for cleanup
        reconnectTimeoutRef.current = timeout;
      }

      if (options.onClose) options.onClose(event);
    };

    webSocketRef.current.onmessage = (event) => {
      setLastMessage(event);
      if (options.onMessage) options.onMessage(event);
    };

    webSocketRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      if (options.onError) options.onError(event);
      
      // Close the connection on error to trigger reconnect
      webSocketRef.current?.close();
    };
  }, [
    url,
    options.protocols,
    options.onOpen,
    options.onClose,
    options.onMessage,
    options.onError,
    user
  ]);

  // Setup connection on mount
  useEffect(() => {
    didUnmountRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();

    // Cleanup on unmount
    return () => {
      didUnmountRef.current = true;
      
      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close the connection if it exists
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [connect]);

  // Send message helper
  const sendMessage = useCallback((data: string) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(data);
    } else {
      console.warn('WebSocket is not connected, cannot send message');
    }
  }, []);

  // Utility to access the raw WebSocket instance
  const getWebSocket = useCallback(() => webSocketRef.current, []);

  return {
    sendMessage,
    lastMessage,
    readyState,
    getWebSocket,
  };
}