import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'

// Ícones simples como componentes
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PhotoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

type CropEditorProps = {
  file: File
  preview: string
  onCancel: () => void
  onApply: (blob: Blob) => void
}

function CropEditor({ file, preview, onCancel, onApply }: CropEditorProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const draggingRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const onDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    draggingRef.current = true
    const p = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY }
    lastPosRef.current = p
  }
  const onMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !lastPosRef.current) return
    const p = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY }
    const dx = p.x - lastPosRef.current.x
    const dy = p.y - lastPosRef.current.y
    setOffsetX(v => v + dx)
    setOffsetY(v => v + dy)
    lastPosRef.current = p
  }
  const onUp = () => {
    draggingRef.current = false
    lastPosRef.current = null
  }
  const applyCrop = async () => {
    const img = imgRef.current
    const vp = viewportRef.current
    if (!img || !vp) return
    const W = vp.clientWidth
    const H = vp.clientHeight
    const natW = img.naturalWidth
    const natH = img.naturalHeight
    const srcX = Math.max(0, Math.min(natW, (-offsetX) / scale))
    const srcY = Math.max(0, Math.min(natH, (-offsetY) / scale))
    const srcW = Math.max(1, Math.min(natW - srcX, W / scale))
    const srcH = Math.max(1, Math.min(natH - srcY, H / scale))
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, W, H)
    canvas.toBlob((blob) => {
      if (blob) onApply(blob)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div>
      <div
        ref={viewportRef}
        onMouseDown={onDown as any}
        onMouseMove={onMove as any}
        onMouseUp={onUp as any}
        onMouseLeave={onUp}
        onTouchStart={onDown as any}
        onTouchMove={onMove as any}
        onTouchEnd={onUp}
        className="relative mx-auto mb-4 overflow-hidden rounded-lg border border-white/10 bg-black"
        style={{ width: 480, height: 360, cursor: 'grab' }}
      >
        <img
          ref={imgRef}
          src={preview}
          alt=""
          className="select-none"
          style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`, userSelect: 'none', pointerEvents: 'none' }}
        />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-white/60 text-sm">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5">Cancelar</button>
        <button onClick={applyCrop} className="px-4 py-2 rounded-lg bg-neon-green text-black hover:bg-neon-green/90">Aplicar</button>
      </div>
    </div>
  )
}

export type Show = {
  id: string
  nome: string
  data: string
  hora: string
  descricao: string
  imagem?: string
  preco?: string
  compra_via?: 'site' | 'whatsapp'
  compra_info?: string
  ativo: boolean
}

export type GaleriaItem = {
  id: string
  url: string
  titulo: string
  categoria: string
}

type DashboardProps = {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'shows' | 'galeria'>('shows')
  const [shows, setShows] = useState<Show[]>([])
  
  const [galeria, setGaleria] = useState<GaleriaItem[]>([])
  type PendingFile = { file: File; preview: string; name: string; type: 'image' | 'video' }
  const [pendingImages, setPendingImages] = useState<PendingFile[]>([])
  const [pendingVideos, setPendingVideos] = useState<PendingFile[]>([])
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoStep, setVideoStep] = useState(0)
  const [videoMeta, setVideoMeta] = useState<{ desc: string; start: number; end: number }[]>([])
  const [videoSaveError, setVideoSaveError] = useState<string | null>(null)
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  
  const [showForm, setShowForm] = useState({
    nome: '',
    data: '',
    hora: '',
    descricao: '',
    imagem: '',
    preco: '',
    compra_via: 'site' as 'site' | 'whatsapp',
    compra_info: '',
    ativo: true
  })
  
  const [editingShow, setEditingShow] = useState<string | null>(null)
  const [showFormVisible, setShowFormVisible] = useState(false)

  useEffect(() => {
    const loadShows = async () => {
      const { data } = await supabase
        .from('shows')
        .select('*')
        .order('data', { ascending: true })
        .order('hora', { ascending: true })
      if (data) {
        const mapped = data.map((s: any) => ({
          id: s.id?.toString?.() || s.id,
          nome: s.nome,
          data: s.data,
          hora: s.hora,
          descricao: s.descricao || '',
          imagem: s.imagem || '',
          ativo: s.ativo ?? true
        })) as Show[]
        setShows(mapped)
      }
    }
    const loadGallery = async () => {
      // Carregar imagens da tabela galeria
      const { data: galeriaData } = await supabase
        .from('galeria')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (galeriaData) {
        const items: GaleriaItem[] = galeriaData.map((item: any) => ({
          id: item.storage_path,
          url: item.url,
          titulo: item.titulo || item.filename,
          categoria: item.categoria || 'Eventos'
        }))
        setGaleria(items)
      }
    }
    loadShows()
    loadGallery()
  }, [])

  const handleAddShow = () => {
    if (showForm.nome && showForm.data && showForm.hora) {
      const add = async () => {
        const { data } = await supabase
          .from('shows')
          .insert({
            nome: showForm.nome,
            data: showForm.data,
            hora: showForm.hora,
            descricao: showForm.descricao,
            preco: showForm.preco,
            compra_via: showForm.compra_via,
            compra_info: showForm.compra_info,
            ativo: showForm.ativo
          })
          .select('*')
        if (data && data[0]) {
          const s = data[0]
          setShows([
            ...shows,
            {
              id: s.id?.toString?.() || s.id,
              nome: s.nome,
              data: s.data,
              hora: s.hora,
              descricao: s.descricao || '',
              imagem: s.imagem || '',
              preco: s.preco || '',
              compra_via: (s.compra_via || 'site') as 'site' | 'whatsapp',
              compra_info: s.compra_info || '',
              ativo: s.ativo ?? true
            }
          ])
        }
        setShowForm({ nome: '', data: '', hora: '', descricao: '', imagem: '', preco: '', compra_via: 'site', compra_info: '', ativo: true })
        setShowFormVisible(false)
      }
      add()
    }
  }

  const handleEditShow = (show: Show) => {
    setShowForm({
      nome: show.nome,
      data: show.data,
      hora: show.hora,
      descricao: show.descricao || '',
      imagem: show.imagem || '',
      preco: show.preco || '',
      compra_via: (show.compra_via || 'site') as 'site' | 'whatsapp',
      compra_info: show.compra_info || '',
      ativo: show.ativo
    })
    setEditingShow(show.id)
    setShowFormVisible(true)
  }

  const handleUpdateShow = () => {
    if (editingShow && showForm.nome && showForm.data && showForm.hora) {
      const upd = async () => {
        await supabase
          .from('shows')
          .update({
            nome: showForm.nome,
            data: showForm.data,
            hora: showForm.hora,
            descricao: showForm.descricao,
            preco: showForm.preco,
            compra_via: showForm.compra_via,
            compra_info: showForm.compra_info,
            ativo: showForm.ativo
          })
          .eq('id', editingShow)
        setShows(
          shows.map(show =>
            show.id === editingShow ? { ...showForm, id: editingShow } : show
          )
        )
        setShowForm({ nome: '', data: '', hora: '', descricao: '', imagem: '', preco: '', compra_via: 'site', compra_info: '', ativo: true })
        setEditingShow(null)
        setShowFormVisible(false)
      }
      upd()
    }
  }

  const handleDeleteShow = (id: string) => {
    const del = async () => {
      await supabase.from('shows').delete().eq('id', id)
      setShows(shows.filter(show => show.id !== id))
    }
    del()
  }

  const handleToggleShowStatus = (id: string) => {
    const s = shows.find(sh => sh.id === id)
    const next = s ? !s.ativo : true
    const tog = async () => {
      await supabase.from('shows').update({ ativo: next }).eq('id', id)
      setShows(shows.map(show => 
        show.id === id ? { ...show, ativo: next } : show
      ))
    }
    tog()
  }

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const ensureAlbum = async (name: string, date: string) => {
    const slug = `${date}-${slugify(name)}`
    await supabase
      .from('albums')
      .upsert({ slug, name, date })
    return slug
  }

  const handleFlyerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      const path = `flyers/${Date.now()}-${file.name}`
      const up = await supabase.storage.from('gallery').upload(path, file, { upsert: true })
      if (!up.error) {
        const pub = supabase.storage.from('gallery').getPublicUrl(path)
        setShowForm(prev => ({ ...prev, imagem: pub.data.publicUrl }))
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const staged = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: 'image' as const
      }))
      setPendingImages(prev => [...prev, ...staged])
    }
  }
  const handleDropImages = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) {
      const staged = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: 'image' as const
      }))
      setPendingImages(prev => [...prev, ...staged])
    }
    setIsDraggingOver(false)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const staged = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: 'video' as const
      }))
      setPendingVideos(prev => [...prev, ...staged])
    }
  }

  const removePendingImage = (i: number) => {
    setPendingImages(prev => prev.filter((_, idx) => idx !== i))
  }
  const removePendingVideo = (i: number) => {
    setPendingVideos(prev => prev.filter((_, idx) => idx !== i))
  }

  const confirmUploadImages = async () => {
    const albumSlug = (eventName && eventDate) ? await ensureAlbum(eventName, eventDate) : ''
    const basePath = albumSlug ? `events/${albumSlug}` : ''
    
    for (const item of pendingImages) {
      const safeName = item.name.replace(/\s+/g, '-')
      const path = basePath ? `${basePath}/${Date.now()}-${safeName}` : `${Date.now()}-${safeName}`
      const up = await supabase.storage.from('gallery').upload(path, item.file, { upsert: true })
      
      if (!up.error) {
        const pub = supabase.storage.from('gallery').getPublicUrl(path)
        
        // Salvar na tabela de galeria
        await supabase.from('galeria').insert({
          album_slug: albumSlug,
          filename: safeName,
          titulo: albumSlug ? `${eventName}` : safeName.split('.')[0],
          categoria: albumSlug ? `Evento • ${eventDate}` : 'Eventos',
          url: pub.data.publicUrl,
          storage_path: path
        })
        
        const newItem: GaleriaItem = {
          id: path,
          url: pub.data.publicUrl,
          titulo: albumSlug ? `${eventName}` : safeName.split('.')[0],
          categoria: albumSlug ? `Evento • ${eventDate}` : 'Eventos'
        }
        setGaleria(prev => [...prev, newItem])
      }
    }
    
    setPendingImages([])
    setShowGalleryModal(false)
    setEventName('')
    setEventDate('')
  }

  const confirmUploadVideos = async () => {
    for (let i = 0; i < pendingVideos.length; i++) {
      const item = pendingVideos[i]
      const meta = videoMeta[i] || { desc: '', start: 0, end: 0 }
      const safeName = item.name.replace(/\s+/g, '-')
      const path = `videos/${Date.now()}-${safeName}`
      const up = await supabase.storage.from('gallery').upload(path, item.file, { upsert: true })
      if (up.error) {
        setVideoSaveError(up.error.message)
        return
      }
      const pub = supabase.storage.from('gallery').getPublicUrl(path)
      const { error: insertError } = await supabase.from('videos').insert({
          filename: safeName,
          url: pub.data.publicUrl,
          storage_path: path,
          description: meta.desc,
          start_sec: meta.start || null,
          end_sec: meta.end || null
        })
      if (insertError) {
        const msg = `Não salvou no banco: ${insertError.message}. Se estiver dando 404, rode o reset.sql no Supabase para criar a tabela videos e as políticas.`
        setVideoSaveError(msg)
        return
      }
    }
    setPendingVideos([])
    setVideoMeta([])
  }

  const handleDeleteImage = (id: string) => {
    const rem = async () => {
      // Remover do storage
      await supabase.storage.from('gallery').remove([id])
      
      // Remover da tabela galeria
      await supabase.from('galeria').delete().eq('storage_path', id)
      
      // Atualizar estado local
      setGaleria(galeria.filter(item => item.id !== id))
    }
    rem()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header da Dashboard */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <span className="text-sm text-white/60">Canto Certo Admin</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navegação */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('shows')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'shows'
                ? 'bg-neon-green text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <CalendarIcon />
            Shows
          </button>
          <button
            onClick={() => setActiveTab('galeria')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'galeria'
                ? 'bg-neon-pink text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <PhotoIcon />
            Galeria
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Aba Shows */}
          {activeTab === 'shows' && (
            <motion.div
              key="shows"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Gerenciar Shows</h2>
                <button
                  onClick={() => setShowFormVisible(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors"
                >
                  <PlusIcon />
                  Novo Show
                </button>
              </div>

              {/* Formulário de Show */}
              <AnimatePresence>
                {showFormVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {editingShow ? 'Editar Show' : 'Adicionar Novo Show'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Nome do Show</label>
                        <input
                          type="text"
                          value={showForm.nome}
                          onChange={(e) => setShowForm({ ...showForm, nome: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                          placeholder="Nome do show"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Flyer</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFlyerUpload}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                        />
                        {showForm.imagem && (
                          <img src={showForm.imagem} alt="" className="mt-2 h-24 w-auto rounded border border-white/10" />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Data</label>
                        <input
                          type="date"
                          value={showForm.data}
                          onChange={(e) => setShowForm({ ...showForm, data: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Horário</label>
                        <input
                          type="time"
                          value={showForm.hora}
                          onChange={(e) => setShowForm({ ...showForm, hora: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Valor do Ingresso</label>
                        <input
                          type="text"
                          value={showForm.preco}
                          onChange={(e) => setShowForm({ ...showForm, preco: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                          placeholder="Ex: R$ 30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Compra</label>
                        <select
                          value={showForm.compra_via}
                          onChange={(e) => setShowForm({ ...showForm, compra_via: e.target.value as 'site' | 'whatsapp', compra_info: '' })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                        >
                          <option value="site">Site</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-white/60 mb-1">
                          {showForm.compra_via === 'site' ? 'Link do Site' : 'Número do WhatsApp'}
                        </label>
                        <input
                          type="text"
                          value={showForm.compra_info}
                          onChange={(e) => setShowForm({ ...showForm, compra_info: e.target.value })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                          placeholder={showForm.compra_via === 'site' ? 'https://...' : '(19) 9xxxx-xxxx'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">Status</label>
                        <select
                          value={showForm.ativo ? 'ativo' : 'inativo'}
                          onChange={(e) => setShowForm({ ...showForm, ativo: e.target.value === 'ativo' })}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                        >
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-white/60 mb-1">Descrição</label>
                      <textarea
                        value={showForm.descricao}
                        onChange={(e) => setShowForm({ ...showForm, descricao: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                        rows={3}
                        placeholder="Descrição do show"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={editingShow ? handleUpdateShow : handleAddShow}
                        className="px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors"
                      >
                        {editingShow ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button
                        onClick={() => {
                          setShowFormVisible(false)
                          setEditingShow(null)
                          setShowForm({ nome: '', data: '', hora: '', descricao: '', imagem: '', preco: '', compra_via: 'site', compra_info: '', ativo: true })
                        }}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de Shows */}
              <div className="grid gap-4">
                {shows.map((show) => (
                  <motion.div
                    key={show.id}
                    layout
                    className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{show.nome}</h3>
                        <div className="flex gap-4 text-sm text-white/60 mb-2">
                          <span>📅 {new Date(show.data).toLocaleDateString('pt-BR')}</span>
                          <span>🕐 {show.hora}</span>
                        </div>
                        <p className="text-white/80 mb-3">{show.descricao}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            show.ativo ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {show.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleShowStatus(show.id)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title={show.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {show.ativo ? '🔒' : '✅'}
                        </button>
                        <button
                          onClick={() => handleEditShow(show)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteShow(show.id)}
                          className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Aba Galeria */}
          {activeTab === 'galeria' && (
            <motion.div
              key="galeria"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Gerenciar Galeria</h2>
                  <div className="flex items-center gap-3">
                    <button
                    onClick={() => setShowGalleryModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-black rounded-lg hover:bg-neon-pink/90 transition-colors cursor-pointer"
                  >
                    <PlusIcon />
                    Adicionar Imagens
                  </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black rounded-lg hover:bg-neon-blue/90 transition-colors cursor-pointer">
                      <PlusIcon />
                      Adicionar Vídeos
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {!!pendingImages.length && (
                  <div className="mt-6">
                    <h4 className="text-white/80 mb-2">Imagens selecionadas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pendingImages.map((p, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <img src={p.preview} alt="" className="w-full h-28 object-cover rounded" />
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => {
                              const val = e.target.value
                              setPendingImages(prev => prev.map((x, idx) => idx === i ? { ...x, name: val } : x))
                            }}
                            className="mt-2 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => removePendingImage(i)}
                            className="mt-2 w-full text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={confirmUploadImages}
                      className="mt-3 px-4 py-2 rounded bg-neon-green text-black hover:bg-neon-green/90"
                    >
                      Enviar {pendingImages.length} imagens
                    </button>
                  </div>
                )}
                {!!pendingVideos.length && (
                  <div className="mt-6">
                    <h4 className="text-white/80 mb-2">Vídeos selecionados</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pendingVideos.map((p, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <video src={p.preview} className="w-full h-28 object-cover rounded" />
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => {
                              const val = e.target.value
                              setPendingVideos(prev => prev.map((x, idx) => idx === i ? { ...x, name: val } : x))
                            }}
                            className="mt-2 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => removePendingVideo(i)}
                            className="mt-2 w-full text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setVideoMeta(pendingVideos.map(() => ({ desc: '', start: 0, end: 0 })))
                        setVideoStep(0)
                        setVideoSaveError(null)
                        setShowVideoModal(true)
                      }}
                      className="mt-3 px-4 py-2 rounded bg-neon-pink text-black hover:bg-neon-pink/90"
                    >
                      Enviar {pendingVideos.length} vídeos
                    </button>
                  </div>
                )}
              </div>

              {/* Grid de Imagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galeria.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={item.url}
                      alt={item.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteImage(item.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Excluir imagem"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-white font-medium">{item.titulo}</h4>
                      <p className="text-white/60 text-sm">{item.categoria}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Adicionar Imagens */}
        <AnimatePresence>
          {showGalleryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowGalleryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Adicionar Imagens à Galeria</h3>
                  <button
                    onClick={() => setShowGalleryModal(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Nome do Evento</label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                      placeholder="Ex: Baile de Sábado"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Dia do Evento</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/60"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Selecionar Imagens</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={handleDropImages}
                    className={`mb-3 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${isDraggingOver ? 'border-neon-green bg-neon-green/10 text-neon-green' : 'border-white/10 bg-white/5 text-white/60'}`}
                  >
                    Arraste e solte as fotos aqui
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90 transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Selecionar Imagens
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {!!pendingImages.length && (
                  <div className="mb-6">
                    <h4 className="text-white/80 mb-3">Imagens selecionadas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {pendingImages.map((p, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <img src={p.preview} alt="" className="w-full h-24 object-cover rounded" />
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => {
                              const val = e.target.value
                              setPendingImages(prev => prev.map((x, idx) => idx === i ? { ...x, name: val } : x))
                            }}
                            className="mt-2 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                            placeholder="Nome da imagem"
                          />
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setEditingImageIndex(i)}
                              className="w-full text-xs px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
                            >
                              Editar
                            </button>
                          <button
                            onClick={() => removePendingImage(i)}
                            className="mt-2 w-full text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                          >
                            Remover
                          </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowGalleryModal(false)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmUploadImages}
                    disabled={!pendingImages.length || !eventName || !eventDate}
                    className="px-4 py-2 rounded-lg bg-neon-green text-black hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar Imagens
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        <AnimatePresence>
          {editingImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingImageIndex(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-3xl w-full border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Editar Imagem</h3>
                <CropEditor
                  file={pendingImages[editingImageIndex].file}
                  preview={pendingImages[editingImageIndex].preview}
                  onCancel={() => setEditingImageIndex(null)}
                  onApply={async (blob) => {
                    const orig = pendingImages[editingImageIndex!]
                    const f = new File([blob], orig.name, { type: 'image/jpeg' })
                    const url = URL.createObjectURL(f)
                    setPendingImages(prev => prev.map((x, idx) => idx === editingImageIndex ? { ...x, file: f, preview: url } : x))
                    setEditingImageIndex(null)
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showVideoModal && pendingVideos[videoStep] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowVideoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-3xl w-full border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Preparar Vídeo</h3>
                {!!videoSaveError && (
                  <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {videoSaveError}
                  </div>
                )}
                <div className="relative rounded-2xl p-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">
                  <div className="rounded-xl bg-black">
                    <video
                      src={pendingVideos[videoStep].preview}
                      className="w-full rounded-xl"
                      controls
                      onLoadedMetadata={(e) => {
                        const dur = (e.currentTarget as HTMLVideoElement).duration
                        setVideoMeta(prev => {
                          const next = [...prev]
                          const cur = next[videoStep]
                          next[videoStep] = { desc: cur?.desc || '', start: cur?.start ?? 0, end: cur?.end ?? Math.floor(dur) }
                          return next
                        })
                      }}
                      onTimeUpdate={(e) => {
                        const v = e.currentTarget as HTMLVideoElement
                        const meta = videoMeta[videoStep]
                        if (meta && meta.end && v.currentTime > meta.end) v.pause()
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm text-white/60 mb-1">Descrição</label>
                    <input
                      type="text"
                      value={videoMeta[videoStep]?.desc || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setVideoMeta(prev => {
                          const next = [...prev]
                          const cur = next[videoStep] || { desc: '', start: 0, end: 0 }
                          next[videoStep] = { ...cur, desc: val }
                          return next
                        })
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                      placeholder="Descreva o vídeo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Início</label>
                    <input
                      type="range"
                      min={0}
                      max={videoMeta[videoStep]?.end || 60}
                      step={1}
                      value={videoMeta[videoStep]?.start || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setVideoMeta(prev => {
                          const next = [...prev]
                          const cur = next[videoStep] || { desc: '', start: 0, end: 0 }
                          const end = Math.max(val + 1, cur.end || val + 10)
                          next[videoStep] = { ...cur, start: val, end }
                          return next
                        })
                      }}
                    />
                    <div className="text-white/60 text-sm">{videoMeta[videoStep]?.start || 0}s</div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Fim</label>
                    <input
                      type="range"
                      min={videoMeta[videoStep]?.start || 0}
                      max={Math.max((videoMeta[videoStep]?.end || 60), (videoMeta[videoStep]?.start || 0) + 1)}
                      step={1}
                      value={videoMeta[videoStep]?.end || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setVideoMeta(prev => {
                          const next = [...prev]
                          const cur = next[videoStep] || { desc: '', start: 0, end: 0 }
                          const start = Math.min(val - 1, cur.start || 0)
                          next[videoStep] = { ...cur, end: val, start }
                          return next
                        })
                      }}
                    />
                    <div className="text-white/60 text-sm">{videoMeta[videoStep]?.end || 0}s</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => {
                      setShowVideoModal(false)
                    }}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (videoStep < pendingVideos.length - 1) {
                          setVideoStep(v => v + 1)
                        } else {
                          setShowVideoModal(false)
                          confirmUploadVideos()
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-neon-pink text-black hover:bg-neon-pink/90"
                    >
                      {videoStep < pendingVideos.length - 1 ? 'Próximo' : 'Salvar vídeos'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}
