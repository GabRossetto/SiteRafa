"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Socket } from "socket.io-client";
import { RefreshCcw, User, Brain, Heart, Loader2, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface Props { socket: Socket; }

export default function MemoryGame({ socket }: Props) {
  const [board, setBoard] = useState<any[]>([]);
  const [score, setScore] = useState({ P1: 0, P2: 0 });
  const [turn, setTurn] = useState<"P1" | "P2">("P1");
  const [myRole, setMyRole] = useState<"P1" | "P2" | "SPECTATOR" | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.off("memory_role"); socket.off("memory_update");
    socket.on("memory_role", (role) => setMyRole(role));
    socket.on("memory_update", (state) => {
        if (!state || !state.board) return;
        setBoard(state.board);
        if((state.score.P1 + state.score.P2) > (score.P1 + score.P2)) confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        setScore(state.score); setTurn(state.turn); setIsSynced(true);
    });
    socket.emit("memory_request_state");
    return () => { socket.off("memory_role"); socket.off("memory_update"); };
  }, [socket]);

  const handleCardClick = (id: number) => {
    const isMyTurn = (turn === "P1" && myRole === "P1") || (turn === "P2" && myRole === "P2");
    if (!isMyTurn || !isSynced) return;
    socket.emit("memory_flip", id);
  };

  const isMyTurn = (turn === "P1" && myRole === "P1") || (turn === "P2" && myRole === "P2");
  const gameOver = (score.P1 + score.P2) >= 8;
  const winner = score.P1 > score.P2 ? "P1" : score.P2 > score.P1 ? "P2" : "Empate";

  if (!isSynced) return <div className="flex flex-col items-center justify-center h-48 text-white/50 animate-pulse gap-2"><Loader2 className="animate-spin" size={32} /><p className="text-[10px] uppercase font-bold tracking-widest">Sincronizando...</p></div>;

  return (
    <div className="flex flex-col items-center w-full h-full select-none pt-2 pb-4">
       <div className="w-full shrink-0 px-2">
           <div className="flex w-full mb-3 bg-[#1a1a1a] rounded-xl border border-white/10 relative overflow-hidden shadow-lg">
              <motion.div className="absolute bottom-0 left-0 h-1 bg-yellow-400 z-10 transition-all duration-500 ease-out" animate={{ left: turn === "P1" ? "0%" : "50%", width: "50%" }} />
              <div className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${turn === "P1" ? "bg-white/5" : "opacity-40"}`}><div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-bold text-rose-300 uppercase tracking-widest"><Heart size={10}/> Amor</div><div className="text-2xl font-mono font-bold text-white tabular-nums leading-none">{score.P1}</div></div>
              <div className="w-[1px] bg-white/10 self-stretch my-2" />
              <div className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${turn === "P2" ? "bg-white/5" : "opacity-40"}`}><div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-bold text-blue-300 uppercase tracking-widest"><User size={10}/> Par</div><div className="text-2xl font-mono font-bold text-white tabular-nums leading-none">{score.P2}</div></div>
           </div>
       </div>

       <div className="shrink-0 h-8 mb-2 flex justify-center w-full px-4">
          {gameOver ? ( <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-300 px-3 py-1 rounded-full font-bold uppercase text-[10px] flex items-center gap-2 whitespace-nowrap"><Trophy size={12}/> {winner === "Empate" ? "Empate!" : (winner === myRole ? "Vitória!" : "Amor Venceu!")}</div>
          ) : ( <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all text-center truncate w-full max-w-[280px] ${isMyTurn ? "bg-green-500/10 border-green-500/50 text-green-400" : "bg-neutral-800 border-neutral-700 text-neutral-500"}`}>{isMyTurn ? "Sua vez! Toque numa carta" : `Aguardando jogada do ${turn === "P1" ? "Amor" : "Par"}...`}</div>)}
       </div>

       <div className="flex-1 w-full min-h-0 overflow-y-auto px-2 md:px-0"><div className="grid grid-cols-4 gap-2 w-full max-w-sm mx-auto">
          {board.map((card) => {
             const canFlip = !card.isFlipped && !card.isMatched && !gameOver;
             const interactive = canFlip && isMyTurn;
             return (
                <div key={card.id} onClick={() => interactive && handleCardClick(card.id)} className={`w-full aspect-[3/4] relative preserve-3d cursor-pointer transition-transform duration-200 ${interactive ? "active:scale-95" : ""} ${!interactive && !card.isFlipped ? "opacity-100" : ""}`} style={{ perspective: "1000px" }}>
                    <motion.div className="w-full h-full relative" initial={false} animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ transformStyle: "preserve-3d" }}>
                        <div className={`absolute inset-0 backface-hidden rounded-lg shadow-sm border flex items-center justify-center bg-[#252529] ${interactive ? "border-white/30" : "border-white/5"}`} style={{ backfaceVisibility: 'hidden' }}><Brain size={18} className={`text-white/10 ${interactive ? "animate-pulse" : ""}`} /></div>
                        <div className={`absolute inset-0 backface-hidden rounded-lg shadow-inner flex items-center justify-center text-2xl md:text-3xl border transition-colors duration-300 bg-[#f0f0f0] ${card.isMatched ? "border-green-500 bg-green-50" : "border-white"}`} style={{ backfaceVisibility: 'hidden', transform: "rotateY(180deg)" }}>{(card.isFlipped || card.isMatched) ? card.val : null}</div>
                    </motion.div>
                </div>
             );
          })}
       </div></div>

       {gameOver && <div className="shrink-0 mt-4"><button onClick={() => socket.emit("memory_reset")} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-bold uppercase text-[10px] active:scale-95 transition"><RefreshCcw size={12}/> Jogar Novamente</button></div>}
    </div>
  )
}