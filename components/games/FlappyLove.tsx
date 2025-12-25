"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Play, RotateCcw, Heart, Cloud, Trophy } from "lucide-react";

// CONFIGURAÇÕES DE FÍSICA E JOGO
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_SPEED = 3.5;
const PIPE_SPAWN_RATE = 100; // frames
const PIPE_GAP = 160;
const BIRD_SIZE = 36;
const GAME_HEIGHT = 500;

export default function FlappyLove() {
  // --- ESTADOS DO UI (React) ---
  const [gameState, setGameState] = useState<"MENU" | "PLAYING" | "GAME_OVER">("MENU");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameTick, setGameTick] = useState(0); // Força renderização visual

  // --- ESTADOS DA FÍSICA (Mutable Refs - Não causam re-render lento) ---
  const birdY = useRef(GAME_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const birdRotation = useRef(0);
  const pipes = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
  const frameCount = useRef(0);
  
  // FIX: Inicializado com 0 para satisfazer o TypeScript
  const requestRef = useRef<number>(0); 
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializa High Score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flappyScore");
      if (saved) setHighScore(parseInt(saved));
    }
  }, []);

  // --- MOTOR DO JOGO ---
  const gameLoop = useCallback(() => {
    if (gameState !== "PLAYING") return;

    // 1. Física do Pássaro
    birdVelocity.current += GRAVITY;
    birdY.current += birdVelocity.current;
    
    // Rotação suave baseada na velocidade
    birdRotation.current = Math.min(Math.max(birdVelocity.current * 4, -25), 90);

    // Colisão Chão/Teto
    if (birdY.current > GAME_HEIGHT - BIRD_SIZE || birdY.current < 0) {
      gameOver();
      return;
    }

    // 2. Gerenciar Canos
    frameCount.current++;
    if (frameCount.current % PIPE_SPAWN_RATE === 0) {
      const minPipe = 50;
      const maxPipe = GAME_HEIGHT - PIPE_GAP - minPipe;
      const randomHeight = Math.floor(Math.random() * (maxPipe - minPipe + 1)) + minPipe;
      // Garante largura padrão caso a ref seja nula
      pipes.current.push({ x: containerRef.current?.clientWidth || 400, topHeight: randomHeight, passed: false });
    }

    // 3. Mover Canos & Detectar Colisão
    pipes.current.forEach((pipe, index) => {
      pipe.x -= PIPE_SPEED;

      // Remover canos antigos
      if (pipe.x + 60 < 0) {
        pipes.current.shift();
      }

      // Colisão
      // Bird: x=60, y=birdY, w=30, h=30 (Hitbox menor para facilitar)
      // Pipe: x=pipe.x, w=50
      const birdLeft = 60 + 5; // padding hitbox
      const birdRight = 60 + BIRD_SIZE - 5;
      const birdTop = birdY.current + 5;
      const birdBottom = birdY.current + BIRD_SIZE - 5;

      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + 52; // Largura do cano

      // Se estiver na horizontal do cano
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Se bater no topo OU no chão (passou fora do buraco)
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          gameOver();
        }
      }

      // Pontuar
      if (pipe.x + 52 < 60 && !pipe.passed) {
        pipe.passed = true;
        setScore((prev) => prev + 1);
      }
    });

    // 4. Renderizar Próximo Frame
    setGameTick((prev) => prev + 1); // Dispara atualização visual
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  // Iniciar/Parar Loop baseado no estado
  useEffect(() => {
    if (gameState === "PLAYING") {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, gameLoop]);

  // --- CONTROLES ---
  const startGame = () => {
    birdY.current = GAME_HEIGHT / 2;
    birdVelocity.current = 0;
    birdRotation.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setGameState("PLAYING");
  };

  const jump = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (gameState === "PLAYING") {
      birdVelocity.current = JUMP_STRENGTH;
    } 
      // Opcional: reiniciar com espaço se morto
  };

  const gameOver = () => {
    setGameState("GAME_OVER");
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("flappyScore", score.toString());
    }
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState]);

  return (
    <div className="w-full max-w-lg mx-auto p-4 select-none outline-none">
      
      {/* Container Principal do Jogo */}
      <div 
        ref={containerRef}
        onClick={gameState === "PLAYING" ? (e) => jump(e) : undefined}
        className="relative w-full overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 cursor-pointer"
        style={{ height: GAME_HEIGHT }}
      >
        
        {/* PARALLAX (Visual Apenas) */}
        <div className="absolute inset-0 opacity-60">
            <Cloud size={60} className="absolute top-10 left-10 text-white animate-pulse" />
            <Cloud size={40} className="absolute top-32 right-20 text-white/80" />
            <Cloud size={90} className="absolute top-60 left-1/3 text-white/40" />
        </div>

        {/* HUD DE SCORE */}
        {gameState === "PLAYING" && (
            <div className="absolute top-10 w-full text-center z-30 pointer-events-none">
                <span className="text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] font-mono">
                    {score}
                </span>
            </div>
        )}

        {/* JOGADOR (CUPIDO/CORAÇÃO) */}
        <div 
            className="absolute left-[60px] z-20 flex items-center justify-center filter drop-shadow-lg"
            style={{ 
                top: birdY.current,
                width: BIRD_SIZE, 
                height: BIRD_SIZE,
                transform: `rotate(${birdRotation.current}deg)`,
                transition: "transform 0.1s linear" // Suaviza apenas a rotação visual
            }}
        >
            <Heart 
                fill="#f43f5e" 
                className="w-full h-full text-rose-500" 
            />
            {/* Asinha batendo */}
            <div className={`absolute -right-3 -top-1 w-4 h-3 bg-white rounded-full ${gameState === 'PLAYING' ? 'animate-bounce' : ''}`} />
        </div>

        {/* CANOS (Obstáculos) */}
        {pipes.current.map((pipe, i) => (
            <div key={i}>
                {/* Cano Superior */}
                <div 
                    className="absolute z-10 w-[52px] bg-gradient-to-r from-rose-400 to-rose-500 border-b-[6px] border-rose-700 rounded-b-lg shadow-md"
                    style={{ left: pipe.x, top: 0, height: pipe.topHeight }} 
                />
                {/* Cano Inferior */}
                <div 
                    className="absolute z-10 w-[52px] bg-gradient-to-r from-rose-400 to-rose-500 border-t-[6px] border-rose-700 rounded-t-lg shadow-md"
                    style={{ left: pipe.x, top: pipe.topHeight + PIPE_GAP, bottom: 0 }} 
                />
            </div>
        ))}

        {/* CHÃO ANIMADO */}
        <div className="absolute bottom-0 w-full h-[20px] bg-[#6bc958] border-t-4 border-[#4a8f3d] z-30" />

        {/* --- MENUS --- */}

        {/* MENU INICIAL */}
        {gameState === "MENU" && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 flex flex-col items-center justify-center animate-in fade-in">
                <Heart size={80} className="text-rose-500 fill-rose-500 mb-6 animate-bounce" />
                <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md text-center px-4">
                    Flappy Cupid
                </h1>
                <p className="text-white/80 font-mono mb-8 text-sm">Toque para voar e desviar</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="flex items-center gap-3 bg-white text-rose-600 px-8 py-3 rounded-full font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition"
                >
                    <Play fill="currentColor" size={20} /> Começar
                </button>
            </div>
        )}

        {/* MENU GAME OVER */}
        {gameState === "GAME_OVER" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
                <span className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Fim de Jogo!</span>
                
                <div className="bg-[#fffbe6] w-full max-w-xs rounded-xl p-6 shadow-2xl border-4 border-yellow-200 mb-8 relative">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                       <div className="bg-yellow-400 p-2 rounded-full border-4 border-[#fffbe6] shadow-sm">
                          <Trophy size={24} className="text-white" />
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-orange-100 pb-2 mb-2 mt-2">
                        <span className="text-xs font-bold text-orange-800 uppercase">Score Atual</span>
                        <span className="text-4xl font-black text-rose-500">{score}</span>
                    </div>
                    <div className="flex justify-between items-center text-orange-900/60 font-bold text-xs">
                        <span>MELHOR PONTUAÇÃO</span>
                        <span>{highScore}</span>
                    </div>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-8 py-4 rounded-full font-bold shadow-[0_10px_30px_-10px_rgba(225,29,72,0.6)] active:scale-95 transition"
                >
                    <RotateCcw size={18} /> Tentar Novamente
                </button>
            </div>
        )}

      </div>
    </div>
  );
}