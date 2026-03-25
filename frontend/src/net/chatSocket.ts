// src/net/chatSocket.ts
// WebSocket connection manager for the chat-api

type ChatSocketCallbacks = {
  onOnlineUsers: (users: { id: number; username: string }[]) => void;
  onNewMessage: (message: {
    sender_id: number;
    sender_username: string;
    receiver_id: number | null;
    content: string;
    created_at: string;
  }) => void;
  onOpen: () => void;
  onClose: () => void;
};

let ws: WebSocket | null = null;

export function connectChatSocket(callbacks: ChatSocketCallbacks) {
  if (ws && ws.readyState !== WebSocket.CLOSED) return;

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${proto}//${window.location.host}/api/chat/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    callbacks.onOpen();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'online_users') {
        callbacks.onOnlineUsers(data.users);
      } else if (data.type === 'new_message') {
        callbacks.onNewMessage(data.message);
      }
    } catch (err) {
      console.error('Chat WS parse error:', err);
    }
  };

  ws.onclose = () => {
    ws = null;
    callbacks.onClose();
  };

  ws.onerror = () => {
    console.error('Chat WebSocket error');
  };
}

export function sendChatMessage(content: string, receiverId: number | null = null) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(
    JSON.stringify({
      type: 'message',
      content,
      receiverId,
    })
  );
}

export function disconnectChatSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
