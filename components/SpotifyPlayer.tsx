"use client";

import { motion } from "framer-motion";

const Tape = ({ className }: { className?: string }) => (
  <div className={`absolute h-8 w-28 bg-white/10 backdrop-blur-md shadow-sm z-30 border-l border-r border-white/5 ${className}`} 
       style={{ clipPath: "polygon(5% 0, 95% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 5% 80%, 0 70%, 5% 60%, 0 50%, 5% 40%, 0 30%, 5% 20%, 0 10%)" }}
  />
);

export default function SpotifyPlayer() {
  // ⚠️ Link da sua playlist oficial
  const playlistUrl = "https://open.spotify.com/embed/playlist/0Ph1fZbp8WZ6FBqSG5yDTE?utm_source=generator"; 

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative w-full max-w-4xl mx-auto mb-16"
    >
      {/* Elementos Decorativos */}
      <Tape className="-top-4 left-1/2 -translate-x-1/2 bg-green-200/20 rotate-2" />
      <Tape className="-bottom-4 right-10 bg-rose-200/20 -rotate-2" />
      
      {/* O Player com estilo 'Glass' */}
      <div className="bg-[#121212] rounded-3xl p-6 md:p-8 border border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        
        {/* Brilho de fundo */}
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-green-900/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-green-800/30 transition-colors duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1 w-full">
                <h3 className="text-white font-serif text-2xl mb-2 flex items-center gap-2">
                    <span className="text-green-500 text-3xl">♪</span> Nossa Trilha Sonora
                </h3>
                <p className="text-neutral-400 text-xs mb-6 max-w-md">
                    Músicas que de alguma forma tem algum sentido, ou só gostamos mesmo.
                </p>
                
                <iframe
                    style={{ borderRadius: 16 }}
                    src={playlistUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="shadow-xl"
                />
            </div>
        </div>
      </div>
    </motion.div>
  );
}