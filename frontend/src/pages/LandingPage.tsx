// src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-7xl font-light tracking-tighter text-white">
        PONG<span className="text-brand-accent"></span>
      </h1>
      <p className="mb-12 text-sm uppercase tracking-[0.5em] text-white/40">
        Cinematic Arcade Experience
      </p>
      
      <Button 
        variant="outline" 
        size="lg" 
        onClick={() => navigate('/auth')}
        className="px-12 border-white/20 hover:bg-white hover:text-black transition-all duration-700"
      >
        Login with 42
      </Button>
    </div>
  );
}