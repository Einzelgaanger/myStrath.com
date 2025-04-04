import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookOptions {
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  automaticOpen?: boolean;
}

interface UseWebSocketReturn {
  sendMessage: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  lastMessage: MessageEvent | null;
  readyState: number;
  webSocket: WebSocket | null;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(
  url: string,
  options: WebSocketHookOptions = {}
): UseWebSocketReturn {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    automaticOpen = true
  } = options;

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  // Create a web socket connection
  const connect = useCallback(() => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    console.log(`Connecting to WebSocket: ${url}`);
    
    const ws = new WebSocket(url);
    webSocketRef.current = ws;

    ws.onopen = (event: WebSocketEventMap['open']) => {
      console.log('WebSocket connection established');
      setReadyState(WebSocket.OPEN);
      reconnectAttemptsRef.current = 0;
      if (onOpen) onOpen(event);
    };

    ws.onmessage = (event: WebSocketEventMap['message']) => {
      setLastMessage(event);
      if (onMessage) onMessage(event);
    };

    ws.onclose = (event: WebSocketEventMap['close']) => {
      console.log(`WebSocket connection closed with code: ${event.code}`);
      setReadyState(WebSocket.CLOSED);
      
      // Attempt to reconnect if not a clean close and we haven't exceeded reconnect attempts
      if (!event.wasClean && reconnectAttemptsRef.current < reconnectAttempts) {
        reconnectAttemptsRef.current++;
        console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${reconnectAttempts})...`);
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
      
      if (onClose) onClose(event);
    };

    ws.onerror = (event: WebSocketEventMap['error']) => {
      console.error('WebSocket error:', event);
      if (onError) onError(event);
    };
  }, [url, onOpen, onMessage, onClose, onError, reconnectInterval, reconnectAttempts]);

  // Disconnect from the web socket
  const disconnect = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    
    // Clear any reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setReadyState(WebSocket.CLOSED);
  }, []);

  // Function to send a message
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(data);
    } else {
      console.warn('WebSocket not connected. Message not sent.');
    }
  }, []);

  // Connect when the component mounts if automaticOpen is true
  useEffect(() => {
    if (automaticOpen) {
      connect();
    }

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, automaticOpen]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    webSocket: webSocketRef.current,
    connect,
    disconnect
  };
}