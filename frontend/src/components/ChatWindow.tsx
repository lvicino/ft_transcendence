//src/components/ChatWindow.tsx
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';
import type { ChatMessage } from '../lib/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId?: string | null;
}

function formatTime(timestampISO: string) {
  const date = new Date(timestampISO);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ messages, currentUserId }: ChatWindowProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((msg) => {
        // Backend-provided user/message content must stay raw (never pass through i18n).
        const displayName = msg.senderLogin ?? msg.senderId;
        const isOwn = Boolean(currentUserId && msg.senderId === currentUserId);

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
                isOwn
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
                  <span className={cn('truncate text-xs font-bold', isOwn ? 'text-primary' : 'text-white')}>
                    {displayName}
                  </span>
                  <span className="text-[10px] font-mono text-white/35">{formatTime(msg.timestampISO)}</span>
                </div>
                <p className="mt-1 break-words font-mono text-sm text-slate-200">{msg.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
