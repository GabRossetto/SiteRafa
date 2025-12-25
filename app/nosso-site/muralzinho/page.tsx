"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Camera, Loader2, Star, Heart, Cloud, Zap, Smile, Moon, AlertCircle, Trash2, PenTool, X, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TIPAGEM ---
interface Note {
  id: number;
  text?: string;
  image?: string;
  x: number;
  y: number;
  rotate: number;
  style: "yellow" | "pink" | "blue" | "white" | "polaroid";
  createdAt: number;
}

let socket: Socket;

// --- UTILS VISUAIS ---
const PushPin = ({ color = "red" }: { color?: "red" | "blue" | "gold" | "green" }) => {
  const pinColors = {
    red: "bg-red-600 border-red-800",
    blue: "bg-blue-600 border-blue-800",
    gold: "bg-yellow-500 border-yellow-700",
    green: "bg-green-600 border-green-800",
  };
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
       <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${pinColors[color]} border-b-2 shadow-sm relative z-20`}>
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/40 rounded-full" />
       </div>
       <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] md:w-[2px] h-3 bg-neutral-400 z-10 opacity-50" />
    </div>
  );
};

const BoardBackground = () => (
  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden select-none">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(circle, #fff 2px, transparent 2.5px)`, backgroundSize: "30px 30px" }} />
      <Star className="absolute top-32 left-10 text-white w-8 h-8 -rotate-12 opacity-50" />
      <Heart className="absolute bottom-40 left-[20%] text-rose-500 w-12 h-12 rotate-6 fill-rose-500/10 stroke-[1px]" />
      <Cloud className="absolute top-32 right-10 text-blue-200 w-20 h-20 opacity-20" />
      <div className="absolute top-[20%] right-[30%] text-5xl font-handwriting text-white/5 rotate-6 pointer-events-none">Love Note</div>
  </div>
);

export default function WallPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<"yellow" | "pink" | "blue" | "white">("yellow");
  
  const containerRef = useRef<HTMLDivElement>(null); 
  
  const [uploading, setUploading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [isMobileToolbarOpen, setIsMobileToolbarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const styles = [
    { id: "yellow", color: "#fef3c7" },
    { id: "pink",   color: "#fce7f3" },
    { id: "blue",   color: "#e0f2fe" },
    { id: "white",  color: "#ffffff" },
  ];

  // FIX HYDRATION
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // SOCKET
  useEffect(() => {
    // PREPARADO PARA O DEPLOY (Usa variável ou localhost)
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socket = io(url, { transports: ["websocket"] });
    
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("load_notes", (data) => setNotes(data));
    socket.on("receive_note", (newNote) => setNotes((prev) => [...prev, newNote]));
    socket.on("board_cleared", () => setNotes([]));
    
    socket.on("update_note_position", ({ id, x, y }) => {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    });

    return () => { socket.disconnect(); };
  }, []);

  const sendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const safeX = Math.random() * 20 + 40;
    const safeY = Math.random() * 20 + 40;
    socket.emit("new_note", { text: message, style: selectedStyle, x: safeX, y: safeY, rotate: (Math.random() * 10 - 5) });
    setMessage("");
    if(!isDesktop) setIsMobileToolbarOpen(false);
  };

  const handleDragEnd = (noteId: number, point: { x: number, y: number }) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = point.x - containerRect.left;
      const relativeY = point.y - containerRect.top;
      const percentX = (relativeX / containerRect.width) * 100;
      const percentY = (relativeY / containerRect.height) * 100;
      const safeX = Math.max(0, Math.min(percentX, 90));
      const safeY = Math.max(0, Math.min(percentY, 90));
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, x: safeX, y: safeY } : n));
      socket.emit("move_note", { id: noteId, x: safeX, y: safeY });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) {
         socket.emit("new_note", { 
            image: data.secure_url, style: "polaroid", 
            x: 45, y: 45, rotate: (Math.random() * 6 - 3) 
         });
      }
    } catch (err) { console.error(err); } 
    finally { setUploading(false); }
  };

  const confirmClear = () => { socket.emit("clear_board"); setShowClearModal(false); };

  return (
    <div className="fixed inset-0 z-0 w-full h-full bg-[#18181b] overflow-hidden flex flex-col items-center justify-center select-none">
      
      {/* 1. MURAL */}
      <div 
        ref={containerRef}
        className="w-full h-full relative overflow-hidden shadow-[inset_0_0_120px_rgba(0,0,0,0.8)] border-x-[0px] md:border-x-[12px] border-y-[0px] md:border-y-[12px] border-[#252525]"
      >
        <BoardBackground />

        {/* Status */}
        <div className="absolute top-24 md:top-6 left-6 z-40">
           <div className={`px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/5 flex items-center gap-2 transition-all shadow-sm ${isConnected ? "text-green-500/90" : "text-red-500/90"}`}>
               <Wifi size={10} />
               <span className="text-[8px] font-bold uppercase tracking-widest">{isConnected ? "ONLINE" : "OFFLINE"}</span>
           </div>
        </div>

        {/* Lixeira */}
        {notes.length > 0 && (
             <button onClick={() => setShowClearModal(true)} className="absolute top-24 md:top-6 right-6 text-white/30 hover:text-red-500 bg-black/20 hover:bg-black/50 p-2 rounded-full transition z-40 backdrop-blur-md">
                <Trash2 size={16}/>
             </button>
        )}

        <AnimatePresence>
          {notes.map((note) => (
            <MuralNote 
                key={note.id} 
                note={note} 
                containerRef={containerRef}
                onDragEndCallback={handleDragEnd}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 2. TOGGLE MOBILE */}
      {!isDesktop && !isMobileToolbarOpen && (
         <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsMobileToolbarOpen(true)} className="md:hidden absolute bottom-24 right-4 z-50 bg-rose-600 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(225,29,72,0.6)] active:scale-95 border-2 border-white/20">
             <PenTool size={20} fill="currentColor" />
         </motion.button>
      )}

      {/* 3. TOOLBAR */}
      <AnimatePresence>
        {(isMobileToolbarOpen || isDesktop) && (
            <motion.div 
               initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} 
               className="absolute z-50 w-[95%] max-w-lg bottom-24 md:bottom-8"
            >
                <form onSubmit={sendNote} className="bg-[#1e1e1e] border border-white/10 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center gap-2 relative ring-1 ring-white/5">
                    
                    {!isDesktop && (
                       <button type="button" onClick={() => setIsMobileToolbarOpen(false)} className="p-2 text-neutral-500 hover:text-white"><X size={18} /></button>
                    )}

                    <label className={`p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white cursor-pointer transition shrink-0 ${uploading && "opacity-50 pointer-events-none"}`}>
                        {uploading ? <Loader2 size={18} className="animate-spin"/> : <Camera size={18}/>}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading}/>
                    </label>

                    <div className="flex gap-1.5 shrink-0">
                        {styles.map((style) => (
                            <button key={style.id} type="button" onClick={() => setSelectedStyle(style.id as any)} 
                              className={`w-5 h-5 rounded-full ring-1 ring-black/30 transition-transform ${selectedStyle === style.id ? "scale-110 ring-2 ring-white z-10" : "opacity-60"}`} style={{ backgroundColor: style.color }} />
                        ))}
                    </div>

                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Recadinho..." className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-sm px-1 placeholder:text-neutral-600 font-medium" />

                    <button type="submit" disabled={!message.trim()} className="bg-rose-600 text-white p-2.5 rounded-xl hover:bg-rose-500 transition shrink-0 active:scale-90 disabled:opacity-50 disabled:bg-neutral-800"><Send size={16} className={message.trim() ? "fill-current" : ""} /></button>
                </form>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL LIMPEZA */}
      <AnimatePresence>
        {showClearModal && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#18181b] border border-white/10 p-6 rounded-2xl w-full max-w-xs text-center shadow-2xl relative">
                    <h3 className="text-white font-bold text-lg mb-4">Faxina no Mural?</h3>
                    <div className="flex gap-3">
                        <button onClick={() => setShowClearModal(false)} className="flex-1 py-2 text-neutral-300 font-bold text-xs uppercase bg-white/5 hover:bg-white/10 rounded-lg">Cancelar</button>
                        <button onClick={confirmClear} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg">Limpar</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MuralNote({ note, containerRef, onDragEndCallback }: { note: Note; containerRef: any, onDragEndCallback: Function }) {
  const getStyle = (style: string) => {
    switch (style) {
      case "yellow": return { bg: "bg-[#fff2cc]", text: "text-neutral-900", pin: "red" };
      case "pink":   return { bg: "bg-[#ffe3ec]", text: "text-rose-900",    pin: "gold" };
      case "blue":   return { bg: "bg-[#e0f4ff]", text: "text-blue-900",    pin: "blue" };
      case "white":  return { bg: "bg-[#f9f9f9]", text: "text-black",       pin: "green" };
      case "polaroid": return { bg: "bg-white", text: "text-black", pin: "red" };
      default:       return { bg: "bg-white", text: "text-black", pin: "red" };
    }
  };
  const { bg, text, pin } = getStyle(note.style);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.1}
      dragMomentum={false}
      initial={{ scale: 0, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1, rotate: note.rotate, x: 0, y: 0, top: `${note.y}%`, left: `${note.x}%` }}
      onDragEnd={(e, info) => { const container = document.querySelector("#mural-container") || containerRef.current; if(container) onDragEndCallback(note.id, info.point); }}
      whileHover={{ scale: 1.1, zIndex: 100, rotate: 0, cursor: "grab" }}
      whileDrag={{ scale: 1.2, zIndex: 100, cursor: "grabbing" }}
      className={`absolute shadow-[5px_5px_20px_rgba(0,0,0,0.5)] flex flex-col items-center cursor-pointer select-none border border-black/5 rounded-sm ${note.image ? "p-3 pb-8 w-32 md:w-56" : "p-4 w-32 min-h-[100px] md:w-56 md:min-h-[140px] justify-center"} ${bg} ${text}`}
    >
        <PushPin color={pin as any} />
        {note.image ? (
            <div className="w-full relative pointer-events-none">
               <div className="bg-[#111] aspect-[4/5] overflow-hidden border border-black/10 shadow-inner w-full h-full">
                  <img src={note.image} alt="Note" className="w-full h-full object-cover"/>
               </div>
               {note.text && <p className="text-center font-handwriting text-[9px] md:text-xs mt-2 opacity-80 leading-tight px-1 truncate w-full">{note.text}</p>}
            </div>
        ) : (
            <p className="font-handwriting text-center text-xs md:text-lg leading-snug break-words w-full relative top-1 drop-shadow-sm font-medium">{note.text}</p>
        )}
    </motion.div>
  );
}