//src/pages/NotFound.tsx
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-white">
      <h1 className="font-hero text-4xl mb-4">404</h1>
      <p className="font-mono text-zinc-400 mb-6">Signal lost. Return to base.</p>
      <Button onClick={() => (window.location.href = '/dashboard')}>Back to Play</Button>
    </div>
  );
}
