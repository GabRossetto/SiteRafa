"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

interface EnvelopeProps {
  letter: {
    id: string;
    title: string;
    content: string;
    sender: string;
    createdAt: string;
  };
}

export default function Envelope({ letter }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* O ENVELOPE FECHADO (CLICÁVEL) */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer relative w-full h-40 bg-rose-100 rounded-lg shadow-xl flex items-center justify-center border-2 border-rose-200"
      >
        {/* Tampa do envelope (triângulo visual CSS) */}
        <div className="absolute top-0 w-0 h-0 border-l-[100px] border-r-[100px] border-t-[80px] border-l-transparent border-r-transparent border-t-rose-300 opacity-90 filter drop-shadow-sm" style={{ borderLeftWidth: '50%', borderRightWidth: '50%' }} />
        
        {/* Selo/Coração */}
        <div className="z-10 bg-rose-500 text-white rounded-full p-2 shadow-sm">
          <span className="text-xl">💌</span>
        </div>
        
        <div className="absolute bottom-4 font-serif text-rose-800 font-bold px-4 text-center w-full truncate">
          Para: Rafaela
          <br/>
          <span className="text-xs font-sans font-normal opacity-70">De: {letter.sender}</span>
        </div>
      </motion.div>

      {/* O MODAL DE LEITURA (ABRE NA TELA TODA) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#fffdf7] text-slate-800 w-full max-w-lg p-8 rounded-sm shadow-2xl relative max-h-[80vh] overflow-y-auto"
            style={{ 
              backgroundImage: "linear-gradient(#e5e5e5 1px, transparent 1px)", // Linhas de caderno
              backgroundSize: "20px 20px" 
            }}
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
            >
              <X />
            </button>

            <h2 className="text-3xl font-serif text-rose-900 mb-6 font-bold">{letter.title}</h2>
            
            <p className="font-serif text-lg leading-loose whitespace-pre-line text-slate-700">
              {letter.content}
            </p>

            <div className="mt-8 text-right font-bold text-rose-400 text-sm italic">
              — Com amor, {letter.sender}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}