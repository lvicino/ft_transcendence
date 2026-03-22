import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useGameStore } from '../store';
import { connectGameSocket } from '../net/socket';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { matchId } = useParams(); // a suup; utiliser useGameFlowStore a la place

  const updateGame = useGameStore((s) => s.updateGame);

  useEffect(() => { // ducoup ca fait quoi useEffect exactement ?
    if (!matchId) return;

    const socket = connectGameSocket(matchId, (data) => {
      if (data.type === 'state') {
        updateGame(data.state); //
      }
    });

    return () => socket.close();
  }, [matchId, updateGame]); // pas besoin de [matchId, updateGame] car il ne sont pas sense changer il me semble...

  useEffect(() => { // pour quoi 2 useEfect diferent ??
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const { width, height } = canvas;
      const state = useGameStore.getState(); // pour quoi .getState() ?? sa reagie a updateGame() ??

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      ctx.fillStyle = '#fff';

      const paddleW = width * 0.015;
      const paddleH = height * 0.15;
      const ballR = width * 0.01;

      const leftY = (state.paddles.left / 100) * height - paddleH / 2;
      ctx.fillRect(10, leftY, paddleW, paddleH);

      const rightY = (state.paddles.right / 100) * height - paddleH / 2;
      ctx.fillRect(width - 10 - paddleW, rightY, paddleW, paddleH);

      const ballX = (state.ball.x / 100) * width;
      const ballY = (state.ball.y / 100) * height;

      ctx.beginPath();
      ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render); // ca sort d'ou "requestAnimationFrame" 
	  											   // et pour quoi il prend "render" en parametre ?
												   // ducoup c'est recursif ??
    };

    render();

    return () => cancelAnimationFrame(animationId); // ca sort d'ou "cancelAnimationFrame" ?
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}