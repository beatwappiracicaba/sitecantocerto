'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

type PhotoItem = {
  id: string
  url: string
}

type Album = {
  slug: string
  name: string
  date: string
}

type VideoItem = {
  id: string
  url: string
  start_sec?: number
  end_sec?: number
  description?: string
}

export default function Galeria() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [albumPhotos, setAlbumPhotos] = useState<PhotoItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])

  useEffect(() => {
    const loadAlbums = async () => {
      const { data } = await supabase
        .from('albums')
        .select('*')
        .order('date', { ascending: false })
      setAlbums((data as Album[]) || [])
    }
    const loadVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
        if (!error && data) {
          const items: VideoItem[] = (data as any[]).map((item) => ({
            id: item.storage_path || item.id,
            url: item.url,
            start_sec: item.start_sec || undefined,
            end_sec: item.end_sec || undefined,
            description: item.description || undefined
          }))
          setVideos(items)
          return
        }
      } catch {}
      const list = await supabase.storage.from('gallery').list('videos', { limit: 12 } as any)
      const files = (list.data || []) as { name: string }[]
      const items: VideoItem[] = files.map((f) => {
        const pub = supabase.storage.from('gallery').getPublicUrl(`videos/${f.name}`)
        return { id: f.name, url: pub.data.publicUrl }
      })
      setVideos(items)
    }
    loadAlbums()
    loadVideos()
  }, [])

  useEffect(() => {
    const loadAlbumPhotos = async () => {
      if (!selectedAlbum) return
      try {
        const { data, error } = await supabase
          .from('galeria')
          .select('*')
          .eq('album_slug', selectedAlbum.slug)
          .order('created_at', { ascending: false })
        if (!error && data) {
          const items: PhotoItem[] = (data as any[]).map((item) => ({
            id: item.storage_path || item.id,
            url: item.url
          }))
          setAlbumPhotos(items)
          return
        }
      } catch {}
      const list = await supabase.storage.from('gallery').list(`events/${selectedAlbum.slug}`, { limit: 200 } as any)
      const files = (list.data || []) as { name: string }[]
      const items: PhotoItem[] = files.map((f) => {
        const pub = supabase.storage.from('gallery').getPublicUrl(`events/${selectedAlbum.slug}/${f.name}`)
        return { id: f.name, url: pub.data.publicUrl }
      })
      setAlbumPhotos(items)
    }
    loadAlbumPhotos()
  }, [selectedAlbum])

  return (
    <div className="mx-auto max-w-6xl px-6 w-full">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold text-center mb-12"
      >
        Galeria Surreal
      </motion.h2>
      
      {!selectedAlbum && (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {albums.map((a, i) => (
              <motion.button
                key={a.slug}
                onClick={() => setSelectedAlbum(a)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
                className="group relative overflow-hidden rounded-3xl p-1 text-left"
                style={{ backgroundImage: 'linear-gradient(90deg,#fde047,#facc15,#fde047)', boxShadow: '0 0 16px rgba(250, 204, 21, 0.5)' }}
                animate={{
                  boxShadow: [
                    '0 0 12px rgba(250, 204, 21, 0.35)',
                    '0 0 20px rgba(250, 204, 21, 0.6)',
                    '0 0 12px rgba(250, 204, 21, 0.35)'
                  ]
                }}
              >
                <div className="rounded-[20px] bg-white/[0.02] p-6 hover:bg-white/[0.06] transition-colors">
                <div className="text-neon-blue font-bold tracking-wider text-sm uppercase mb-2">
                  {new Date(a.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-2xl font-medium text-white group-hover:text-neon-yellow transition-colors">
                  {a.name}
                </div>
                <div className="mt-4 inline-flex items-center rounded-full border border-yellow-400 bg-black/40 px-4 py-1.5 text-sm text-yellow-300">
                  Abrir álbum
                </div>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mt-16 mb-8"
          >
            Últimos momentos registrados
          </motion.h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
                className="relative overflow-hidden rounded-3xl bg-black/40 p-1"
                style={{ backgroundImage: 'linear-gradient(90deg,#fde047,#facc15,#fde047)', boxShadow: '0 0 16px rgba(250, 204, 21, 0.5)' }}
                animate={{
                  boxShadow: [
                    '0 0 12px rgba(250, 204, 21, 0.35)',
                    '0 0 20px rgba(250, 204, 21, 0.6)',
                    '0 0 12px rgba(250, 204, 21, 0.35)'
                  ]
                }}
              >
                <div className="rounded-3xl bg-black">
                  <video
                    src={v.url}
                    controls
                    className="w-full h-full rounded-3xl"
                    onLoadedMetadata={(e) => {
                      const el = e.currentTarget as HTMLVideoElement
                      if (typeof v.start_sec === 'number') el.currentTime = v.start_sec
                    }}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget as HTMLVideoElement
                      if (typeof v.end_sec === 'number' && el.currentTime > v.end_sec) el.pause()
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {selectedAlbum && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedAlbum.name}</h3>
              <p className="text-white/60">{new Date(selectedAlbum.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <button
              onClick={() => setSelectedAlbum(null)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              Voltar
            </button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {albumPhotos.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5, boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
                className="group relative aspect-[4/3] overflow-hidden rounded-3xl p-1"
                style={{ backgroundImage: 'linear-gradient(90deg,#fde047,#facc15,#fde047)', boxShadow: '0 0 16px rgba(250, 204, 21, 0.5)' }}
                animate={{
                  boxShadow: [
                    '0 0 12px rgba(250, 204, 21, 0.35)',
                    '0 0 20px rgba(250, 204, 21, 0.6)',
                    '0 0 12px rgba(250, 204, 21, 0.35)'
                  ]
                }}
              >
                <div className="absolute inset-0 rounded-[22px] bg-black" />
                <div className="relative inset-0 w-full h-full rounded-[22px] overflow-hidden">
                  <img src={p.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={`${p.url}?download=true`}
                      className="rounded-full border border-yellow-400 bg-black/40 backdrop-blur-md px-6 py-2 text-yellow-300 font-medium tracking-wide"
                      download
                    >
                      Baixar
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
