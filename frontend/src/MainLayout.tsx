import { Link, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';

export default function MainLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-brand-bg text-brand-white">
      {/* Background Layer: Используем CSS переменные из Tailwind v4 */}
      <div
        className="hero-zoom fixed inset-0 z-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-45 saturate-[0.7] contrast-[0.9] brightness-[0.65]"
        aria-hidden="true"
      />
      
      {/* Overlay для глубины */}
      <div
        className="fixed inset-0 z-0 bg-gradient-to-b from-[#031018]/65 via-[#071823]/35 to-[#02070b]/92"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_15%,rgba(168,207,201,0.16),transparent_45%)]"
        aria-hidden="true"
      />

      {/* Navigation: Компонент #5 нашей Design System */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-8">
        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="mt-auto border-t border-white/10 pt-4">
          <nav className="flex items-center justify-center gap-6 text-xs uppercase tracking-widest text-white/60">
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
