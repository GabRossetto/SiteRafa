"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Trophy, Heart } from "lucide-react";
import { Socket } from "socket.io-client";
import confetti from "canvas-confetti";

interface Props { socket: Socket; }

export default function TicTacToe({ socket }: Props) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState<{X: number, O: number}>({ X: 0, O: 0 });
  const [myRole, setMyRole] = useState<"X" | "O" | "SPECTATOR" | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.off("tictac_role"); socket.off("tictac_update");
    socket.on("tictac_role", (role) => setMyRole(role));
    socket.on("tictac_update", (serverState) => {
        setBoard(serverState.board || Array(9).fill(null));
        setIsXNext(serverState.isXNext);
        setWinner(serverState.winner);
        setScore(serverState.score || { X: 0, O: 0 }); 
        setIsSynced(true);
        if(serverState.winner && serverState.winner !== "Empate") confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#e11d48', '#ffffff'] });
    });
    socket.emit("tictac_request_state");
    return () => { socket.off("tictac_role"); socket.off("tictac_update"); }
  }, [socket]);

  const handleClick = (i: number) => {
    const isMyTurn = (isXNext && myRole === 'X') || (!isXNext && myRole === 'O');
    if(!isSynced || board[i] || winner || !isMyTurn) return;
    socket.emit("tictac_move", i);
  };
  const handleReset = () => socket.emit("tictac_reset");
  const isMyTurn = (isXNext && myRole === 'X') || (!isXNext && myRole === 'O');

  if (!isSynced) return <div className="flex flex-col items-center justify-center h-60 text-white/50 animate-pulse gap-2"><Heart className="animate-bounce" size={40} /><p className="text-xs uppercase font-bold tracking-widest">Sincronizando...</p></div>;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none p-4">
       <div className="flex justify-between items-center w-full mb-6 px-4 py-3 bg-[#18181b] border border-white/10 rounded-2xl shadow-lg relative overflow-hidden">
          <div className={`relative z-10 flex flex-col items-center p-2 rounded-xl transition-colors ${isXNext ? "bg-rose-500/20 ring-1 ring-rose-500/50" : "opacity-60"}`}><div className="text-2xl mb-1">❤️</div><div className="text-[10px] font-bold text-rose-200 tracking-widest">AMOR</div><div className="text-xl font-bold text-white tabular-nums">{score?.X || 0}</div>{myRole === 'X' && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>}</div>
          <div className="relative z-10 text-white/20 font-thin text-3xl">VS</div>
          <div className={`relative z-10 flex flex-col items-center p-2 rounded-xl transition-colors ${!isXNext ? "bg-blue-500/20 ring-1 ring-blue-500/50" : "opacity-60"}`}><div className="text-2xl mb-1">💋</div><div className="text-[10px] font-bold text-blue-200 tracking-widest">BEIJO</div><div className="text-xl font-bold text-white tabular-nums">{score?.O || 0}</div>{myRole === 'O' && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}</div>
       </div>
       <div className="h-8 mb-4 text-center">
          <AnimatePresence mode="wait">
             {winner ? <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-1 rounded-full border border-yellow-500/20 text-xs font-bold"><Trophy size={14} /> {winner === "Empate" ? "Empate!" : `${winner} Venceu!`}</motion.div> : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={isMyTurn ? "my" : "wait"} className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isMyTurn ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-neutral-800 text-neutral-500 border-neutral-700"}`}>{isMyTurn ? "Sua vez!" : `Vez do ${isXNext ? "Amor" : "Beijo"}...`}</motion.div>}
          </AnimatePresence>
       </div>
       <div className="relative p-1 bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-2xl shadow-2xl border border-white/5"><div className="grid grid-cols-3 gap-2">{board.map((cell, i) => (<motion.button key={i} whileHover={!cell && !winner && isMyTurn ? { backgroundColor: "rgba(255,255,255,0.1)" } : {}} whileTap={!cell && !winner && isMyTurn ? { scale: 0.9 } : {}} onClick={() => handleClick(i)} className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-xl text-5xl relative ${!cell ? "bg-[#1f1f22]" : "bg-[#18181b] shadow-inner"} ${!isMyTurn && !winner ? "cursor-not-allowed opacity-50" : "cursor-pointer"} border border-white/5 transition-all duration-200`}>{cell && (<motion.span initial={{ scale: 0.5, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{cell}</motion.span>)}</motion.button>))}</div></div>
       <button onClick={handleReset} className="mt-8 text-xs text-neutral-500 hover:text-white transition flex items-center gap-2 border-b border-transparent hover:border-white pb-0.5 cursor-pointer"><Repeat size={12}/> {winner ? "Jogar Novamente" : "Reiniciar Jogo"}</button>
       <div className="mt-6 flex flex-col items-center"><p className="text-[10px] text-neutral-600 font-mono">ID: {socket?.id?.slice(0,4)}...</p><p className="text-[10px] font-bold text-neutral-500 mt-1">VOCÊ É: <span className={myRole === "X" ? "text-rose-500" : myRole === "O" ? "text-blue-500" : "text-gray-500"}>{myRole === "X" ? "JOGADOR 1 (AMOR)" : myRole === "O" ? "JOGADOR 2 (BEIJO)" : "ESPECTADOR"}</span></p></div>
    </div>
  );
}