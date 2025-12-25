"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Heart, Brain, Ghost, Bird, X, Play, Users, Bomb, Grid3x3 } from "lucide-react";
import { io, Socket } from "socket.io-client";

// Importe dos Jogos
import SnakeGame from "@/components/games/Snake";
import TicTacToe from "@/components/games/TicTacToe";
import QuizGame from "@/components/games/Quiz";
import FlappyLove from "@/components/games/FlappyLove";
import Minesweeper from "@/components/games/Minesweeper";
import MemoryGame from "@/components/games/Memory"; 

// Helper: Fita Adesiva
const Tape = ({ className, rotate = "rotate-0", color = "bg-white/10" }: any) => (
  <div className={`absolute h-6 w-20 ${color} backdrop-blur-md shadow-sm z-30 ${rotate} ${className}`} 
       style={{ clipPath: "polygon(5% 0, 95% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 5% 80%, 0 70%, 5% 60%, 0 50%, 5% 40%, 0 30%, 5% 20%, 0 10%)" }}
  />
);

export default function GameHubPage() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [mainSocket, setMainSocket] = useState<Socket | null>(null);

  // CONFIG DOS CARDS DOS JOGOS
  const games = [
    { 
        id: "tictac", title: "Velha do Amor", desc: "Online: Disputa X vs O", 
        icon: Heart, color: "bg-[#ff9aa2]", tapeColor: "bg-red-400/30",
        multiplayer: true
    },
    { 
        id: "memory", title: "Par Perfeito", desc: "Online: Memória em dupla", 
        icon: Grid3x3, color: "bg-[#e2f0cb]", tapeColor: "bg-green-400/30",
        multiplayer: true
    },
    { 
        id: "quiz", title: "Quiz Casal", desc: "Teste seu conhecimento", 
        icon: Brain, color: "bg-[#c7ceea]", tapeColor: "bg-blue-400/30"
    },
    { 
        id: "snake", title: "Snake Love", desc: "Colete os corações", 
        icon: Ghost, color: "bg-[#b5ead7]", tapeColor: "bg-emerald-400/30" 
    },
    { 
        id: "bomb", title: "Campo do Amor", desc: "Desvie das bombas", 
        icon: Bomb, color: "bg-[#e0e0e0]", tapeColor: "bg-gray-400/30" 
    },
    { 
        id: "flappy", title: "Flappy Cupid", desc: "Voe pelo caminho", 
        icon: Bird, color: "bg-[#ffdac1]", tapeColor: "bg-orange-400/30" 
    },
      { 
        id: "flappy", title: "Flappy Cupid", desc: "Voe pelo caminho", 
        icon: Bird, color: "bg-[#ffdac1]", tapeColor: "bg-orange-400/30" 
    },
  ];

  const renderGameComponent = () => {
    switch (activeGameId) {
      case "tictac": return mainSocket && <TicTacToe socket={mainSocket} />;
      case "memory": return mainSocket && <MemoryGame socket={mainSocket} />;
      case "snake":  return <SnakeGame />;
      case "quiz":   return <QuizGame />;
      case "flappy": return <FlappyLove />;
      case "bomb":   return <Minesweeper />;
      default: return null;
    }
  };

  const selectedGameInfo = games.find(g => g.id === activeGameId);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", { transports: ["websocket"] });
    setMainSocket(socket);

    socket.on("connect", () => socket.emit("ask_status"));
    socket.on("user_count", (count: number) => {
        setConnectedUsers(count);
        setPartnerOnline(count >= 2);
    });

    return () => { socket.disconnect(); }
  }, []);

  return (
    // SCROLL GLOBAL
    <div className={`
        w-full overflow-x-hidden min-h-screen pb-40
        [&::-webkit-scrollbar]:w-2 
        [&::-webkit-scrollbar-track]:bg-[#0a0a0a] 
        [&::-webkit-scrollbar-thumb]:bg-[#e11d48] 
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-[#be123c]
    `}>
      
      {/* 
          1. HERO - ESTILO PADRONIZADO (W-FULL TOP-0)
      */}
      <div className="relative w-full h-[60vh] top-0 shadow-2xl bg-neutral-900">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60 z-20" />
        
        {/* FOTO GAMER */}
        <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670" 
            className="w-full h-full object-cover animate-in fade-in duration-1000" 
            alt="Arcade Banner"
        />
        
        <div className="absolute bottom-16 left-6 md:left-20 z-30 max-w-6xl px-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-rose-500/50 bg-rose-500/10 rounded-full text-[10px] font-bold tracking-[0.2em] text-rose-300 uppercase shadow-lg backdrop-blur-md">
               <Gamepad2 size={12} className="text-purple-300" /> Game Hub
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-white leading-tight drop-shadow-2xl">
               Playground.
            </h1>
        </div>
      </div>

      {/* 2. PLACA DE STATUS (ONLINE/OFFLINE) */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 mb-16 relative z-40 flex justify-end">
          <motion.div 
            initial={{ rotate: 2 }} animate={{ rotate: 2 }} 
            className={`
                p-4 pb-8 w-64 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6)] transform rotate-2 relative border transition-colors duration-500 
                ${partnerOnline ? "bg-[#eafff1] border-green-200" : "bg-[#f5f5f5] border-neutral-300"}
            `}
            style={{ clipPath: "polygon(2% 0, 98% 0, 100% 100%, 95% 98%, 90% 100%, 85% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 0 100%)"}}
          >
             <Tape className="-top-3 right-[40%] -rotate-2" color={partnerOnline ? "bg-green-600/20" : "bg-neutral-600/10"} />
             <div className="flex items-center gap-4">
                <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${partnerOnline ? "bg-green-500" : "bg-red-400"}`} />
                    {partnerOnline && <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-500">{partnerOnline ? `Online (${connectedUsers})` : "Só Você..."}</span>
                    <span className={`font-handwriting text-xl font-bold leading-none ${partnerOnline ? "text-green-700" : "text-neutral-400"}`}>{partnerOnline ? "Ela tá On!" : "Offline"}</span>
                </div>
             </div>
          </motion.div>
      </div>

      {/* 3. GRID CENTRALIZADO */}
      <div className="max-w-7xl mx-auto px-4 pb-20 relative z-20">
         <div className="flex flex-wrap justify-center gap-8">
            {games.map((game, i) => (
               <motion.div
                 key={game.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
                 onClick={() => setActiveGameId(game.id)}
                 // Cards de 300px min e layout flexivel
                 className={`
                    relative group cursor-pointer bg-[#161616] border border-[#252525] rounded-xl overflow-hidden hover:border-white/20 hover:shadow-[0_20px_50px_rgba(225,29,72,0.15)] transition-all duration-300 w-full md:w-[45%] lg:w-[30%]
                    ${i % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0
                 `}
               >
                  <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-1" color={game.tapeColor} />
                  
                  {/* Cabeçalho do Card */}
                  <div className={`h-40 ${game.color} relative p-6 flex flex-col justify-between overflow-hidden`}>
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-40 mix-blend-multiply"/>
                      
                      <div className="relative z-10 flex justify-between items-start">
                          <div className="p-3 bg-white/40 rounded-2xl backdrop-blur-md shadow-sm border border-white/20">
                             <game.icon className="text-neutral-900" size={32} />
                          </div>
                          {game.multiplayer && (
                              <span className="bg-black/20 text-black px-2 py-1 rounded text-[9px] font-bold uppercase backdrop-blur-sm flex items-center gap-1">
                                  <Users size={10} /> Online
                              </span>
                          )}
                      </div>
                      
                      {/* Decoração Fundo */}
                      <game.icon className="absolute -bottom-6 -right-6 text-black/10 w-48 h-48 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-6 bg-[#181818] border-t border-white/5">
                     <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-rose-400 transition-colors">{game.title}</h3>
                     <p className="text-neutral-500 text-sm font-medium">{game.desc}</p>
                     
                     <div className="mt-6 flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-widest group-hover:underline decoration-rose-500 underline-offset-4">
                        <Play size={12} fill="currentColor" /> Jogar Agora
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/* 4. MODAL DO JOGO (FULLSCREEN OVERLAY) */}
      <AnimatePresence>
        {activeGameId && selectedGameInfo && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-md flex items-center justify-center p-2 md:p-8"
           >
              {/* Clicar fora fecha */}
              <div className="absolute inset-0 z-0" onClick={() => setActiveGameId(null)} />

              {/* Caixa do Jogo */}
              <motion.div 
                 initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                 className="relative z-10 bg-[#121212] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
              >
                 <div className={`h-20 ${selectedGameInfo.color} p-6 flex items-center justify-between shrink-0 relative overflow-hidden border-b border-white/10`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pixels.png')]" />
                    <div className="flex items-center gap-4 relative z-10 text-neutral-900">
                        <div className="p-2 bg-white/30 rounded-lg backdrop-blur"><selectedGameInfo.icon className="w-5 h-5" /></div>
                        <div>
                           <span className="font-serif text-xl font-bold tracking-wide block">{selectedGameInfo.title}</span>
                           {selectedGameInfo.multiplayer && <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">Multijogador</span>}
                        </div>
                    </div>
                    <button onClick={() => setActiveGameId(null)} className="bg-black/10 hover:bg-black/30 text-black p-2 rounded-full transition z-10"><X size={20}/></button>
                 </div>

                 {/* Scroll do Container do Jogo (Se precisar) */}
                 <div className={`
                    flex-1 bg-[#0f0f0f] relative overflow-y-auto overflow-x-hidden flex items-center justify-center p-4
                    [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0f0f0f] 
                    [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#555]
                 `}>
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center min-h-[500px]">
                        <div className="absolute inset-0 pointer-events-none opacity-5" style={{backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px"}}/>
                        {renderGameComponent()}
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}