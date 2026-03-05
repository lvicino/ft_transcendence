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
      // 1. Подгоняем размер канваса под родителя (чтобы не мылило)
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const { width, height } = canvas;
      const state = useGameStore.getState();

      // 2. Очистка (Прозрачный фон!)
      ctx.clearRect(0, 0, width, height);

      // 3. Сетка (еле заметная)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // 4. Рисуем элементы (Белые, "Светящиеся")
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 10;

      // Размеры (относительные)
      const paddleW = width * 0.015;
      const paddleH = height * 0.15;
      const ballR = width * 0.01;

      // Левая ракетка
      const leftY = (state.paddles.left / 100) * height - paddleH / 2;
      ctx.fillRect(10, leftY, paddleW, paddleH);

      // Правая ракетка
      const rightY = (state.paddles.right / 100) * height - paddleH / 2;
      ctx.fillRect(width - 10 - paddleW, rightY, paddleW, paddleH);

      // Мяч
      const ballX = (state.ball.x / 100) * width;
      const ballY = (state.ball.y / 100) * height;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();

      // Сброс тени (для производительности)
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    // React 19 Style Cleanup: просто возвращаем функцию отписки
    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
