"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Music, Film, Tv, X, Link as LinkIcon, Disc, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SpotifyPlayer from "@/components/SpotifyPlayer"; 

interface MediaItem { id: string; url: string; type: string; caption?: string; createdAt?: string; }

// Fita Adesiva
const Tape = ({ className, rotate = "rotate-0", color = "bg-white/20" }: any) => (
  <div className={`absolute h-8 w-24 ${color} backdrop-blur-[2px] shadow-sm z-30 border-l border-r border-white/10 ${rotate} ${className}`} 
       style={{ clipPath: "polygon(5% 0, 95% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 5% 80%, 0 70%, 5% 60%, 0 50%, 5% 40%, 0 30%, 5% 20%, 0 10%)" }}
  />
);

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false); 
  const [deleting, setDeleting] = useState<string | null>(null); 

  // Modais
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null); 

  // Paginação Videos
  const [videoPage, setVideoPage] = useState(1);
  const VIDEOS_PER_PAGE = 4; // Grid 2x2 = 4 itens

  // Form
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<"VIDEO" | "MUSIC">("VIDEO");
  const [newCaption, setNewCaption] = useState("");

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const filtered = data.filter((item: MediaItem) => item.type === "VIDEO" || item.type === "MUSIC");
      setItems(filtered);
    } catch (e) { console.error(e) } finally { setLoading(false) }
  };

  const musics = items.filter(i => i.type === "MUSIC");
  const allVideos = items.filter(i => i.type === "VIDEO");

  // --- LÓGICA DE PAGINAÇÃO DE VÍDEOS ---
  const totalVideoPages = Math.ceil(allVideos.length / VIDEOS_PER_PAGE);
  const currentVideos = allVideos.slice(
    (videoPage - 1) * VIDEOS_PER_PAGE,
    videoPage * VIDEOS_PER_PAGE
  );

  const nextPage = () => { if (videoPage < totalVideoPages) setVideoPage(p => p + 1); };
  const prevPage = () => { if (videoPage > 1) setVideoPage(p => p - 1); };

  const getEmbedUrl = (url: string, type: string) => {
    if (type === "VIDEO") {
      if (url.includes("watch?v=")) return `https://www.youtube.com/embed/${url.split("v=")[1].split("&")[0]}`;
      if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
      return url;
    } 
    if (type === "MUSIC") {
      if (url.includes("open.spotify.com") && !url.includes("embed")) {
        return url.replace("open.spotify.com", "open.spotify.com/embed");
      }
      return url;
    }
    return url;
  };

  const handleAddMedia = async () => {
    if (!newUrl) return;
    setAdding(true);
    try {
      const finalUrl = getEmbedUrl(newUrl, newType);
      await fetch("/api/media", { method: "POST", body: JSON.stringify({ url: finalUrl, type: newType, caption: newCaption || (newType === "VIDEO" ? "Nosso Filme" : "Playlist Extra") }), });
      setNewUrl(""); setNewCaption(""); setShowModal(false); await fetchMedia();
    } catch (e) { alert("Erro ao salvar."); } finally { setAdding(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(itemToDelete.id);
    try {
        await fetch("/api/media", { method: "DELETE", body: JSON.stringify({ id: itemToDelete.id }) });
        await fetchMedia(); 
        setItemToDelete(null); 
    } catch (error) { alert("Erro ao excluir."); } finally { setDeleting(null); }
  };

  return (
    <div className="w-full overflow-x-hidden min-h-screen pb-40 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-thumb]:bg-[#e11d48] [&::-webkit-scrollbar-thumb]:rounded-full">
      
      {/* 1. HERO */}
      <div className="relative w-full h-[60vh] top-0 mb-0 shadow-2xl">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60 z-20" />
        <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2659" className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Cinema"/>
        <div className="absolute bottom-16 left-6 md:left-20 z-30 max-w-4xl px-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-rose-500/50 bg-rose-900/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-[0.2em] text-rose-200 uppercase shadow-lg">
               <Film size={12}/> Cine & Som
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight drop-shadow-2xl">
               Nossas Musicas e Videos <br/> 
            </h1>
        </div>
      </div>

      {/* 2. BARRA */}
      <div className="sticky top-4 z-40 px-2 flex justify-center -mt-8 mb-20">
        <div className="bg-[#121212]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-full py-2 px-3 flex items-center gap-4">
           <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 px-2">
              <Disc size={16} className={items.length > 0 ? "text-rose-500 animate-spin-slow" : ""} />
              <span>{1 + musics.length} Discos</span> <span className="w-1 h-1 rounded-full bg-neutral-600 mx-1" /> <span>{allVideos.length} Filmes</span>
           </div>
           <div className="h-6 w-[1px] bg-white/10" />
           <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-rose-200 transition shadow-lg active:scale-95">
              <Plus size={16}/> Adicionar
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
         
         {/* === MÚSICAS === */}
         <div className="mb-32 relative">
            <h2 className="text-3xl font-serif text-white mb-10 flex items-center gap-3"><Music className="text-rose-500" /> Musiquinhas</h2>
            <SpotifyPlayer />
            {musics.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                {musics.map((item, idx) => (
                    <motion.div key={item.id} className="relative bg-[#1a1a1a] p-4 rounded-xl border border-white/5 shadow-2xl group transition-all hover:border-white/20">
                        <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-3 bg-white/10" />
                        <div className="flex justify-between items-start mb-3 px-1">
                            <h4 className="text-white font-bold truncate text-sm flex-1 mr-2" title={item.caption}>{item.caption}</h4>
                            <button onClick={() => setItemToDelete(item)} className="text-neutral-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                        <div className="rounded-lg overflow-hidden border border-neutral-800 bg-black relative z-10">
                            <iframe src={item.url} width="100%" height="152" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" loading="lazy" />
                        </div>
                    </motion.div>
                ))}
            </div>}
         </div>

         {/* === VÍDEOS: PAGINAÇÃO 2x2 === */}
         <div className="relative mb-20 min-h-[500px]">
            <h2 className="text-3xl font-serif text-white mb-10 flex items-center gap-3"><Tv className="text-blue-400" /> Cineminha</h2>
            
            {loading ? (
                <div className="h-40 w-full animate-pulse bg-white/5 rounded-xl"/> 
            ) : allVideos.length === 0 ? (
                <div className="text-center p-10 border border-dashed border-neutral-800 rounded-xl"><p className="text-neutral-500 text-sm">Nenhum vídeo adicionado.</p></div>
            ) : (
                <>
                    {/* O GRID: 2 COLUNAS SEMPRE */}
                    <div className="grid grid-cols-2 gap-4 md:gap-8 md:px-12">
                       <AnimatePresence mode="popLayout">
                           {currentVideos.map((item, index) => (
                              <motion.div 
                                key={item.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative bg-white p-2 md:p-3 pb-8 md:pb-12 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 rounded-sm group h-fit"
                              >
                                 <Tape className="-top-3 md:-top-4 right-1/2 bg-rose-900/30 rotate-12" />
                                 <button onClick={() => setItemToDelete(item)} className="absolute -top-2 -right-2 z-50 bg-black text-white p-1.5 md:p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 scale-90 group-hover:scale-100"><Trash2 size={14} /></button>

                                 <div className="relative w-full aspect-video bg-black overflow-hidden border-2 border-black">
                                    <iframe width="100%" height="100%" src={item.url} title="Video" frameBorder="0" allowFullScreen className="absolute inset-0" />
                                 </div>
                                 <div className="absolute bottom-2 md:bottom-3 left-2 right-2 md:left-4 md:right-4 flex justify-between items-end">
                                    <p className="font-handwriting text-neutral-800 font-bold text-sm md:text-lg truncate">{item.caption}</p>
                                    <span className="text-[8px] md:text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1 rounded hidden md:block">HD</span>
                                 </div>
                              </motion.div>
                           ))}
                       </AnimatePresence>
                    </div>

                    {/* PAGINAÇÃO CONTROLS */}
                    {totalVideoPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button 
                                onClick={prevPage} 
                                disabled={videoPage === 1}
                                className="p-3 rounded-full bg-neutral-800 text-white hover:bg-rose-600 disabled:opacity-30 disabled:hover:bg-neutral-800 transition"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-mono text-neutral-500 uppercase tracking-widest">
                                ROLO {videoPage} / {totalVideoPages}
                            </span>
                            <button 
                                onClick={nextPage} 
                                disabled={videoPage === totalVideoPages}
                                className="p-3 rounded-full bg-neutral-800 text-white hover:bg-rose-600 disabled:opacity-30 disabled:hover:bg-neutral-800 transition"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
         </div>
      </div>

      {/* --- MODAIS DE CONFIRMAÇÃO --- */}
      {/* (MODAL ADD) */}
      <AnimatePresence>
        {showModal && (
            <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.95, rotate: 2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.95, opacity: 0 }} 
                   className="bg-[#181818] border-[6px] border-[#222] p-8 rounded-sm w-full max-w-md shadow-2xl relative">
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cardboard.png')` }} />
                    <Tape className="-top-4 left-[30%] bg-purple-500/20" rotate="3deg" />
                    
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={20}/></button>
                    <h3 className="text-3xl font-serif text-white mb-6 relative z-10">Adicionar Mídia</h3>
                    
                    <div className="flex gap-2 mb-6 relative z-10 bg-black/40 p-1 rounded-lg">
                        <button onClick={() => setNewType("VIDEO")} className={`flex-1 py-3 text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2 ${newType === "VIDEO" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"}`}><Film size={14}/> Vídeo</button>
                        <button onClick={() => setNewType("MUSIC")} className={`flex-1 py-3 text-xs font-bold uppercase rounded transition-colors flex items-center justify-center gap-2 ${newType === "MUSIC" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"}`}><Music size={14}/> Playlist</button>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="group relative"><LinkIcon className="absolute top-4 left-4 text-neutral-500" size={16} /><input type="text" placeholder="Cole o link..." className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-sm p-3.5 pl-12 text-white outline-none focus:border-rose-500 transition-colors" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} autoFocus /></div>
                        <input type="text" placeholder="Título (Opcional)" className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-sm p-3.5 text-white outline-none focus:border-rose-500 transition-colors font-handwriting tracking-wide" value={newCaption} onChange={(e) => setNewCaption(e.target.value)}/>
                        
                        <button onClick={handleAddMedia} disabled={!newUrl || adding} className={`w-full py-4 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-widest rounded-sm cursor-pointer flex justify-center items-center gap-3 transition shadow-lg ${(!newUrl || adding) && "opacity-50 pointer-events-none grayscale"}`}>
                            {adding ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18} />} Salvar na Coleção
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* (MODAL DELETE) */}
      <AnimatePresence>
        {itemToDelete && (
            <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
                   className="bg-[#1f1f22] border border-white/10 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl relative">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Trash2 size={24} /></div>
                    <h3 className="text-white font-bold text-lg mb-2">Excluir?</h3>
                    <p className="text-neutral-400 text-xs mb-6 px-4">Confirma remover <strong>"{itemToDelete.caption || 'Item'}"</strong>?</p>
                    <div className="flex gap-3">
                        <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 text-neutral-400 font-bold text-xs uppercase bg-white/5 hover:bg-white/10 rounded-xl transition">Cancelar</button>
                        <button onClick={handleDelete} disabled={!!deleting} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2">{deleting === itemToDelete.id ? <Loader2 size={14} className="animate-spin"/> : "Excluir"}</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}