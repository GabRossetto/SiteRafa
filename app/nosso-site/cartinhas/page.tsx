"use client";

import { useState, useEffect } from "react";
import { Mail, PenTool, X, Heart, Loader2, Send, Calendar, User, ArrowDownUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Letter {
  id: string;
  title: string;
  content: string;
  sender: string; 
  createdAt: string;
}

const Tape = ({ className, rotate = "rotate-0", color = "bg-rose-200/30" }: { className?: string, rotate?: string, color?: string }) => (
  <div className={`absolute h-8 w-24 ${color} backdrop-blur-[2px] shadow-sm z-30 border-l border-r border-white/10 ${rotate} ${className}`} 
       style={{ clipPath: "polygon(5% 0, 95% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 5% 80%, 0 70%, 5% 60%, 0 50%, 5% 40%, 0 30%, 5% 20%, 0 10%)" }}
  />
);

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterSender, setFilterSender] = useState<"ALL" | "Gabriel" | "Rafaela">("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isWriting, setIsWriting] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", sender: "Gabriel" });

  useEffect(() => { fetchLetters(); }, []);

  const fetchLetters = async () => {
    try {
      const res = await fetch("/api/letters");
      const data = await res.json();
      if (!Array.isArray(data)) { setLetters([]); return; }
      setLetters(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSending(true);
    try {
      await fetch("/api/letters", { method: "POST", body: JSON.stringify(formData) });
      setFormData({ ...formData, title: "", content: "" }); 
      setIsWriting(false);
      fetchLetters();
    } catch (error) { alert("Erro ao enviar."); } 
    finally { setSending(false); }
  };

  const filteredLetters = letters
    .filter((l) => filterSender === "ALL" ? true : l.sender === filterSender)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    // SCROLL PRINCIPAL (PÁGINA)
    <div className={`
      w-full overflow-x-hidden min-h-screen pb-40
      [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0a0a0a] 
      [&::-webkit-scrollbar-thumb]:bg-[#be123c] [&::-webkit-scrollbar-thumb]:rounded-full
      hover:[&::-webkit-scrollbar-thumb]:bg-[#e11d48]
    `}>
      
      {/* 1. HERO */}
      <div className="relative w-full h-[60vh] top-0 shadow-2xl bg-neutral-900">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60 z-20" />
        <img 
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2545" 
            className="w-full h-full object-cover animate-in fade-in duration-1000" 
            alt="Cartas"
        />
        <div className="absolute bottom-16 left-6 md:left-20 z-30 max-w-4xl px-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-white/30 backdrop-blur-md rounded-full text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase shadow-lg">
               <Mail size={12}/> Correspondência
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-white leading-tight drop-shadow-2xl">
               Correio do Amor
            </h1>
        </div>
      </div>

      {/* 2. MENU FLUTUANTE */}
      <div className="sticky top-4 z-40 px-2 flex justify-center -mt-8 mb-20">
        <div className={`
            bg-[#121212]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] 
            rounded-2xl md:rounded-full p-2 px-4 
            flex flex-nowrap md:flex-wrap justify-start md:justify-center items-center gap-3 md:gap-6
            w-auto max-w-[95vw] overflow-x-auto 
            
            /* SCROLL HORIZONTAL DO MENU */
            [&::-webkit-scrollbar]:h-1
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-neutral-700
            [&::-webkit-scrollbar-thumb]:rounded-full
        `}>
           
           <button onClick={() => setIsWriting(true)} className="flex shrink-0 items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-95">
              <PenTool size={14}/> <span className="hidden sm:inline">Escrever</span>
           </button>

           <div className="h-6 w-[1px] bg-white/10 shrink-0" />

           <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 shrink-0">
                 <button onClick={() => setFilterSender("ALL")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${filterSender === "ALL" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"}`}>Todos</button>
                 <button onClick={() => setFilterSender("Gabriel")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${filterSender === "Gabriel" ? "bg-blue-100 text-blue-900 shadow-sm" : "text-neutral-400 hover:text-blue-300"}`}>Gab</button>
                 <button onClick={() => setFilterSender("Rafaela")} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${filterSender === "Rafaela" ? "bg-rose-100 text-rose-900 shadow-sm" : "text-neutral-400 hover:text-rose-300"}`}>Rafa</button>
           </div>

           <button onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white transition shrink-0">
                 <ArrowDownUp size={16} className={sortOrder === "asc" ? "rotate-180 transition-transform" : "transition-transform"}/>
           </button>
        </div>
      </div>

      {/* 3. GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
         {loading ? ( <div className="flex justify-center py-32"><Loader2 className="animate-spin text-rose-500" size={40} /></div> ) : filteredLetters.length === 0 ? (
            <div className="text-center py-40 opacity-40"><Mail size={80} className="mx-auto mb-6 text-neutral-600" /><p className="font-serif text-2xl text-neutral-400">Caixa vazia.</p></div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
               {filteredLetters.map((letter) => (
                  <motion.div
                    layoutId={letter.id} key={letter.id} onClick={() => setSelectedLetter(letter)} 
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} whileHover={{ y: -8, rotate: 1 }}
                    className="relative bg-[#fffdf5] h-60 rounded-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] cursor-pointer group flex flex-col overflow-hidden border border-[#e8e6df] transform transition-transform"
                  >
                     {/* TEXTURA SUTIL DO PAPEL */}
                     <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')"}} />
                     
                     {/* 
                         BORDAS SUTIS (PASTEL)
                         Usando cores mais claras (#fca5a5 = vermelho suave, #93c5fd = azul suave) 
                         e opacidade baixa no div pai para não gritar.
                     */}
                     <div className="absolute top-0 left-0 w-full h-2 z-20 opacity-50" 
                        style={{ background: "repeating-linear-gradient(45deg, #fca5a5, #fca5a5 10px, #ffffff 10px, #ffffff 20px, #93c5fd 20px, #93c5fd 30px, #ffffff 30px, #ffffff 40px)" }} 
                     />
                     <div className="absolute bottom-0 left-0 w-full h-2 z-20 rotate-180 opacity-50" 
                        style={{ background: "repeating-linear-gradient(45deg, #fca5a5, #fca5a5 10px, #ffffff 10px, #ffffff 20px, #93c5fd 20px, #93c5fd 30px, #ffffff 30px, #ffffff 40px)" }} 
                     />

                     <Tape className="-top-3 right-1/2 rotate-6 bg-rose-900/5" />

                     {/* Carimbo de Remetente (Cor mais leve) */}
                     <div className={`absolute top-6 right-4 border px-2 py-1 rotate-[-10deg] opacity-60 group-hover:opacity-100 transition-all rounded ${letter.sender === "Gabriel" ? "border-blue-300 text-blue-400" : "border-rose-300 text-rose-400"}`}>
                        <span className="text-[8px] font-bold uppercase tracking-widest">{letter.sender.substring(0,3)} MAIL</span>
                     </div>

                     <div className="p-8 flex-1 relative z-10 flex flex-col justify-center mt-2">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-300 uppercase block mb-1">Assunto</span>
                        <h3 className="text-xl font-serif text-neutral-800 leading-tight line-clamp-2 group-hover:text-rose-500 transition-colors font-medium">
                           {letter.title}
                        </h3>
                     </div>

                     <div className="px-8 pb-5 flex items-center justify-between opacity-40 group-hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-neutral-400" />
                            <span className="text-[10px] font-mono text-neutral-500">{formatDate(letter.createdAt)}</span>
                        </div>
                        <Heart size={14} className={`fill-current ${letter.sender === "Gabriel" ? "text-blue-300" : "text-rose-300"}`} />
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </div>

      {/* --- LEITOR (SCROLLBAR PAPEL/CLARO) --- */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-hidden" onClick={() => setSelectedLetter(null)}>
             <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-rose-600 text-white transition z-[110]"><X size={24} /></button>

             <motion.div 
                layoutId={selectedLetter.id}
                onClick={(e) => e.stopPropagation()}
                // AQUI: Scrollbar Clara
                className={`
                    bg-[#fcfbf9] w-full max-w-2xl max-h-[85vh] p-8 md:p-14 relative shadow-2xl rounded-sm border border-[#e8e6df] 
                    overflow-y-auto 
                    [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-[#f0f0f0] 
                    [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] 
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-[#94a3b8]
                `}
             >
                <div className="absolute inset-0 pointer-events-none opacity-40 top-24 bottom-12 left-8 right-8" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #a3b8d6 31px, #a3b8d6 32px)" }} />
                <Tape className="-top-4 left-1/2 -translate-x-1/2 bg-yellow-200/40 w-32" rotate="-1deg" />

                <div className="relative z-10 font-serif text-neutral-800 text-lg leading-[32px] whitespace-pre-line pb-8">
                   <div className="text-center mb-10 pb-4 border-b border-neutral-300/50">
                      <span className="text-[10px] font-sans font-bold text-neutral-400 tracking-widest block mb-2">{formatDate(selectedLetter.createdAt)}</span>
                      <h2 className="text-2xl font-bold text-neutral-800">{selectedLetter.title}</h2>
                   </div>
                   {selectedLetter.content}
                   <div className="mt-16 text-right">
                       <span className={`font-handwriting text-3xl font-bold rotate-[-3deg] block ${selectedLetter.sender === "Gabriel" ? "text-blue-400" : "text-rose-400"}`}>{selectedLetter.sender}</span>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- EDITOR (SCROLLBAR DARK) --- */}
      <AnimatePresence>
        {isWriting && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, rotate: 1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.95, opacity: 0 }} 
                   className="bg-[#181818] border-[6px] border-[#222] p-8 rounded-sm w-full max-w-lg shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cardboard.png')` }} />
                    <Tape className="-top-4 right-[20%] bg-green-500/20" rotate="3deg" />
                    
                    <button onClick={() => setIsWriting(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={20}/></button>
                    <h3 className="text-3xl font-serif text-white mb-6 relative z-10">Nova Carta</h3>
                    
                    <form onSubmit={handleSend} className="space-y-6 relative z-10">
                        <div className="p-1 bg-black/40 rounded-lg flex gap-2">
                            <button type="button" onClick={() => setFormData({...formData, sender: "Gabriel"})} className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition text-xs font-bold uppercase ${formData.sender === "Gabriel" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-white"}`}><User size={14}/> Gabriel</button>
                            <button type="button" onClick={() => setFormData({...formData, sender: "Rafaela"})} className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition text-xs font-bold uppercase ${formData.sender === "Rafaela" ? "bg-rose-600 text-white" : "text-neutral-500 hover:text-white"}`}><User size={14}/> Rafaela</button>
                        </div>

                        <input type="text" placeholder="Título..." className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-sm p-3.5 text-white outline-none focus:border-rose-500 transition-colors font-serif text-lg" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} autoFocus required />
                        
                        {/* SCROLL DARK AQUI */}
                        <textarea rows={8} placeholder="Sua mensagem..." 
                            className={`
                                w-full bg-[#0a0a0a] border border-neutral-700 rounded-sm p-3.5 text-white outline-none focus:border-rose-500 transition-colors font-serif leading-relaxed resize-none placeholder:text-neutral-700
                                [&::-webkit-scrollbar]:w-2 
                                [&::-webkit-scrollbar-track]:bg-[#000] 
                                [&::-webkit-scrollbar-thumb]:bg-[#333] 
                                [&::-webkit-scrollbar-thumb]:rounded-full
                                hover:[&::-webkit-scrollbar-thumb]:bg-[#555]
                            `} 
                            value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required 
                        />
                        
                        <button disabled={sending} className={`w-full py-4 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-widest rounded-sm cursor-pointer flex justify-center items-center gap-3 transition transform hover:scale-[1.01] ${sending && "opacity-50"}`}>
                            {sending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />} Selar e Enviar
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}