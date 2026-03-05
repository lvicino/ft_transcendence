import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, User, Gamepad2, MessageSquare } from "lucide-react";
import { useAuth, useAuthStore, useGameFlowStore, useGameStore, useUI, useToast } from "../store";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { toggleChat } = useUI();
  const { success } = useToast();
  
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAuthed = isAuthenticated;

  const go = (to: string) => {
    if (to === pathname) return;
    navigate(to);
  };

  const handleLogout = () => {
    useAuthStore.getState().actions.logout();
    useGameFlowStore.getState().leaveLobby();
    useGameStore.getState().resetGame();
    success('Logged out');
    navigate("/auth");
  };

  const navItems = [
    { href: "/dashboard", label: "Play", icon: <Gamepad2 size={16} /> },
    { href: "/me", label: "Agent", icon: <User size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        
        {/* LOGO: Sharp & Bold */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => go(isAuthed ? "/dashboard" : "/")}
          className="group h-auto min-w-0 flex-col items-start gap-0 px-0 py-0 leading-none hover:bg-transparent"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red">42_SCHOOL</span>
          <span className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-brand-red transition-colors">
            Transcendence
          </span>
        </Button>

        {/* NAVIGATION: Only for Authed users */}
        {isAuthed && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => go(item.href)}
                className={cn(
                  'min-w-0 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all',
                  pathname === item.href
                    ? 'border-b border-brand-red text-brand-red hover:bg-transparent'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          {isAuthed ? (
            <>
              <Avatar
                userId={user?.id}
                src={user?.avatar}
                alt={user?.username ? `${user.username} avatar` : 'User avatar'}
                size="sm"
                className="hidden sm:flex border-white/20"
              />

              <div className="hidden sm:flex flex-col items-start leading-none mr-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Operator</span>
                <span className="text-xs font-black text-white">{user?.username}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Используем наш UI Button для чата (Design System) */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleChat}
                  icon={<MessageSquare size={14} />}
                  className="hidden md:flex"
                >
                  Link
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-white/40 hover:text-brand-red"
                  title="Logout"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Connect
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
