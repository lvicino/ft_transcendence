// src/components/ChatSidebar.tsx
import { useState } from 'react';
import { X, Send, MessageSquare, Users, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUI, useChat } from '../store';
import { cn, displayTag } from '../lib/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import ChatWindow from './ChatWindow';

type Tab = 'chat' | 'online' | 'friends';

export default function ChatSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isChatOpen, toggleChat, closeChat } = useUI();
  const {
    messages,
    onlineUsers,
    friends,
    privateTarget,
    isConnected,
    send,
    setPrivateTarget,
    addFriend,
    removeFriend,
  } = useChat();

  const [tab, setTab] = useState<Tab>('chat');
  const [inputValue, setInputValue] = useState('');

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    send(inputValue.trim());
    setInputValue('');
  }

  function handleDM(userId: number, username: string) {
    setPrivateTarget({ id: userId, username });
    setTab('chat');
  }

  function handleViewProfile(userId: number | string) {
    const myId = user?.id;
    if (String(userId) === String(myId)) {
      navigate('/me');
    } else {
      navigate(`/users/${userId}`);
    }
    closeChat();
  }

  return (
    <div className={cn('fixed inset-0 z-[100]', isChatOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
      {/* Backdrop */}
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
              <span className="text-[10px] uppercase tracking-widest text-white/40">
                {privateTarget
                  ? `DM → ${displayTag(privateTarget.username, privateTarget.id)}`
                  : isConnected
                  ? t("global")
                  : 'Offline'}
              </span>
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

        {/* Tab Bar */}
        <div className="flex border-b border-white/10 bg-black/20">
          {([
            { key: 'chat' as Tab, icon: MessageSquare, label: t("chat") },
            { key: 'online' as Tab, icon: Users, label: `Online (${onlineUsers.length})` },
            { key: 'friends' as Tab, icon: UserPlus, label: `Friends (${friends.length})` },
          ]).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] uppercase tracking-widest transition-colors',
                tab === item.key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>

        {/* DM indicator + clear */}
        {privateTarget && tab === 'chat' && (
          <div className="flex items-center justify-between bg-primary/10 border-b border-primary/20 px-4 py-2">
            <span className="text-xs text-primary">
              DM → <strong>{displayTag(privateTarget.username, privateTarget.id)}</strong>
            </span>
            <button
              type="button"
              className="text-[10px] uppercase text-white/50 hover:text-white"
              onClick={() => setPrivateTarget(null)}
            >
              {t("global")}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'chat' && (
            <ChatWindow
              messages={messages}
              currentUserId={user?.id ?? null}
              onUsernameClick={handleViewProfile}
            />
          )}

          {tab === 'online' && (
            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {onlineUsers.length === 0 ? (
                <p className="text-center text-xs text-white/40 py-8">No users online</p>
              ) : (
                onlineUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <button
                      type="button"
                      onClick={() => handleViewProfile(u.id)}
                      className="text-sm text-white hover:text-primary hover:underline transition-colors truncate"
                    >
                      {displayTag(u.username, u.id)}
                    </button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] h-6 px-2 text-white/60 hover:text-primary"
                        onClick={() => handleDM(u.id, u.username)}
                      >
                        DM
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] h-6 px-2 text-white/60 hover:text-emerald-400"
                        onClick={() => addFriend(u.id)}
                      >
                        +Friend
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'friends' && (
            <div className="flex-1 space-y-1 overflow-y-auto p-3">
              {friends.length === 0 ? (
                <p className="text-center text-xs text-white/40 py-8">No friends yet</p>
              ) : (
                friends.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', f.online ? 'bg-emerald-400' : 'bg-white/20')} />
                      <button
                        type="button"
                        onClick={() => handleViewProfile(f.id)}
                        className="text-sm text-white hover:text-primary hover:underline transition-colors truncate"
                      >
                        {displayTag(f.username, f.id)}
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] h-6 px-2 text-white/60 hover:text-primary"
                        onClick={() => handleDM(f.id, f.username)}
                      >
                        DM
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] h-6 px-2 text-white/60 hover:text-rose-400"
                        onClick={() => removeFriend(f.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Input (only shown on chat tab) */}
        {tab === 'chat' && (
          <div className="flex flex-shrink-0 gap-2 border-t border-white/10 bg-black/40 p-4">
            <form className="flex w-full gap-2" onSubmit={handleSend}>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={privateTarget ? `Message ${displayTag(privateTarget.username, privateTarget.id)}…` : t("typeMessage")}
                aria-label={t("message")}
                className="flex-1 bg-white/5"
                disabled={!isConnected}
              />
              <Button
                type="submit"
                size="icon"
                aria-label={t("sendMessage")}
                className="w-12 rounded-lg"
                disabled={!isConnected}
              >
                <Send className="h-[18px] w-[18px]" />
              </Button>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}
