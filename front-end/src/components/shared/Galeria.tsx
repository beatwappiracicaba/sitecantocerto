'use client'
import { motion } from 'framer-motion'

const photos = [
  { id: 1, color: 'from-neon-pink to-neon-blue' },
  { id: 2, color: 'from-neon-green to-neon-pink' },
  { id: 3, color: 'from-neon-blue to-neon-green' },
  { id: 4, color: 'from-neon-yellow to-neon-pink' },
  { id: 5, color: 'from-neon-pink to-neon-yellow' },
  { id: 6, color: 'from-neon-blue to-neon-yellow' }
]

export default function Galeria() {
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
            <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
            <div className="absolute inset-0 bg-[radial-gradient(transparent,black)] opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
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
