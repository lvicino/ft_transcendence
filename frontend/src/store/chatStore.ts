// src/store/chatStore.ts
import { create } from 'zustand';
import type { ChatMessage } from '../lib/types';
import {
  connectChatSocket,
  disconnectChatSocket,
  sendChatMessage,
} from '../net/chatSocket';
import { apiFetch } from '../net/http';

type OnlineUser = { id: number; username: string };
type Friend = { id: number; username: string; online: boolean };
type PrivateTarget = { id: number; username: string } | null;

interface ChatState {
  messages: ChatMessage[];
  onlineUsers: OnlineUser[];
  friends: Friend[];
  privateTarget: PrivateTarget;
  isConnected: boolean;

  connect: () => void;
  disconnect: () => void;
  send: (content: string) => void;
  setPrivateTarget: (target: PrivateTarget) => void;
  fetchFriends: () => Promise<void>;
  addFriend: (friendId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
}

let msgCounter = 0;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  onlineUsers: [],
  friends: [],
  privateTarget: null,
  isConnected: false,

  connect: () => {
    connectChatSocket({
      onOpen: () => {
        set({ isConnected: true });
        get().fetchFriends();
      },
      onClose: () => {
        set({ isConnected: false });
      },
      onOnlineUsers: (users) => {
        set({ onlineUsers: users });
        // refresh friend online status
        const { friends } = get();
        if (friends.length > 0) {
          const onlineIds = new Set(users.map((u) => u.id));
          set({
            friends: friends.map((f) => ({
              ...f,
              online: onlineIds.has(f.id),
            })),
          });
        }
      },
      onNewMessage: (msg) => {
        msgCounter++;
        const chatMsg: ChatMessage = {
          id: `msg-${msgCounter}-${Date.now()}`,
          senderId: String(msg.sender_id),
          senderLogin: msg.sender_username,
          text: msg.content,
          timestampISO: msg.created_at,
          receiverId: msg.receiver_id != null ? String(msg.receiver_id) : undefined,
          receiverLogin: msg.receiver_username ?? undefined,
        };
        set((state) => ({
          messages: [...state.messages, chatMsg],
        }));
      },
    });
  },

  disconnect: () => {
    disconnectChatSocket();
    set({ isConnected: false, messages: [], onlineUsers: [], friends: [], privateTarget: null });
  },

  send: (content: string) => {
    const { privateTarget } = get();
    sendChatMessage(content, privateTarget ? privateTarget.id : null);
  },

  setPrivateTarget: (target) => set({ privateTarget: target }),

  fetchFriends: async () => {
    try {
      const friends = await apiFetch('/chat/friends');
      if (Array.isArray(friends)) {
        const onlineIds = new Set(get().onlineUsers.map((u) => u.id));
        set({
          friends: friends.map((f: any) => ({
            id: f.id,
            username: f.username,
            online: onlineIds.has(f.id),
          })),
        });
      }
    } catch {
      // not logged in or server error — ignore
    }
  },

  addFriend: async (friendId: number) => {
    await apiFetch('/chat/friend', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    });
    await get().fetchFriends();
  },

  removeFriend: async (friendId: number) => {
    await apiFetch('/chat/friend', {
      method: 'DELETE',
      body: JSON.stringify({ friendId }),
    });
    await get().fetchFriends();
  },
}));

export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const friends = useChatStore((s) => s.friends);
  const privateTarget = useChatStore((s) => s.privateTarget);
  const isConnected = useChatStore((s) => s.isConnected);
  const connect = useChatStore((s) => s.connect);
  const disconnect = useChatStore((s) => s.disconnect);
  const send = useChatStore((s) => s.send);
  const setPrivateTarget = useChatStore((s) => s.setPrivateTarget);
  const fetchFriends = useChatStore((s) => s.fetchFriends);
  const addFriend = useChatStore((s) => s.addFriend);
  const removeFriend = useChatStore((s) => s.removeFriend);

  return {
    messages,
    onlineUsers,
    friends,
    privateTarget,
    isConnected,
    connect,
    disconnect,
    send,
    setPrivateTarget,
    fetchFriends,
    addFriend,
    removeFriend,
  };
}
