'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

type PhotoItem = {
  id: string
  url: string
}

export default function Galeria() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])

  useEffect(() => {
    const load = async () => {
      const list = await supabase.storage.from('gallery').list('', { limit: 60 })
      const files = list.data || []
      const items: PhotoItem[] = files.map(f => {
        const pub = supabase.storage.from('gallery').getPublicUrl(f.name)
        return { id: f.name, url: pub.data.publicUrl }
      })
      setPhotos(items)
    }
    load()
  }, [])

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
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05, rotate: Math.random() * 2 - 1 }}
            className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] cursor-none"
          >
            <img src={p.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-[radial-gradient(transparent,black)] opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            <motion.div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-6 py-2 text-white font-medium tracking-wide">
                Ver Foto
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
