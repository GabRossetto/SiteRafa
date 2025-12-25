"use client";

import { useState, useEffect } from "react";
import { Upload, Plus, FolderPlus, Image as ImageIcon, Loader2, Download, X, ArrowLeft, Maximize2, Trash2, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt?: string;
  caption?: string;
}

interface GalleryGroup {
  title: string;
  items: MediaItem[];
}

// Fita Adesiva
const Tape = ({ className, rotate = "rotate-0", color = "bg-white/20" }: any) => (
  <div className={`absolute h-10 w-24 ${color} backdrop-blur-[2px] shadow-sm z-30 border-l border-r border-white/10 ${rotate} ${className}`} 
       style={{ clipPath: "polygon(5% 0, 95% 0, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 95% 100%, 5% 100%, 0 90%, 5% 80%, 0 70%, 5% 60%, 0 50%, 5% 40%, 0 30%, 5% 20%, 0 10%)" }}
  />
);

export default function GalleryPage() {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [groupedPhotos, setGroupedPhotos] = useState<GalleryGroup[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState({ current: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [currentView, setCurrentView] = useState("all");

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (!Array.isArray(data)) { setPhotos([]); return; }
      const onlyImages = data.filter((item: MediaItem) => item.type === "IMAGE" || !item.type);
      setPhotos(onlyImages);
      organizeGroups(onlyImages);
    } catch (e) { console.error(e) } finally { setLoading(false) }
  };

  const organizeGroups = (items: MediaItem[]) => {
    const groups: Record<string, MediaItem[]> = {};
    items.forEach((item) => {
      let key = "Geral";
      if (item.caption && item.caption.trim().length > 0) key = item.caption.trim();
      else {
        const date = item.createdAt ? new Date(item.createdAt) : new Date();
        const dateStr = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        key = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    const groupArray = Object.keys(groups).map((key) => ({ title: key, items: groups[key], }));
    setGroupedPhotos(groupArray.sort((a, b) => b.title.localeCompare(a.title)));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    setUploadCount({ current: 0, total: files.length });
    const albumToSave = newAlbumName ? newAlbumName : (currentView !== "all" ? currentView : "");

    for (let i = 0; i < files.length; i++) {
      setUploadCount(prev => ({ ...prev, current: i + 1 }));
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);
      try {
        const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        const dataCloud = await resCloud.json();
        if (dataCloud.secure_url) {
          await fetch("/api/media", {
            method: "POST",
            body: JSON.stringify({ url: dataCloud.secure_url, type: "IMAGE", caption: albumToSave }),
          });
        }
      } catch (err) { console.error(err); }
    }
    if (newAlbumName) { setCurrentView(newAlbumName); setNewAlbumName(""); setShowNewAlbumModal(false); }
    await fetchPhotos();
    setUploading(false);
  };

  const handleDeleteAlbum = async () => {
    if (currentView === "all") return;
    try {
      await fetch("/api/media", { method: "DELETE", body: JSON.stringify({ caption: currentView }) });
      setCurrentView("all");
      setShowDeleteModal(false);
      await fetchPhotos();
    } catch (error) { alert("Erro ao deletar"); }
  };

  const downloadImage = (url: string) => window.open(url, "_blank");

  const currentAlbumCover = currentView === "all"
    ? "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    : (groupedPhotos.find(g => g.title === currentView)?.items[0]?.url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2670");

  return (
    <div className={`w-full min-h-screen overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0a0a0a] [&::-webkit-scrollbar-thumb]:bg-[#be123c] [&::-webkit-scrollbar-thumb]:rounded-full`}>

      {/* 1. HERO */}
      <div className="relative w-full h-[60vh] top-0 shadow-2xl bg-neutral-900">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/60 z-20" />
        <motion.img
          key={currentView}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          src={currentAlbumCover}
          className="w-full h-full object-cover"
          alt="Capa Galeria"
        />
        <div className="absolute bottom-16 left-6 md:left-20 z-30 max-w-4xl px-4">

          {/* TAG COM ÍCONE AGORA! */}
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-white/40 backdrop-blur-md rounded-full text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase shadow-lg">
            {currentView === "all" ? (
              <> <ImageIcon size={12} className="text-rose-200" /> Galeria Oficial </>
            ) : (
              <> <FolderOpen size={12} className="text-yellow-200" /> Coleção Privada </>
            )}
          </span>

          <h1 className="text-5xl md:text-8xl font-serif text-white leading-tight drop-shadow-2xl">
            {currentView === "all" ? "Nosso Album" : currentView}
          </h1>
        </div>
      </div>

      {/* 2. MENU FLUTUANTE */}
      <div className="sticky top-4 z-40 px-2 flex justify-center -mt-8 mb-16">
        <div className="bg-[#121212]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl md:rounded-full p-2 w-full max-w-[98vw] md:max-w-5xl flex gap-1 overflow-hidden items-center">

          {currentView !== "all" && (
            <div className="pl-1 shrink-0">
              <button onClick={() => setCurrentView("all")} className="p-2.5 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition shadow-md">
                <ArrowLeft size={16} />
              </button>
            </div>
          )}

          <div className={`flex-1 flex items-center gap-2 overflow-x-auto px-1 mx-2 md:mx-4 pb-2 pt-1 md:pb-2 
                [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                [&::-webkit-scrollbar-thumb]:bg-neutral-700/50 [&::-webkit-scrollbar-thumb]:rounded-full 
                hover:[&::-webkit-scrollbar-thumb]:bg-rose-500
           `}>
            {groupedPhotos.map((group) => (
              <button
                key={group.title}
                onClick={() => setCurrentView(group.title)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border flex-shrink-0 
                        ${currentView === group.title ? "bg-white text-black border-white shadow-lg" : "bg-transparent text-neutral-400 border-transparent hover:bg-white/10 hover:text-white"}`}
              >
                {group.title}
              </button>
            ))}
            <div className="w-1 shrink-0" />
          </div>

          <div className="flex shrink-0 items-center gap-2 pl-3 border-l border-white/10 bg-[#121212]/0 relative shadow-[-10px_0_20px_#121212]">
            {currentView !== "all" && (
              <button onClick={() => setShowDeleteModal(true)} className="p-3 rounded-full text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20" title="Excluir Pasta">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={() => setShowNewAlbumModal(true)} className="flex items-center gap-2 text-rose-400 hover:text-white hover:bg-rose-500/20 px-4 py-2 rounded-full transition border border-rose-500/20 hover:border-rose-500 group">
              <FolderPlus size={18} /> <span className="hidden md:inline text-xs font-bold uppercase">Nova Aba</span>
            </button>
            {currentView !== "all" && (
              <label className={`cursor-pointer bg-white text-black p-3 md:px-6 md:py-2.5 rounded-full flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition active:scale-95 ${uploading && "opacity-80"}`}>
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">{uploading ? `${uploadCount.current}/${uploadCount.total}` : "Fotos"}</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMAR EXCLUSÃO */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-red-900/50 p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center">
              <Trash2 size={40} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-serif text-white mb-2">Excluir "{currentView}"?</h3>
              <p className="text-neutral-400 text-xs mb-6">Isso apaga todas as fotos deste álbum para sempre.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteModal(false)} className="px-6 py-2 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-bold uppercase">Cancelar</button>
                <button onClick={handleDeleteAlbum} className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-bold uppercase shadow-lg">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL NOVA ABA */}
      <AnimatePresence>
        {showNewAlbumModal && (
          
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            
            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1a1a1a] border-[6px] border-[#222] p-8 rounded-sm w-full max-w-sm shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cardboard.png')` }} />
              <Tape className="-top-4 left-[35%] bg-purple-500/20" rotate="6deg" />
              <button onClick={() => setShowNewAlbumModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={20} /></button>
              <h3 className="text-3xl font-serif text-white mb-2 relative z-10">Criar Coleção</h3>
              <div className="space-y-6 relative z-10 mt-6">
                <input type="text" placeholder="Nome do álbum..." className="w-full bg-[#0a0a0a] border border-neutral-700 rounded-sm p-4 text-white outline-none focus:border-rose-500 transition-colors font-bold font-handwriting tracking-wider text-xl" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} autoFocus />
                <label className={`w-full py-4 bg-white hover:bg-gray-200 text-black font-black text-xs uppercase tracking-widest rounded-sm cursor-pointer flex justify-center items-center gap-3 transition transform hover:scale-[1.02] active:scale-95 shadow-lg border-2 border-transparent hover:border-black ${!newAlbumName && "opacity-50 pointer-events-none grayscale"}`}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Criar & Selecionar Fotos
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading || !newAlbumName} />
                </label>
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GRID MASONRY */}
      <div className="max-w-[1800px] mx-auto px-4 pb-32">
        {loading ? (<div className="flex justify-center py-32"><Loader2 className="animate-spin text-rose-500" size={40} /></div>) : groupedPhotos.length === 0 ? (
          <div className="text-center py-40 opacity-40"><ImageIcon size={80} className="mx-auto mb-6 text-neutral-600" /><p className="font-serif text-2xl text-neutral-400">Galeria vazia.</p></div>
        ) : (
          groupedPhotos.map((group) => {
            if (currentView !== "all" && currentView !== group.title) return null;
            return (
              <section key={group.title} className="mb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {currentView === "all" && (
                  <div className="flex items-end gap-6 mb-8 pl-2"><h2 className="text-4xl font-serif text-white">{group.title}</h2><div className="h-[1px] flex-1 bg-gradient-to-r from-neutral-800 to-transparent mb-2" /><span className="text-neutral-500 text-xs font-bold tracking-widest mb-2">{group.items.length} ITENS</span></div>
                )}
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                  {group.items.map((photo) => (
                    <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="break-inside-avoid relative group cursor-zoom-in rounded-xl overflow-hidden bg-[#111] shadow-2xl transition-all">
                      <img src={photo.url} alt="Memória" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"><span className="text-white text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"><Maximize2 size={12} /> Expandir</span></div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8" onClick={() => setSelectedPhoto(null)}>
            <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-rose-600 text-white transition z-50"><X size={24} /></button>
            <motion.img layoutId={selectedPhoto.id} src={selectedPhoto.url} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm border-2 border-[#1a1a1a]" onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-10 flex gap-4">
              <button onClick={(e) => { e.stopPropagation(); downloadImage(selectedPhoto.url); }} className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-gray-200 transition shadow-lg text-xs uppercase tracking-widest"><Download size={16} /> Baixar Original</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}