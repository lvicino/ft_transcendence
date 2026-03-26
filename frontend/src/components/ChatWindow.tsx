// src/components/ChatWindow.tsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from './ui/Avatar';
import { cn, displayTag } from '../lib/utils';
import type { ChatMessage } from '../lib/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId?: string | null;
  onUsernameClick?: (userId: string) => void;
}

function formatTime(timestampISO: string) {
  const date = new Date(timestampISO);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ messages, currentUserId, onUsernameClick }: ChatWindowProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 && (
        <p className="text-center text-xs text-white/30 py-12">
          {t('noMessagesYet')}
        </p>
      )}

      {messages.map((msg) => {
        const displayName = displayTag(msg.senderLogin, msg.senderId);
        const isOwn = Boolean(currentUserId && msg.senderId === currentUserId);
        const isPrivate = Boolean(msg.receiverId);

        return (
          <div
            key={msg.id}
            className={cn(
              'animate-in duration-200',
              isOwn ? 'slide-in-from-right-2' : 'slide-in-from-left-2'
            )}
          >
            <div
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3',
                isPrivate
                  ? 'border-purple-500/20 bg-purple-500/5'
                  : isOwn
                  ? 'ml-6 border-primary/20 bg-primary/10'
                  : 'mr-6 border-white/5 bg-white/5'
              )}
            >
              <Avatar
                size="sm"
                userId={msg.senderId}
                src={msg.senderAvatar}
                alt={`${displayName} avatar`}
                className={cn(isOwn ? 'border-primary/25' : 'border-white/15')}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUsernameClick?.(msg.senderId)}
                    className={cn(
                      'truncate text-xs font-bold cursor-pointer transition-colors hover:underline',
                      isOwn ? 'text-primary hover:text-primary/80' : 'text-white hover:text-primary'
                    )}
                  >
                    {displayName}
                  </button>
                  {isPrivate && (
                    <span className="text-[9px] uppercase tracking-wider text-purple-400/70 font-semibold">
                      {isOwn
                        ? `→ ${msg.receiverLogin ? displayTag(msg.receiverLogin, msg.receiverId) : `User#${msg.receiverId}`}`
                        : t('dm')}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-white/35">{formatTime(msg.timestampISO)}</span>
                </div>
                <p className="mt-1 break-words font-mono text-sm text-slate-200">{msg.text}</p>
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
