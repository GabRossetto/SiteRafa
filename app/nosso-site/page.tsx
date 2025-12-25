"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Ticket, Paperclip, Heart, Star, Camera, Smile, Cloud, Sparkles, Sun, Moon, Zap, Music } from "lucide-react";

// --- 1. HOOK DE TEMPO ---
function useTimeTogether() {
  const [time, setTime] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 🗓️ DATA: 17 de Abril de 2024
    const startDate = new Date("2024-04-17T00:00:00");
    const timer = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      setTime({
        years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365)),
        months: Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)),
        days: Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

const Tape = ({ className, rotate = "rotate-0", color = "bg-white/20" }: { className?: string, rotate?: string, color?: string }) => (
  <div className={`absolute h-8 w-24 ${color} backdrop-blur-[2px] shadow-sm z-30 border-l border-r border-white/10 ${rotate} ${className}`} 
       style={{ clipPath: "polygon(5% 0, 95% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 5% 80%, 0 70%, 5% 60%, 0 50%, 5% 40%, 0 30%, 5% 20%, 0 10%)" }}
  />
);

const CounterCard = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center justify-center bg-[#111] border border-[#222] rounded-lg shadow-2xl relative group h-[110px] w-full hover:-translate-y-1 transition-all">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <span className="font-serif text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tighter">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[10px] text-neutral-500 font-sans font-bold uppercase tracking-widest mt-1 group-hover:text-rose-500 transition-colors">
      {label}
    </span>
  </div>
);

// Camada de Stickers do Fundo
const StickerBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <Star className="absolute top-10 left-[15%] text-white w-4 h-4 animate-pulse" />
      <div className="absolute top-20 left-10 font-handwriting text-white/20 text-xl -rotate-12">xoxo</div>
      <Sparkles className="absolute top-40 left-6 text-yellow-200 w-6 h-6 opacity-60" />
      <Cloud className="absolute top-12 right-[20%] text-blue-200 w-10 h-10 opacity-40" />
      <div className="absolute top-24 right-4 w-3 h-3 rounded-full bg-rose-500/50" />
      <Sun className="absolute top-1/2 left-2 text-yellow-500/40 w-8 h-8 rotate-45" />
      <Moon className="absolute top-[45%] right-2 text-indigo-400/40 w-6 h-6 -rotate-12" />
      <Heart className="absolute bottom-32 left-[15%] text-rose-500 w-8 h-8 rotate-12 fill-rose-500/20" />
      <Smile className="absolute bottom-20 right-[15%] text-green-300 w-8 h-8 -rotate-12 opacity-50" />
      <Zap className="absolute bottom-6 left-[40%] text-yellow-400 w-6 h-6 rotate-12 opacity-40" />
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
  </div>
);

export default function DashboardHome() {
  const time = useTimeTogether();

  return (
    <div className="w-full relative z-10 pb-0 max-w-7xl mx-auto px-2 md:px-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-thumb]:bg-rose-900 [&::-webkit-scrollbar-thumb]:rounded-full">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none bg-[#0a0a0a]">
         <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-rose-700/10 rounded-full blur-[120px] opacity-70"/>
         <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-800/10 rounded-full blur-[120px] opacity-60"/>
      </div>

      {/* 
          ================= HERO ================= 
          Ajuste feito: Adicionado `pt-32 md:pt-48` para criar espaço no topo 
          já que removemos o padding global.
      */}
      <div className="flex flex-col xl:flex-row gap-16 min-h-[70vh] items-center justify-center border-b border-neutral-900 mb-20 px-2 pt-32 md:pt-48 pb-20">
        <div className="w-full xl:w-1/2">
           <div className="text-center xl:text-left mb-8">
              <span className="inline-block px-3 py-1 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20 text-[10px] font-bold tracking-[0.2em] mb-4">
                 INÍCIO: 17.04.2024
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-white leading-[1.1]">
                 Cronologia do <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-rose-600">Nosso Amor.</span>
              </h1>
           </div>
           <div className="grid grid-cols-3 gap-3 w-full">
              <CounterCard value={time.years} label="Anos" />
              <CounterCard value={time.months} label="Meses" />
              <CounterCard value={time.days} label="Dias" />
              <CounterCard value={time.hours} label="Hrs" />
              <CounterCard value={time.minutes} label="Min" />
              <CounterCard value={time.seconds} label="Seg" />
           </div>
        </div>
        
        {/* Foto ao lado do contador */}
        <div className="w-full xl:w-1/2 flex justify-center mt-8 xl:mt-0">
           <motion.div initial={{ rotate: 2 }} whileHover={{ rotate: 0 }} className="relative bg-white p-2 pb-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] w-full max-w-xl">
              <Tape className="-top-3 right-1/2 bg-rose-100/40 rotate-12" />
              <div className="aspect-[16/10] bg-neutral-100 w-full overflow-hidden border border-neutral-200">
                 {/* Substitua pela foto oficial de vocês */}
                 <img src="/img1.jpg" className="w-full h-full object-cover filter contrast-[0.9]" alt="Hero" />
              </div>
              <div className="absolute bottom-5 right-6 flex items-center gap-2 text-neutral-400">
                 <Camera size={14} /> <span className="font-mono text-[10px]">O Início do AMOR 3.0</span>
              </div>
           </motion.div>
        </div>
      </div>

         {/* ================= O MURAL ================= */}
         <div className="my-28 relative">

            <h2 className="text-center font-serif text-4xl md:text-5xl text-white mb-20 leading-[1.1]">
               <span className="italic text-neutral-500">Coleção de</span> <br />
               Momentos.
            </h2>

            <div className="relative w-full h-[850px] md:h-[700px] bg-[#1a1a1a] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-8 border-[#2e2e2e] overflow-hidden group">
               <StickerBackground />

               {/* 1. NOTA AMARELA */}
               <motion.div whileHover={{ scale: 1.05, zIndex: 60 }}
                  className="absolute top-[5%] left-[5%] w-[55%] md:w-64 bg-[#fffbe6] p-0 shadow-lg -rotate-3 z-20 border border-yellow-200/50"
               >
                  <Tape className="-top-3 left-8 -rotate-2 bg-yellow-200/40" />
                  <div className="p-4 md:p-6 pt-6 md:pt-8 font-handwriting text-blue-900 text-sm md:text-lg leading-6 md:leading-8 min-h-[140px]"
                     style={{ backgroundImage: "linear-gradient(transparent, transparent 31px, #add8e6 31px)", backgroundSize: "100% 32px" }}>
                     "Amar não é sobre sentimento. E sobre fazer aquilo mesmo quando não há nada em troca"
                     <div className="text-right font-bold text-xs mt-6 text-neutral-500">- Teu Amor</div>
                  </div>
               </motion.div>

               {/* 2. PLAYLIST */}
               <motion.div whileHover={{ scale: 1.02, zIndex: 60 }}
                  className="absolute top-[18%] md:top-[5%] right-[-5%] md:right-[5%] w-[65%] md:w-80 bg-[#121212] border border-[#333] p-4 rounded-2xl shadow-2xl rotate-3 z-30"
               >
                  <Tape className="-top-3 left-1/2 -rotate-1 bg-white/10" />
                  <div className="flex gap-3 md:gap-5 items-center">
                     <div className="w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden shadow-inner flex-shrink-0 bg-neutral-800">
                        <img src="/fotoplaylist.png" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-wide mb-0.5">Garrafinha 💖💕🤭</p>
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight truncate">Vilarejo</h3>
                        <p className="text-neutral-400 text-xs">Tribalistas</p>
                     </div>
                  </div>
               </motion.div>

               {/* 3. FOTO CENTRAL (Ajustado para Centralização Perfeita no Mobile) */}
               <motion.div whileHover={{ scale: 1.05, rotate: 0, zIndex: 100 }}
                  className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[65%] md:w-80 bg-white p-3 pb-10 md:pb-12 shadow-[0_0_30px_rgba(0,0,0,0.5)] rotate-[-2deg] z-50 md:z-40"
               >
                  <Tape className="-top-3 right-10 rotate-2 bg-rose-200/50" />
                  <div className="bg-neutral-800 w-full aspect-square overflow-hidden border border-neutral-200">
                     <img src="/fotoinicio.jpeg" className="w-full h-full object-cover hover:scale-110 transition duration-500" />
                  </div>
                  <div className="absolute bottom-3 left-0 w-full text-center">
                     <p className="font-handwriting text-lg text-neutral-800 font-bold">Nós. 🖤</p>
                  </div>
               </motion.div>

               {/* 4. TICKET */}
               <motion.div whileHover={{ rotate: 5, zIndex: 60 }}
                  className="absolute bottom-[22%] md:bottom-[5%] left-[-2%] md:left-[5%] w-[60%] md:w-72 h-24 md:h-32 bg-[#ff5e57] text-white shadow-xl rotate-6 z-20 flex border-[3px] border-white/20"
               >
                  <div className="w-10 md:w-12 border-r-[3px] border-dashed border-black/10 relative flex items-center justify-center bg-black/10">
                     <span className="text-[8px] md:text-[10px] -rotate-90 font-bold tracking-widest whitespace-nowrap opacity-60">PARA SEMPRE</span>
                  </div>
                  <div className="flex-1 p-2 flex flex-col justify-center items-center relative overflow-hidden">
                     <Heart className="absolute -bottom-4 -right-4 w-16 h-16 text-white opacity-20 rotate-12" />
                     <span className="text-[10px] uppercase font-bold text-red-200 tracking-[0.2em] mb-0.5">Cupom Infinito</span>
                     <span className="font-serif text-2xl md:text-3xl font-bold leading-none text-center drop-shadow-md">VALE <br /> 1 BEIJO</span>
                  </div>
                  <div className="w-8 md:w-10 border-l-[3px] border-dashed border-black/10 flex items-center justify-center relative">
                     <Ticket className="rotate-90 opacity-80" />
                  </div>
               </motion.div>

               {/* 5. MAPA */}
               <motion.div whileHover={{ scale: 1.05, rotate: 0, zIndex: 60 }}
                  className="absolute bottom-[4%] md:bottom-[5%] right-[5%] md:right-[5%] w-[45%] md:w-56 aspect-square bg-white p-2 shadow-2xl rotate-[-4deg] z-20 border border-neutral-300"
               >
                  <Tape className="-top-3 md:-top-4 right-6 rotate-90 w-12 md:w-16 bg-blue-100/40" />
                  <div className="w-full h-full bg-blue-50 overflow-hidden relative border border-neutral-200">
                     <div className="absolute top-0 right-0 w-full h-full bg-[#e6e2d3]" />
                     <div className="absolute top-[20%] left-0 w-full h-[20px] bg-[#9bbd83] rotate-12" />
                     <div className="absolute bottom-[30%] right-[20%] w-[100px] h-[100px] bg-[#aadaff] rounded-full opacity-60" />
                     <div className="absolute top-0 bottom-0 left-[40%] w-4 bg-white border-l border-r border-white" />
                     <div className="absolute top-[35%] left-[45%] flex flex-col items-center animate-bounce">
                        <MapPin size={28} className="text-red-600 drop-shadow-lg fill-red-600" />
                     </div>
                     <div className="absolute bottom-2 left-1 right-1 md:left-2 md:right-2 bg-white/95 backdrop-blur px-1 py-1 text-center shadow-sm border border-black/5">
                        <p className="text-[8px] md:text-[9px] font-bold uppercase text-neutral-500">Localização do 1 Encontro</p>
                        <p className="text-[10px] md:text-xs font-serif font-bold text-blue-900 leading-tight">Bosque do Povo<br />SCS</p>
                     </div>
                  </div>
               </motion.div>

            </div>
         </div>

         {/* ================= O VARAL ESPAÇOSO ================= */}
         <div className="relative mt-24 mb-32 w-full h-64 md:h-72 flex justify-center items-center">

            <div className="absolute top-4 left-[-10%] right-[-10%] h-20 pointer-events-none z-0">
               <svg width="100%" height="100%" viewBox="0 0 1000 50" preserveAspectRatio="none">
                  <path d="M 0 10 Q 500 50 1000 10" fill="transparent" stroke="#505050" strokeWidth="2" />
               </svg>
            </div>

            {/* Fotos com espaçamento MAIOR (gap-16) no mobile e desktop */}
            <div className="relative w-full max-w-[110vw] md:max-w-4xl h-full flex justify-center items-start pt-12 md:pt-16 gap-8 md:gap-16">

               <motion.div initial={{ rotate: 2 }} whileHover={{ scale: 1.1, zIndex: 50, rotate: 0 }} className="relative group shrink-0 w-28 md:w-44 origin-top cursor-grab active:cursor-grabbing">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-neutral-300"> <Paperclip className="w-5 h-5 md:w-8 md:h-8 rotate-45" /> </div>
                  <div className="bg-white p-2 pb-6 md:p-3 md:pb-10 shadow-lg w-full transition-all">
                     <div className="bg-neutral-800 aspect-[3/4]"><img src="/varal1.jpeg" className="w-full h-full object-cover" /></div>
                  </div>
               </motion.div>

               <motion.div initial={{ rotate: -1.5 }} whileHover={{ scale: 1.1, zIndex: 50, rotate: 0 }} className="relative group shrink-0 w-28 md:w-44 origin-top mt-3 md:mt-4 cursor-grab active:cursor-grabbing">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-neutral-300"> <Paperclip className="w-5 h-5 md:w-8 md:h-8 -rotate-12" /> </div>
                  <div className="bg-white p-2 pb-6 md:p-3 md:pb-10 shadow-lg w-full transition-all">
                     <div className="bg-neutral-800 aspect-[3/4]"><img src="/varal2.jpeg" className="w-full h-full object-cover" /></div>
                  </div>
               </motion.div>

               <motion.div initial={{ rotate: 3 }} whileHover={{ scale: 1.1, zIndex: 50, rotate: 0 }} className="relative group shrink-0 w-28 md:w-44 origin-top cursor-grab active:cursor-grabbing">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-neutral-300"> <Paperclip className="w-5 h-5 md:w-8 md:h-8 rotate-45" /> </div>
                  <div className="bg-white p-2 pb-6 md:p-3 md:pb-10 shadow-lg w-full transition-all">
                     <div className="bg-neutral-800 aspect-[3/4]"><img src="/varal3.jpg" className="w-full h-full object-cover" /></div>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* ================= CARTA ================= */}
         <div className="mt-16 flex justify-center w-full px-2 mb-32">
            <div className="bg-[#fcfbf9] w-full max-w-3xl min-h-[600px] p-8 md:p-16 relative shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-[#dedbce] z-10">

               <div
                  className="absolute inset-0 pointer-events-none opacity-50 top-[100px] bottom-[80px] left-8 right-8"
                  style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 29px, #a3b8d6 30px)" }}
               />

               <Tape className="-top-4 left-1/2 -translate-x-1/2 bg-rose-200/50" />
               <div className="flex justify-between items-end border-b-2 border-neutral-200 pb-4 mb-10 mt-4">
                  <div>
                     <span className="font-serif text-rose-600 font-bold text-xs tracking-[0.2em] block mb-1">DE: MOMO</span>
                     <span className="font-serif text-neutral-400 font-bold text-xs tracking-[0.2em] block">PARA: A MINHA RAFA</span>
                  </div>
                  <div className="bg-rose-100 p-2 rounded-full"><Heart className="text-rose-400 w-6 h-6 fill-rose-200" /></div>
               </div>

               <div className="font-serif text-neutral-800 text-lg md:text-xl leading-[30px] space-y-6">
                  <p>
                     Rafa, meu amor. <br />
                     Eu fiz esse presente porque queria te dar algo que tivesse sentido de verdade. Não é só por ser Natal, é porque você é importante pra mim e eu queria que isso ficasse claro.
                     Rafa, estar com você mudou muita coisa no meu jeito de ver os dias. As conversas longas, as risadas sem motivo, até os momentos simples ganharam outro peso desde que você está aqui. Nada disso é exagero ou frase pronta, é só o que acontece quando você faz parte da minha vida.

                  </p>
                  <p>
                
                     Esse presente não tenta ser perfeito, assim como a gente também não é e ainda assim funciona. Ele é só um pedaço do que sinto, colocado aqui do jeito mais sincero que eu consegui.
                     Que esse Natal seja mais um capítulo nosso, do jeito que a gente é certo ou errado, leve e cheio de coisas que só a gente entende kakak. 
                  </p>
                  <p>
                     Obrigado por ser você amor, E por lutar sempre. <br />
                     Eu Te Amo. 🫶🏻❤️
                  </p>
               </div>

               <div className="absolute bottom-16 right-16">

               </div>
            </div>
         </div>

         {/* ================= FOOTER ================= */}
         <footer className="w-full text-center py-10 mt-[-50px] relative z-0">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f0f0f] rounded-full border border-neutral-800 text-neutral-500 text-[10px] tracking-[0.3em] uppercase shadow-lg hover:border-rose-900/50 transition-colors cursor-default">
               FEITO COM
               <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" />
               PRA VOCÊ AMOR
            </div>
         </footer>

      </div>
   );
}