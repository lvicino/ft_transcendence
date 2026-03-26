import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, Gamepad2, MessageSquare, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth, useAuthStore, useGameFlowStore, useGameStore, useUI, useToast, useChatStore } from "../store";
import { cn, displayTag } from "../lib/utils";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import LanguageSwitcher from "./LanguageSwitcher";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { toggleChat } = useUI();
  const { success } = useToast();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAuthed = isAuthenticated;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, isAuthed]);

  const go = (to: string) => {
    if (to === pathname) return;
    navigate(to);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Local client state should still be cleared if the logout request fails.
    }

    useAuthStore.getState().logout();
    useChatStore.getState().disconnect();
    useGameFlowStore.getState().leaveLobby();
    useGameStore.getState().resetGame();

    success(t("loggedOut"));
    navigate("/auth");
  };

  const navItems = [
    { href: "/play", label: t("play"), icon: <Gamepad2 size={16} /> },
    { href: "/me", label: t("profile"), icon: <User size={16} /> },
  ];

  const navButtonClass = (isActive: boolean) =>
    cn(
      "h-auto min-h-11 w-full justify-start gap-3 rounded-xl px-4 py-3 text-left text-xs leading-tight font-bold uppercase tracking-[0.18em] whitespace-normal break-words transition-all md:min-h-9 md:w-auto md:min-w-28 md:justify-center md:gap-2 md:rounded-lg md:px-4 md:py-2 md:text-[10px] md:leading-none md:whitespace-nowrap",
      isActive
        ? "border border-brand-red/40 bg-brand-red/8 text-brand-red hover:bg-brand-red/12"
        : "border border-white/10 text-white/75 hover:bg-white/5 hover:text-white",
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between gap-3 px-4 sm:px-6">
        
        {/* LOGO: Sharp & Bold */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => go(isAuthed ? "/play" : "/")}
          className="group h-auto min-w-0 max-w-[12rem] flex-col items-start gap-0 px-0 py-0 leading-none hover:bg-transparent sm:max-w-none"
        >
          <span className="hidden text-[10px] font-black uppercase tracking-[0.4em] text-brand-red sm:block">42_SCHOOL</span>
          <span className="text-lg font-black uppercase tracking-tight text-white transition-colors group-hover:text-brand-red sm:text-xl">
            Transcendence
          </span>
        </Button>

        {/* NAVIGATION: Only for Authed users */}
        {isAuthed && (
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => go(item.href)}
                className={navButtonClass(pathname === item.href)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        )}

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <LanguageSwitcher />

          {isAuthed ? (
            <>
              <Avatar
                userId={user?.id}
                src={user?.avatar}
                alt={user?.username ? `${user.username} avatar` : t("userAvatar")}
                size="sm"
                className="hidden sm:flex border-white/20"
              />

              <div className="mr-2 hidden w-24 shrink-0 sm:flex flex-col items-start leading-none">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("navbarOperator")}</span>
                <span className="text-xs font-black text-white">{displayTag(user?.username, user?.id)}</span>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                {/* Используем наш UI Button для чата (Design System) */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleChat}
                  icon={<MessageSquare size={14} />}
                  className="w-28"
                >
                  {t("navbarChat")}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-white/40 hover:text-brand-red"
                  title={t("logout")}
                >
                  <LogOut size={18} />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
                className="md:hidden text-white/70 hover:text-white"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navbar-menu"
                title={isMobileMenuOpen ? t("close") : t("menu")}
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="w-auto min-w-0 shrink-0 px-3 text-[10px] whitespace-normal break-words sm:w-36 sm:px-4 sm:text-xs sm:whitespace-nowrap border-white/20 transition-all duration-700 hover:bg-white hover:text-black">
              {t("connect")}
            </Button>
          )}
        </div>
      </div>

      {isAuthed && isMobileMenuOpen && (
        <div
          id="mobile-navbar-menu"
          className="border-t border-white/10 bg-black/75 px-4 py-4 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <Avatar
                userId={user?.id}
                src={user?.avatar}
                alt={user?.username ? `${user.username} avatar` : t("userAvatar")}
                size="sm"
                className="border-white/20"
              />

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {t("navbarOperator")}
                </span>
                <div className="truncate text-sm font-black text-white">
                  {displayTag(user?.username, user?.id)}
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => go(item.href)}
                  className={navButtonClass(pathname === item.href)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleChat();
                  setIsMobileMenuOpen(false);
                }}
                icon={<MessageSquare size={14} />}
                className="h-auto min-h-11 w-full justify-start rounded-xl px-4 py-3 text-left text-xs leading-tight font-bold uppercase tracking-[0.18em] whitespace-normal break-words"
              >
                {t("navbarChat")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut size={16} />}
                className="h-auto min-h-11 w-full justify-start rounded-xl px-4 py-3 text-left text-xs leading-tight font-bold uppercase tracking-[0.18em] text-white/70 whitespace-normal break-words hover:text-brand-red"
              >
                {t("logout")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
