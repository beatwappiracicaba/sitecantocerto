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
      const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        const items: VideoItem[] = (data as any[]).map((item) => ({
          id: item.storage_path || item.id,
          url: item.url
        }))
        setVideos(items)
      }
    }
    loadAlbums()
    loadVideos()
  }, [])

  useEffect(() => {
    const loadAlbumPhotos = async () => {
      if (!selectedAlbum) return
      const { data } = await supabase
        .from('galeria')
        .select('*')
        .eq('album_slug', selectedAlbum.slug)
        .order('created_at', { ascending: false })
      if (data) {
        const items: PhotoItem[] = (data as any[]).map((item) => ({
          id: item.storage_path || item.id,
          url: item.url
        }))
        setAlbumPhotos(items)
      }
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
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-left hover:bg-white/[0.06] transition-colors"
              >
                <div className="text-neon-blue font-bold tracking-wider text-sm uppercase mb-2">
                  {new Date(a.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-2xl font-medium text-white group-hover:text-neon-yellow transition-colors">
                  {a.name}
                </div>
                <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60 group-hover:border-neon-green/30 group-hover:text-neon-green transition-all">
                  Abrir álbum
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
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40"
              >
                <video src={v.url} controls className="w-full h-full rounded-3xl" />
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
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]"
              >
                <img src={p.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`${p.url}?download=true`}
                    className="rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-6 py-2 text-white font-medium tracking-wide"
                    download
                  >
                    Baixar
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
