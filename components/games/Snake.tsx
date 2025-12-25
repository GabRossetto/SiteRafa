"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, Heart, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GRID_SIZE = 20; 
const INITIAL_SNAKE = [[10, 10], [10, 11], [10, 12]]; 
const INITIAL_DIR = [0, -1]; 

export default function SnakeGame() {
  const [snake, setSnake] = useState<number[][]>(INITIAL_SNAKE);
  const [food, setFood] = useState<number[]>([5, 5]);
  const [direction, setDirection] = useState<number[]>(INITIAL_DIR); 
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(INITIAL_DIR); 
  const moveRef = useRef(INITIAL_DIR); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snakeHighScore");
      if (saved) setHighScore(parseInt(saved));
    }
    spawnFood(); 
  }, []);

  useEffect(() => {
    if (gameOver && score > highScore) {
        setHighScore(score);
        if (typeof window !== "undefined") {
          localStorage.setItem("snakeHighScore", score.toString());
        }
    }
  }, [gameOver, score, highScore]);

  const spawnFood = () => {
    let newFood: number[] = [0, 0]; 
    while (true) {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE),
      ];
      // eslint-disable-next-line no-loop-func
      const isOnSnake = snake.some(s => s[0] === newFood[0] && s[1] === newFood[1]);
      if (!isOnSnake) break; 
    }
    setFood(newFood);
  };

  const changeDirection = useCallback((move: number[]) => {
    if (moveRef.current[0] + move[0] === 0 && moveRef.current[1] + move[1] === 0) return;
    directionRef.current = move; 
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      switch(e.key) {
        case "ArrowUp":    changeDirection([0, -1]); break;
        case "ArrowDown":  changeDirection([0, 1]); break;
        case "ArrowLeft":  changeDirection([-1, 0]); break;
        case "ArrowRight": changeDirection([1, 0]); break;
        case " ": 
          if (gameOver) resetGame();
          else setIsPlaying(prev => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [changeDirection, gameOver]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        moveRef.current = currentDir;

        const newHead = [head[0] + currentDir[0], head[1] + currentDir[1]];

        // Colisões
        if (
          newHead[0] < 0 || newHead[0] >= GRID_SIZE || 
          newHead[1] < 0 || newHead[1] >= GRID_SIZE ||
          prevSnake.some((s, index) => index !== prevSnake.length - 1 && s[0] === newHead[0] && s[1] === newHead[1])
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore(s => s + 1);
          spawnFood();
        } else {
          newSnake.pop(); 
        }

        return newSnake;
      });
    }, 130); // Um pouquinho mais rápido para ser fluido

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, food]); 

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = [0, -1];
    moveRef.current = [0, -1];
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    spawnFood();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full select-none">
      
      {/* HUD (Placar) - Mais Largo */}
      <div className="w-full max-w-[500px] flex justify-between items-center mb-6 bg-[#1a1a1a] px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
         <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-full border border-yellow-500/50"><Trophy size={18} className="text-yellow-400"/></div>
            <div className="flex flex-col">
               <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Recorde</span>
               <span className="text-lg font-mono font-bold text-white leading-none">{highScore}</span>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Pontos</span>
            <span className="text-3xl font-mono font-bold text-rose-500 leading-none drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]">{score}</span>
         </div>
      </div>

      {/* ÁREA DO JOGO (Grande e Realista) */}
      <div 
        className="relative bg-black rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.15)] border-8 border-[#222] overflow-hidden w-full max-w-[500px] aspect-square"
        style={{ 
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Efeito CRT (Scanlines) para dar realismo */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" style={{backgroundSize: "100% 2px, 3px 100%"}} />
        
        {/* Overlay Pause / Game Over */}
        <AnimatePresence>
            {(!isPlaying || gameOver) && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                >
                    {gameOver ? (
                        <>
                            <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter">GAME OVER</h3>
                            <p className="text-neutral-400 mb-8 font-mono text-lg">Corações coletados: <span className="text-rose-500 font-bold">{score}</span></p>
                            <button onClick={resetGame} className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-[0_0_30px_white]">
                                <RotateCcw size={20}/> Jogar Novamente
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsPlaying(true)} className="group flex flex-col items-center gap-6">
                            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.6)] group-hover:scale-110 transition-transform border-4 border-green-400">
                                <Play size={40} className="text-white fill-white ml-2"/>
                            </div>
                            <span className="text-xl font-bold tracking-[0.2em] text-white uppercase animate-pulse">Toque para Iniciar</span>
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Grade Sutil de Fundo */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-20">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-green-500/20" />
            ))}
        </div>

        {/* RENDER DO JOGO */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            
            const isFood = food[0] === x && food[1] === y;
            const isSnakeIndex = snake.findIndex(s => s[0] === x && s[1] === y);
            const isHead = isSnakeIndex === 0;
            const isBody = isSnakeIndex > 0;

            if (isFood) {
                return (
                    <div key={i} className="w-full h-full flex items-center justify-center relative z-20">
                        <Heart 
                            className="w-[80%] h-[80%] text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" 
                            style={{ animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} 
                        />
                    </div>
                );
            }

            if (isHead) {
                return (
                    <div key={i} className="w-full h-full p-[2px] z-20">
                        <div className="w-full h-full bg-green-400 rounded-sm shadow-[0_0_15px_rgba(74,222,128,0.8)] relative">
                            {/* Olhinhos baseados na direção seriam legais, mas simples funcionam bem */}
                            <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] bg-black rounded-full" />
                            <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-black rounded-full" />
                        </div>
                    </div>
                );
            }

            if (isBody) {
                return (
                    <div key={i} className="w-full h-full p-[2px] z-10">
                       <div className="w-full h-full bg-green-600/90 rounded-[2px] shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    </div>
                );
            }

            return <div key={i} className="w-full h-full" />;
        })}
      </div>

      {/* 
          D-PAD GAMER PARA CELULAR
          (Oculto em telas muito grandes se quiser, mas mantido md:hidden para ser foco mobile)
      */}
      <div className="mt-8 w-full max-w-[300px] aspect-square grid grid-cols-3 grid-rows-2 gap-3 md:hidden">
         {/* Layout em Cruz */}
         <div /> 
         <DpadBtn icon={ArrowUp} onClick={()=>changeDirection([0,-1])} /> 
         <div />
         
         <DpadBtn icon={ArrowLeft} onClick={()=>changeDirection([-1,0])} />
         
         {/* Botão Central de Pause */}
         <button onClick={()=>setIsPlaying(p=>!p)} className="w-full h-full rounded-2xl bg-[#222] active:bg-[#333] border-b-4 border-black active:border-b-0 active:translate-y-1 flex items-center justify-center transition-all">
            {isPlaying ? <Pause className="text-white fill-white"/> : <Play className="text-white fill-white"/>}
         </button>

         <DpadBtn icon={ArrowRight} onClick={()=>changeDirection([1,0])} />
         
         <div /> 
         <DpadBtn icon={ArrowDown} onClick={()=>changeDirection([0,1])} /> 
         <div />
      </div>

      {/* Footer Instruções PC */}
      <div className="hidden md:flex mt-6 text-neutral-500 text-xs font-mono bg-white/5 px-4 py-2 rounded-full border border-white/5 items-center gap-4">
         <span className="flex items-center gap-1"><span className="border border-white/20 px-1 rounded">⬆</span><span className="border border-white/20 px-1 rounded">⬇</span> Mover</span>
         <span className="w-[1px] h-3 bg-white/20"/>
         <span className="flex items-center gap-1"><span className="border border-white/20 px-2 rounded">Space</span> Pause</span>
      </div>

    </div>
  );
}

// Botão Gamer Grande
function DpadBtn({ icon: Icon, onClick }: any) {
    return (
        <button 
            className="w-full h-full min-h-[60px] rounded-2xl bg-[#333] border-b-[6px] border-black active:border-b-0 active:translate-y-[6px] active:bg-[#444] flex items-center justify-center transition-all shadow-xl group"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            onTouchStart={(e) => {
                e.preventDefault(); // Previne scroll ao jogar rápido
                onClick();
            }}
        >
            <Icon size={32} strokeWidth={3} className="text-white/80 group-active:text-white" />
        </button>
    )
}