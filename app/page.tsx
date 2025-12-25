// app/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Padrão de Corações (Fundo) ---
const HeartPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="heart-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path 
          d="M30 42 C 30 42 22 36 22 32 C 22 28 26 26 29 29 C 32 32 30 42 30 42 Z" 
          fill="white" transform="scale(1.5)" className="opacity-50"
        />
        <path 
          d="M30 42 C 30 42 38 36 38 32 C 38 28 34 26 31 29 C 28 32 30 42 30 42" 
          fill="white" transform="scale(1.5)" className="opacity-50"
        />
        <path 
           d="M30 50 L 27.2 47.4 C 17.2 38.4 10.6 32.4 10.6 25.1 C 10.6 19.1 15.3 14.6 21.3 14.6 C 24.7 14.6 27.9 16.2 30 18.6 C 32.1 16.2 35.3 14.6 38.7 14.6 C 44.7 14.6 49.4 19.1 49.4 25.1 C 49.4 32.4 42.8 38.4 32.8 47.4 L 30 50 Z" 
           fill="currentColor" transform="translate(0, 0) scale(0.5) translate(30, 30)" className="text-white"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#heart-pattern)" />
  </svg>
);

export default function Home() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const OUR_DATE = "1704"; // 🔐 Sua senha aqui

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === OUR_DATE) {
      document.body.style.overflow = 'hidden'; 
      router.push("/nosso-site/"); 
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden selection:bg-rose-500 selection:text-white relative">
      
      {/* FUNDO GLOBAL */}
      <HeartPattern />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,_rgba(0,0,0,0),_rgba(0,0,0,1))] z-0 pointer-events-none" />

      {/* --- METADE ESQUERDA: FOTO --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="hidden lg:block absolute left-0 top-0 bottom-0 w-[58%] z-10"
        style={{
          clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
        }}
      >
        {/* MÁSCARA ESCURA SOBRE A IMAGEM */}
        <div className="absolute inset-0 bg-black/40 z-20" /> 

        {/* Mantenha o gradiente lateral para fusão perfeita se quiser, ou só a mascara acima já resolve */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40 z-10" />
        
        <img 
          src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2574&auto=format&fit=crop" 
          alt="Nós" 
          className="w-full h-full object-cover object-center grayscale-[10%]"
        />
      </motion.div>

      {/* --- LADO DIREITO: LOGIN --- */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[45%] flex flex-col items-center justify-center p-8 z-30">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-md w-full flex flex-col items-center space-y-14"
        >
          {/* LOGO */}
          <div className="text-center relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
              className="inline-block relative z-10 mb-4"
            >
              <div className="absolute inset-0 blur-xl bg-rose-600/30 rounded-full animate-pulse" />
              <Heart size={64} className="text-rose-500 fill-rose-500 relative drop-shadow-2xl" />
            </motion.div>
            
            <h1 className="font-serif text-6xl text-white tracking-tighter mb-2">
              Bem-vinda Amor
            </h1>
            <p className="text-neutral-500 font-sans tracking-[0.3em] text-xs uppercase opacity-70">
              ao nosso Amor 3.0 Online 
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleLogin} className="w-full max-w-sm relative group">
            <div className="relative flex items-center justify-center">
              <Lock className="absolute left-0 text-neutral-600 group-focus-within:text-rose-500 transition-colors duration-500" size={18} />
              
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" • • • • • • • "
                className="w-full bg-transparent py-4 pl-10 text-center text-xl text-white placeholder-neutral-700 outline-none font-serif tracking-[0.5em] z-10 transition-all focus:tracking-[0.8em]"
              />
              
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-neutral-800" />
              
              <div className="absolute bottom-0 left-0 h-[2px] bg-rose-600 w-0 transition-all duration-700 ease-in-out group-focus-within:w-full shadow-[0_0_15px_rgba(225,29,72,0.6)]" />
            </div>

            <div className="h-6 mt-3 text-center">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-rose-500 text-xs font-medium inline-flex items-center gap-2"
                  >
                    <Sparkles size={12} /> Tente lembrar a data correta...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* --- BOTÃO FINAL: ÍCONE VISÍVEL + EFEITO HOVER --- */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            className="group relative px-14 py-4 rounded-full border border-neutral-800 text-neutral-400 font-medium text-xs tracking-[0.2em] uppercase transition-all duration-500 overflow-hidden bg-transparent hover:border-rose-600 hover:text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.4)]"
          >
             {/* Fundo que aparece no hover */}
             <span className="absolute inset-0 w-full h-full bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out -z-10" />

             <span className="relative z-10 flex items-center justify-center gap-4">
                <span>Entrar</span>
                {/* Ícone visível sempre, move levemente no hover */}
                <ArrowRight 
                  size={16} 
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1" 
                />
             </span>
          </motion.button>
        </motion.div>
        
        {/* Footer removido */}

      </div>
    </div>
  );
}