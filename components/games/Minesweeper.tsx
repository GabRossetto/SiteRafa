"use client";

import { useState, useEffect } from "react";
import { Flag, Heart, Bomb, RefreshCcw, Smile, AlertCircle, Shovel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// CONFIGURAÇÕES
const BOARD_SIZE = 9; // 9x9 (Bom para mobile)
const BOMBS_COUNT = 10;

interface Cell {
  id: number;
  x: number;
  y: number;
  isBomb: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export default function Minesweeper() {
  const [board, setBoard] = useState<Cell[]>([]);
  const [gameStatus, setGameStatus] = useState<"PLAYING" | "WON" | "LOST">("PLAYING");
  const [flagsLeft, setFlagsLeft] = useState(BOMBS_COUNT);
  const [mode, setMode] = useState<"DIG" | "FLAG">("DIG"); // Para mobile

  // INICIA O JOGO
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // 1. Cria celulas vazias
    let newBoard: Cell[] = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      newBoard.push({
        id: i,
        x: i % BOARD_SIZE,
        y: Math.floor(i / BOARD_SIZE),
        isBomb: false,
        isOpen: false,
        isFlagged: false,
        neighborCount: 0,
      });
    }

    // 2. Coloca Bombas
    let bombsPlaced = 0;
    while (bombsPlaced < BOMBS_COUNT) {
      const idx = Math.floor(Math.random() * newBoard.length);
      if (!newBoard[idx].isBomb) {
        newBoard[idx].isBomb = true;
        bombsPlaced++;
      }
    }

    // 3. Calcula Vizinhos
    const getIndex = (x: number, y: number) => {
        if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return -1;
        return y * BOARD_SIZE + x;
    };

    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i].isBomb) continue;
      
      const { x, y } = newBoard[i];
      let count = 0;
      
      // Checa os 8 vizinhos
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
           const neighborIdx = getIndex(x + dx, y + dy);
           if (neighborIdx !== -1 && newBoard[neighborIdx].isBomb) {
             count++;
           }
        }
      }
      newBoard[i].neighborCount = count;
    }

    setBoard(newBoard);
    setGameStatus("PLAYING");
    setFlagsLeft(BOMBS_COUNT);
    setMode("DIG");
  };

  // REVELAR CÉLULAS (Flood Fill Recursivo)
  const reveal = (boardState: Cell[], idx: number) => {
    const cell = boardState[idx];
    if (!cell || cell.isOpen || cell.isFlagged) return;

    cell.isOpen = true;

    // Se for 0 (vazio), abre os vizinhos automaticamente
    if (cell.neighborCount === 0 && !cell.isBomb) {
       const { x, y } = cell;
       const getIndex = (gx: number, gy: number) => (gx >= 0 && gx < BOARD_SIZE && gy >= 0 && gy < BOARD_SIZE) ? gy * BOARD_SIZE + gx : -1;

       for (let dx = -1; dx <= 1; dx++) {
         for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const neighborIdx = getIndex(x + dx, y + dy);
            if (neighborIdx !== -1) {
                reveal(boardState, neighborIdx);
            }
         }
       }
    }
  };

  const handleInteraction = (idx: number, type: "CLICK" | "CONTEXT") => {
    if (gameStatus !== "PLAYING") return;

    let newBoard = [...board];
    const cell = newBoard[idx];

    // MODO BANDEIRA (Botão direito ou toggle mobile)
    if (type === "CONTEXT" || mode === "FLAG") {
        if (cell.isOpen) return;
        
        // Toggle Flag
        if (!cell.isFlagged && flagsLeft > 0) {
            cell.isFlagged = true;
            setFlagsLeft(f => f - 1);
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            setFlagsLeft(f => f + 1);
        }
        setBoard(newBoard);
        return;
    }

    // MODO ESCAVAR
    if (cell.isFlagged) return; // Protege bandeira

    if (cell.isBomb) {
        // EXPLODIU
        cell.isOpen = true; // Mostra essa
        // Revela todas as bombas
        newBoard.forEach(c => { if(c.isBomb) c.isOpen = true; });
        setBoard(newBoard);
        setGameStatus("LOST");
        return;
    }

    // Se seguro
    reveal(newBoard, idx);
    setBoard(newBoard);

    // CHECAR VITÓRIA
    // Venceu se todas as NÃO-BOMBAS estiverem abertas
    const nonBombs = newBoard.filter(c => !c.isBomb);
    const allOpen = nonBombs.every(c => c.isOpen);
    if (allOpen) {
        setGameStatus("WON");
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#e11d48', '#ffffff'] // Cores românticas
        });
    }
  };

  // Cores dos números
  const getNumColor = (n: number) => {
    const colors = ["text-gray-500", "text-blue-400", "text-green-400", "text-red-400", "text-purple-400", "text-yellow-400", "text-teal-400", "text-white"];
    return colors[n] || "text-white";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full select-none pb-4">
      
      {/* HUD (CABEÇALHO) */}
      <div className="w-full max-w-[350px] bg-[#1a1a1a] rounded-2xl border border-white/10 p-4 mb-6 shadow-xl flex justify-between items-center">
         <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">Proteja o ❤️</span>
            <div className="flex items-center gap-2 text-rose-500 font-bold">
                <Heart size={18} className="fill-current"/> 
                <span>{flagsLeft}</span>
            </div>
         </div>

         {/* BOTÃO CARINHA (STATUS) */}
         <button 
            onClick={initGame}
            className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-2xl hover:scale-110 hover:bg-neutral-700 transition active:scale-95 border border-white/5"
         >
            {gameStatus === "PLAYING" ? "🙂" : gameStatus === "WON" ? "😍" : "😭"}
         </button>

         {/* TOGGLE MODE (MOBILE) */}
         <button 
            onClick={() => setMode(m => m === "DIG" ? "FLAG" : "DIG")}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg border transition-all active:scale-95
              ${mode === "FLAG" 
                 ? "bg-rose-500/20 border-rose-500 text-rose-300" 
                 : "bg-blue-500/20 border-blue-500 text-blue-300"}
            `}
         >
            {mode === "FLAG" ? <Flag size={16} fill="currentColor"/> : <Shovel size={16}/>}
            <span className="text-[8px] font-bold uppercase">{mode === "FLAG" ? "Marcar" : "Abrir"}</span>
         </button>
      </div>

      {/* TABULEIRO */}
      <div 
         className="bg-[#2a2a2a] p-3 rounded-lg shadow-2xl border-4 border-[#333]"
         onContextMenu={(e) => e.preventDefault()} // Desativa menu contexto padrão
      >
         <div 
            className="grid gap-1"
            style={{ 
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` 
            }}
         >
            {board.map((cell) => (
                <motion.button
                    key={cell.id}
                    // Ações Mouse (PC)
                    onClick={() => handleInteraction(cell.id, "CLICK")}
                    onContextMenu={(e) => { e.preventDefault(); handleInteraction(cell.id, "CONTEXT"); }}
                    
                    initial={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                        w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-200
                        ${!cell.isOpen 
                            ? "bg-gradient-to-br from-[#444] to-[#333] hover:from-[#555] hover:to-[#444] border-t border-l border-white/10" 
                            : cell.isBomb 
                                ? "bg-red-500/90 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" 
                                : "bg-[#18181b] shadow-inner"}
                    `}
                >
                    {/* Se estiver fechada */}
                    {!cell.isOpen && cell.isFlagged && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Heart size={16} className="text-rose-500 fill-rose-500 drop-shadow-md"/>
                        </motion.div>
                    )}

                    {/* Se estiver aberta */}
                    {cell.isOpen && (
                        <>
                            {cell.isBomb ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl">
                                    {gameStatus === "WON" ? "💐" : "💔"}
                                </motion.div>
                            ) : (
                                cell.neighborCount > 0 && (
                                    <span className={`${getNumColor(cell.neighborCount)}`}>
                                        {cell.neighborCount}
                                    </span>
                                )
                            )}
                        </>
                    )}
                </motion.button>
            ))}
         </div>
      </div>

      {/* FEEDBACK FINAL */}
      <AnimatePresence>
        {gameStatus !== "PLAYING" && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className={`mt-6 px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-widest flex items-center gap-2
                 ${gameStatus === "WON" 
                    ? "bg-green-500/10 border-green-500 text-green-400" 
                    : "bg-red-500/10 border-red-500 text-red-400"}
               `}
            >
               {gameStatus === "WON" ? (
                   <><Smile size={16}/> O Amor Venceu!</>
               ) : (
                   <><AlertCircle size={16}/> Cuidado com a bomba!</>
               )}
            </motion.div>
        )}
      </AnimatePresence>

      <button onClick={initGame} className="mt-8 text-neutral-500 hover:text-white text-xs underline decoration-neutral-700 underline-offset-4 flex items-center gap-1">
         <RefreshCcw size={10} /> Reiniciar Tabuleiro
      </button>

    </div>
  );
}