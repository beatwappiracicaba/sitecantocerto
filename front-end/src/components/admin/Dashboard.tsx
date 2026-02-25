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

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const vp = viewportRef.current
    if (vp) {
      const sX = vp.clientWidth / img.naturalWidth
      const sY = vp.clientHeight / img.naturalHeight
      const initialScale = Math.min(sX, sY)
      setScale(initialScale)
      const renderedW = img.naturalWidth * initialScale
      const renderedH = img.naturalHeight * initialScale
      setOffsetX((vp.clientWidth - renderedW) / 2)
      setOffsetY((vp.clientHeight - renderedH) / 2)
    }
  }

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
    
    // Output resolution multiplier (4x for higher quality)
    const outputScale = 4
    const W = vp.clientWidth * outputScale
    const H = vp.clientHeight * outputScale
    
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Fill black background
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, W, H)
    
    ctx.save()
    ctx.translate(offsetX * outputScale, offsetY * outputScale)
    ctx.scale(scale * outputScale, scale * outputScale)
    ctx.drawImage(img, 0, 0)
    ctx.restore()
    
    canvas.toBlob((blob) => {
      if (blob) onApply(blob)
    }, 'image/jpeg', 0.95)
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
          onLoad={handleImageLoad}
          alt=""
          className="select-none origin-top-left"
          style={{ 
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`, 
            userSelect: 'none', 
            pointerEvents: 'none',
            maxWidth: 'none',
            maxHeight: 'none'
          }}
        />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-white/60 text-sm">Zoom</span>
        <input
          type="range"
          min={0.1}
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

export type Album = {
  id: string
  slug: string
  name: string
  date: string
  cover_url?: string
}

type DashboardProps = {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'shows' | 'galeria'>('shows')
  const [shows, setShows] = useState<Show[]>([])
  
  // Galeria State
  const [viewMode, setViewMode] = useState<'albums' | 'photos'>('albums')
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [galeria, setGaleria] = useState<GaleriaItem[]>([])
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [albumForm, setAlbumForm] = useState<{ name: string; date: string; coverFile: File | null }>({ name: '', date: '', coverFile: null })
  const [editingPhoto, setEditingPhoto] = useState<GaleriaItem | null>(null)
  const [photoTitle, setPhotoTitle] = useState<string>('')
  
  type PendingFile = { file: File; preview: string; name: string; type: 'image' | 'video' }
  const [pendingImages, setPendingImages] = useState<PendingFile[]>([])
  const [pendingVideos, setPendingVideos] = useState<PendingFile[]>([])
  
  // Video Upload
  const [showVideoInitModal, setShowVideoInitModal] = useState(false)
  const [videoEventName, setVideoEventName] = useState('')
  const [videoEventDate, setVideoEventDate] = useState('')
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

  const loadAlbums = async () => {
    const { data } = await supabase.from('albums').select('*').order('date', { ascending: false })
    if (data) {
      setAlbums(data as Album[])
    }
  }
  const loadGallery = async () => {
    let query = supabase.from('galeria').select('*').order('created_at', { ascending: false })
    if (selectedAlbum) {
      query = query.eq('album_slug', selectedAlbum.slug)
    }
    const { data: galeriaData } = await query
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

    loadShows()
    loadAlbums()
    loadGallery()
    // Só carregar galeria se estiver em viewMode photos ou para inicializar?
    // Melhor carregar sob demanda. Mas vou deixar carregar tudo por enquanto se não tiver album selecionado.
  }, [selectedAlbum]) // Recarregar quando selecionar album

  // Carregar galeria quando mudar selectedAlbum
  useEffect(() => {
    const loadGallery = async () => {
      let query = supabase.from('galeria').select('*').order('created_at', { ascending: false })
      if (selectedAlbum) {
        query = query.eq('album_slug', selectedAlbum.slug)
      }
      const { data: galeriaData } = await query
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
    if (viewMode === 'photos') {
      loadGallery()
    }
  }, [viewMode, selectedAlbum])

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
    const slug = slugify(`${date}-${name}`)
    const { data } = await supabase.from('albums').select('slug').eq('slug', slug).maybeSingle()
    if (data) return data.slug

    const { data: newAlbum } = await supabase
      .from('albums')
      .insert({ slug, name, date })
      .select('slug')
      .single()
    
    loadAlbums()
    return newAlbum?.slug || slug
  }

  const handleDeleteAlbum = async (e: React.MouseEvent, album: Album) => {
    e.stopPropagation()
    if (!confirm(`Tem certeza que deseja excluir o álbum "${album.name}" e todas as suas fotos?`)) return

    // List files to delete from storage
    const { data: photos } = await supabase.from('galeria').select('storage_path').eq('album_slug', album.slug)
    if (photos && photos.length > 0) {
      const paths = photos.map(p => p.storage_path)
      await supabase.storage.from('gallery').remove(paths)
    }

    // Delete album (cascade will delete galeria rows)
    await supabase.from('albums').delete().eq('id', album.id)
    loadAlbums()
    if (selectedAlbum?.id === album.id) {
      setSelectedAlbum(null)
      setViewMode('albums')
    }
  }
  const handleEditAlbum = (e: React.MouseEvent, album: Album) => {
    e.stopPropagation()
    setEditingAlbum(album)
    setAlbumForm({ name: album.name, date: album.date, coverFile: null })
  }
  const saveAlbumEdits = async () => {
    if (!editingAlbum) return
    let coverUrl = editingAlbum.cover_url || null
    if (albumForm.coverFile) {
      const name = `cover-${Date.now()}.jpg`
      const path = `albums/${editingAlbum.slug}/${name}`
      const up = await supabase.storage.from('gallery').upload(path, albumForm.coverFile, { upsert: true })
      if (!up.error) {
        const pub = supabase.storage.from('gallery').getPublicUrl(path)
        coverUrl = pub.data.publicUrl
      }
    }
    await supabase.from('albums').update({
      name: albumForm.name,
      date: albumForm.date,
      cover_url: coverUrl
    }).eq('id', editingAlbum.id)
    await loadAlbums()
    if (selectedAlbum && selectedAlbum.id === editingAlbum.id) {
      setSelectedAlbum({ ...selectedAlbum, name: albumForm.name, date: albumForm.date, cover_url: coverUrl || undefined })
    }
    setEditingAlbum(null)
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
          end_sec: meta.end || null,
          event_name: videoEventName || null,
          event_date: videoEventDate || null
        })
      if (insertError) {
        const msg = `Não salvou no banco: ${insertError.message}. Se estiver dando 404, rode o reset.sql no Supabase para criar a tabela videos e as políticas.`
        setVideoSaveError(msg)
        return
      }
    }
    setPendingVideos([])
    setVideoMeta([])
    setVideoEventName('')
    setVideoEventDate('')
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    {viewMode === 'photos' && (
                      <button 
                        onClick={() => {
                          setViewMode('albums')
                          setSelectedAlbum(null)
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        title="Voltar para Álbuns"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                    )}
                    <h2 className="text-2xl font-bold text-white">
                      {viewMode === 'albums' ? 'Álbuns da Galeria' : (selectedAlbum ? selectedAlbum.name : 'Galeria')}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                    onClick={() => setShowGalleryModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-black rounded-lg hover:bg-neon-pink/90 transition-colors cursor-pointer text-sm font-medium"
                  >
                    <PlusIcon />
                    Adicionar Imagens
                  </button>
                    <button
                      onClick={() => {
                        setVideoEventName('')
                        setVideoEventDate('')
                        setShowVideoInitModal(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black rounded-lg hover:bg-neon-blue/90 transition-colors cursor-pointer text-sm font-medium"
                    >
                      <PlusIcon />
                      Adicionar Vídeos
                    </button>
                    <input
                      id="video-upload-input"
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Lista de Uploads Pendentes (Videos) */}
                {!!pendingVideos.length && (
                  <div className="mt-6 mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white/80 font-bold">
                            Vídeos selecionados {videoEventName ? `para: ${videoEventName}` : ''} 
                            {videoEventDate ? ` (${new Date(videoEventDate).toLocaleDateString('pt-BR')})` : ''}
                        </h4>
                        <button
                            onClick={() => {
                                setPendingVideos([])
                                setVideoEventName('')
                                setVideoEventDate('')
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                        >
                            Cancelar tudo
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pendingVideos.map((p, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2 relative group">
                          <video src={p.preview} className="w-full h-28 object-cover rounded" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <span className="text-white text-xs font-bold">Aguardando envio</span>
                          </div>
                          <p className="mt-2 text-xs text-white truncate">{p.name}</p>
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
                      className="mt-3 px-4 py-2 rounded bg-neon-pink text-black hover:bg-neon-pink/90 font-medium"
                    >
                      Preparar e Enviar {pendingVideos.length} vídeos
                    </button>
                  </div>
                )}
                
                {!!pendingImages.length && (
                  <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white/80 mb-2 font-bold">Imagens selecionadas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pendingImages.map((p, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2">
                          <img src={p.preview} alt="" className="w-full h-28 object-contain bg-black rounded" />
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
                      className="mt-3 px-4 py-2 rounded bg-neon-green text-black hover:bg-neon-green/90 font-medium"
                    >
                      Enviar {pendingImages.length} imagens
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode: Albums */}
              {viewMode === 'albums' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      layout
                      onClick={() => {
                        setSelectedAlbum(album)
                        setViewMode('photos')
                      }}
                      className="cursor-pointer group bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-neon-pink/50 transition-all hover:shadow-[0_0_15px_rgba(255,0,128,0.3)]"
                    >
                      <div className="h-40 bg-gray-900 flex items-center justify-center text-white/20 relative">
                         <button
                           onClick={(e) => handleEditAlbum(e, album)}
                           className="absolute top-2 left-2 p-2 bg-white/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white/30"
                           title="Editar álbum"
                         >
                           <EditIcon />
                         </button>
                         <button
                            onClick={(e) => handleDeleteAlbum(e, album)}
                            className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                            title="Excluir álbum"
                         >
                            <TrashIcon />
                         </button>
                         {album.cover_url && (
                           <img src={album.cover_url} alt={album.name} className="absolute inset-0 w-full h-full object-cover" />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <span className="text-white font-bold truncate text-lg">{album.name}</span>
                            <span className="text-white/60 text-sm">{new Date(album.date).toLocaleDateString('pt-BR')}</span>
                         </div>
                         {/* Icone de pasta */}
                         {!album.cover_url && <svg className="w-16 h-16 text-white/10 group-hover:text-white/20 transition-colors mb-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>}
                      </div>
                    </motion.div>
                  ))}
                  {albums.length === 0 && (
                     <div className="col-span-full text-center py-12 text-white/40 border-2 border-dashed border-white/10 rounded-lg">
                        <p className="text-lg">Nenhum álbum encontrado.</p>
                        <p className="text-sm">Adicione imagens para criar álbuns automaticamente.</p>
                     </div>
                  )}
                </div>
              )}

              {/* View Mode: Photos */}
              {viewMode === 'photos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galeria.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="relative group bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-neon-green/50 transition-all"
                      >
                        <img
                          src={item.url}
                          alt={item.titulo}
                          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingPhoto(item)}
                            className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors transform hover:scale-110"
                            title="Editar imagem"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(item.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                            title="Excluir imagem"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        <div className="p-3 bg-black/40 backdrop-blur-sm absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform">
                          <h4 className="text-white font-medium truncate text-sm">{item.titulo}</h4>
                          <p className="text-white/60 text-xs">{item.categoria}</p>
                        </div>
                      </motion.div>
                    ))}
                     {galeria.length === 0 && (
                        <div className="col-span-full text-center py-12 text-white/40 border-2 border-dashed border-white/10 rounded-lg">
                            <p>Nenhuma foto neste álbum.</p>
                        </div>
                     )}
                  </div>
              )}
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
                          <img src={p.preview} alt="" className="w-full h-24 object-contain bg-black rounded" />
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
                  disabled={!pendingImages.length}
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
          {editingAlbum && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingAlbum(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-xl w-full border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Editar Álbum</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Nome</label>
                    <input
                      type="text"
                      value={albumForm.name}
                      onChange={(e) => setAlbumForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Data</label>
                    <input
                      type="date"
                      value={albumForm.date}
                      onChange={(e) => setAlbumForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Capa do Álbum</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files && e.target.files[0]
                        setAlbumForm(prev => ({ ...prev, coverFile: f || null }))
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingAlbum(null)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveAlbumEdits}
                    className="px-4 py-2 rounded-lg bg-neon-green text-black hover:bg-neon-green/90 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
          {editingPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Editar Imagem</h3>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Título</label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (!editingPhoto) return
                      await supabase.from('galeria').update({ titulo: photoTitle }).eq('storage_path', editingPhoto.id)
                      await loadGallery()
                      setEditingPhoto(null)
                    }}
                    className="px-4 py-2 rounded-lg bg-neon-green text-black hover:bg-neon-green/90 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
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

      {/* Modal Inicial de Vídeo (Evento e Data) */}
      <AnimatePresence>
        {showVideoInitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1a1a1a] rounded-xl border border-white/10 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowVideoInitModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <XIcon />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-neon-blue/20 text-neon-blue">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </span>
                Adicionar Vídeos
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    value={videoEventName}
                    onChange={(e) => setVideoEventName(e.target.value)}
                    placeholder="Ex: Culto de Jovens"
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">
                    Data do Evento
                  </label>
                  <input
                    type="date"
                    value={videoEventDate}
                    onChange={(e) => setVideoEventDate(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowVideoInitModal(false)}
                    className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!videoEventName || !videoEventDate}
                    onClick={() => {
                      setShowVideoInitModal(false)
                      document.getElementById('video-upload-input')?.click()
                    }}
                    className="px-6 py-2 rounded-lg bg-neon-blue text-black font-medium hover:bg-neon-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Continuar
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
