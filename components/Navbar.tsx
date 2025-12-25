"use client";

import { motion } from "framer-motion";
import { Image, Music, Heart, MessageSquare, Gamepad2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useState, useRef } from "react";

const menuItems = [
  { icon: Image, label: "Galeria", href: "/nosso-site/fotinhas" }, 
  { icon: Music, label: "Cinema", href: "/nosso-site/cineminha" },
  { icon: Heart, label: "Cartas", href: "/nosso-site/cartinhas" },
  { icon: MessageSquare, label: "Mural", href: "/nosso-site/muralzinho" },
  { icon: Gamepad2, label: "Jogos", href: "/nosso-site/joguinhos" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerEasterEgg = (e: React.MouseEvent<HTMLDivElement>) => {
    router.push("/nosso-site");

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 70,
      origin: { x, y },
      colors: ['#e11d48', '#ffffff'],
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      scalar: 1.5
    });

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/us.mp3"); 
        audioRef.current.volume = 0.6;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log(err));

      setTimeout(() => setIsPlaying(false), 2000);
    } catch (error) { console.error(error); }
  };

  return (
    <div className={`
      fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300
      w-[96%] md:w-auto md:max-w-none
      
      /* --- MUDANÇA AQUI: Mobile embaixo / Desktop em cima --- */
      bottom-3 md:bottom-auto md:top-6
    `}>
      <motion.nav 
        layout
        className="flex items-center justify-between p-1.5 md:p-2 bg-[#0F0F0F]/90 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-full shadow-2xl shadow-black/80 ring-1 ring-white/5"
      >
        {/* BOTÃO HOME */}
        <div 
          onClick={triggerEasterEgg}
          className="cursor-pointer shrink-0 py-2.5 px-4 md:px-5 md:py-3 md:mr-2 bg-white/5 active:bg-rose-500/20 rounded-xl md:rounded-full border border-white/5 transition-all active:scale-95 group relative overflow-hidden"
        >
          {isPlaying && <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />}
          <div className="flex items-center justify-center gap-1.5 font-serif tracking-widest text-white">
            <span className="hidden md:inline text-sm group-hover:text-rose-200 transition-colors">Rafa</span>
            <Heart size={20}className={`text-rose-500 fill-rose-500 transition-transform ${isPlaying ? "scale-125 animate-ping" : "scale-100 group-hover:scale-110"}`} />
            <span className="hidden md:inline text-sm group-hover:text-rose-200 transition-colors">Gab</span>
          </div>
        </div>

        <div className="hidden md:block w-[1px] h-6 bg-white/10" />

        {/* ÍCONES */}
        <div className="flex-1 flex items-center justify-between gap-1 px-1 md:gap-1 md:px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative flex-1 flex justify-center group">
                <div className={`relative flex items-center justify-center p-2.5 md:px-5 md:py-2.5 rounded-xl md:rounded-full transition-all duration-300 w-full md:w-auto ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-300 ${isActive ? "text-rose-500" : "text-neutral-500 group-hover:text-neutral-300"}`} />
                  <span className={`hidden md:block text-sm font-medium ml-2 ${isActive ? "text-white" : "text-neutral-400"}`}>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* SAIR */}
        <div className="border-l border-white/10 ml-1 pl-1 md:ml-2 md:pl-2">
            <Link href="/" className="flex items-center justify-center p-2.5 text-neutral-600 hover:text-red-400 transition-colors rounded-xl active:bg-white/5 group">
                <LogOut size={20} className="group-hover:scale-110 transition-transform" /> 
            </Link>
        </div>
      </motion.nav>
    </div>
  );
}