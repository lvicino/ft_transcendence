// src/components/ChatSidebar.tsx
import { X, Send, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, useUI } from '../store';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import ChatWindow from './ChatWindow';
import type { ChatMessage } from '../lib/types';

const BASE_MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    senderId: 'system',
    senderLogin: 'System',
    text: 'Welcome to the game!',
    timestampISO: new Date().toISOString(),
  },
  {
    id: '2',
    senderId: 'bot',
    senderLogin: 'Game_Bot',
    text: 'Good luck, have fun.',
    timestampISO: new Date().toISOString(),
  },
];

export default function ChatSidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isChatOpen, toggleChat } = useUI();
  const messages: ChatMessage[] = [
    ...BASE_MOCK_MESSAGES,
    {
      id: '3',
      senderId: user?.id ?? 'me',
      senderLogin: user?.username ?? 'You',
      senderAvatar: user?.avatar ?? null,
      text: 'Ready to play.',
      timestampISO: new Date().toISOString(),
    },
  ];

  return (
    <div className={cn('fixed inset-0 z-[100]', isChatOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
      {/* Backdrop (клик по фону закрывает чат) */}
      <button
        type="button"
        aria-label={t("closeChat")}
        onClick={toggleChat}
        className={cn(
          'absolute inset-0 bg-black/30 transition-opacity',
          isChatOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      <aside
        className={cn(
          'absolute inset-y-0 right-0 h-full w-[350px]',
          'bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-in-out will-change-transform',
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label={t("chat")}
      >
        {/* Header */}
        <div className="flex h-20 flex-shrink-0 items-center justify-between border-b border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/5 p-2">
              <MessageSquare className="h-[18px] w-[18px] text-white/80" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-white">{t("chat")}</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40">{t("global")}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleChat}
            aria-label={t("close")}
            className="text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ChatWindow messages={messages} currentUserId={user?.id ?? null} />

        {/* Input */}
        <div className="flex flex-shrink-0 gap-2 border-t border-white/10 bg-black/40 p-4">
          <form className="flex w-full gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder={t("typeMessage")}
              aria-label={t("message")}
              className="flex-1 bg-white/5"
            />
            <Button type="submit" size="icon" aria-label={t("sendMessage")} className="w-12 rounded-lg">
              <Send className="h-[18px] w-[18px]" />
            </Button>
          </form>
        </div>
      </aside>
    </div>
  );
}
