import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Resize canvas to parent
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const { width, height } = canvas;
      const state = useGameStore.getState();
      const gs = state.gameState;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      if (!gs) {
        // No game state yet — draw placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for game data...', width / 2, height / 2);
        animationId = requestAnimationFrame(render);
        return;
      }

      // Scale factors: backend coordinates → canvas pixels
      const scaleX = width / gs.gameWide;
      const scaleY = height / gs.gameHeight;

      // Draw style
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 10;

      // Draw players (paddles)
      for (const player of gs.players) {
        const px = player.x * scaleX - (player.w * scaleX) / 2;
        const py = player.y * scaleY - (player.h * scaleY) / 2;
        const pw = player.w * scaleX;
        const ph = player.h * scaleY;
        ctx.fillRect(px, py, pw, ph);
      }

      // Draw ball
      const ballX = gs.ball.x * scaleX;
      const ballY = gs.ball.y * scaleY;
      const ballR = gs.ball.radius * scaleX;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
