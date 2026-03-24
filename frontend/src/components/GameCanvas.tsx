import { useEffect, useRef } from 'react';

import { useGameStore, useGameFlowStore } from '../store';
import { connectGameSocket } from '../net/socket';

import { useNavigate } from 'react-router-dom';

export default function GameCanvas() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //const { matchId } = useParams(); // a suup; utiliser useGameFlowStore a la place
  const matchId = useGameFlowStore((s) => s.matchId);
  const password = useGameFlowStore((s) => s.password);

  const setStatus = useGameFlowStore((s) => s.setStatus);
  const setMessageInfo = useGameFlowStore((s) => s.setMessageInfo);
  const updateGame = useGameStore((s) => s.updateGame);

  useEffect(() => { // ducoup ca fait quoi useEffect exactement ?
    if (!matchId) {
		setMessageInfo("no game id");
		setStatus('error');
		navigate('/lobby');
		return;
	}

    const socket = connectGameSocket(matchId, password, (data) => {
      console.log("data websocket: ", data);
      if (data.type === 'state') {
        updateGame(data.state); //
      } else if (data.type === 'error') {
		setMessageInfo(data.message);
		setStatus('error');
		navigate('/lobby');
	  } else if (data.type === 'Game Stop') {
      setStatus('finished');
    }
    });

    // inpute clavier
    
    const keys = { up: false, down: false };
    let currentMove = 0;

    const updateMovement = () => {
      let newMove = 0;
      if (keys.up) newMove -= 1;
      if (keys.down) newMove += 1;

      if (newMove !== currentMove) { // pas besoin je pense
        currentMove = newMove;
        socket.send({ type: 'input', moove: currentMove });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        keys.up = true;
        updateMovement();
      }
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        keys.down = true;
        updateMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        keys.up = false;
        updateMovement();
      }
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        keys.down = false;
        updateMovement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      socket.close();
    };
  }, [matchId, updateGame]); // pas besoin de [matchId, updateGame] car il ne sont pas sense changer il me semble... ; [matchId, password, updateGame, navigate, setMessageInfo, setStatus]);

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
      const frame = useGameStore.getState().frame;

      ctx.clearRect(0, 0, width, height);

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      if (frame) {
        // Scale factors from game coordinates to canvas pixels
        const sx = width / frame.gameWide;
        const sy = height / frame.gameHeight;

        ctx.fillStyle = '#fff';

        // Draw players
        for (const p of frame.players) {
          const px = p.x * sx - (p.w * sx) / 2;
          const py = p.y * sy - (p.h * sy) / 2;
          ctx.fillRect(px, py, p.w * sx, p.h * sy);
        }

        // Draw ball
        const ballX = frame.ball.x * sx;
        const ballY = frame.ball.y * sy;
        const ballR = frame.ball.radius * Math.min(sx, sy);

        ctx.beginPath();
        ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render); // ca sort d'ou "requestAnimationFrame" 
	  											   // et pour quoi il prend "render" en parametre ?
												   // ducoup c'est recursif ??
    };

    render();

    return () => cancelAnimationFrame(animationId); // ca sort d'ou "cancelAnimationFrame" ?
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}