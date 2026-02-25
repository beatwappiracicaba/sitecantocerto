'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

type ShowItem = {
  id: string
  nome: string
  data: string
  hora: string
  descricao?: string
  ativo: boolean
}

export default function Agenda() {
  const [items, setItems] = useState<ShowItem[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('shows')
        .select('*')
        .eq('ativo', true)
        .order('data', { ascending: true })
        .order('hora', { ascending: true })
      if (data) {
        const mapped = data.map((s: any) => ({
          id: s.id?.toString?.() || s.id,
          nome: s.nome,
          data: s.data,
          hora: s.hora,
          descricao: s.descricao,
          ativo: s.ativo ?? true
        })) as ShowItem[]
        setItems(mapped)
      }
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
        Próximos Shows
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5, ease: 'backOut' }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.08] transition-colors duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-pink/20 transition-colors" />
            <div className="text-neon-blue font-bold tracking-wider text-sm uppercase mb-2">
              {new Date(it.data).toLocaleDateString('pt-BR')} • {it.hora}
            </div>
            <div className="text-2xl font-medium text-white group-hover:text-neon-yellow transition-colors">{it.nome}</div>
            <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60 group-hover:border-neon-green/30 group-hover:text-neon-green transition-all">
              {it.descricao || 'Show'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
