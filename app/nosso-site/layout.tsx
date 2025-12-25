"use client";

import Navbar from "@/components/Navbar";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-rose-500 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* BACKGROUND (MANTIDO) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[#0a0a0a]" />
         <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-rose-700/10 rounded-full blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
         <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-indigo-800/10 rounded-full blur-[150px] opacity-30 animate-pulse" style={{ animationDuration: '10s' }} />
         <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
      </div>

      {/* 
          CORREÇÃO PRINCIPAL:
          Removemos pt-6, md:pt-28 etc.
          Agora o main ocupa tudo e o z-10 garante que fique sobre o fundo.
      */}
      <main className="relative z-10 w-full min-h-screen pb-32"> 
        {children}
      </main>

      <Navbar />
      
    </div>
  );
}