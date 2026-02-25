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
  imagem?: string
  preco?: string
  compra_via?: 'site' | 'whatsapp'
  compra_info?: string
  ativo: boolean
}

export default function Agenda() {
  const [items, setItems] = useState<ShowItem[]>([])
  const [selected, setSelected] = useState<ShowItem | null>(null)

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
          imagem: s.imagem,
          preco: s.preco,
          compra_via: s.compra_via,
          compra_info: s.compra_info,
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
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-300"
            onClick={() => setSelected(it)}
          >
            {it.imagem && (
              <img src={it.imagem} alt={it.nome} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <div className="text-neon-blue font-bold tracking-wider text-sm uppercase mb-2">
                {new Date(it.data).toLocaleDateString('pt-BR')} • {it.hora}
              </div>
              <div className="text-2xl font-medium text-white group-hover:text-neon-yellow transition-colors">{it.nome}</div>
              <div className="mt-4 text-white/70 text-sm">{it.descricao || 'Show'}</div>
              <div className="mt-4 flex items-center gap-3">
                {it.preco && <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm">{it.preco}</span>}
                {it.compra_via === 'site' && it.compra_info && (
                  <a
                    href={it.compra_info}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-neon-green text.black text-black hover:bg-neon-green/90 transition-colors text-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    Comprar no Site
                  </a>
                )}
                {it.compra_via === 'whatsapp' && it.compra_info && (
                  <a
                    href={`https://wa.me/${it.compra_info.replace(/\\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-neon-pink text.black text-black hover:bg-neon-pink/90 transition-colors text-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    Comprar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-white/5 border border.white/10 rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">{selected.nome}</h3>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Fechar
              </button>
            </div>
            {selected.imagem && <img src={selected.imagem} alt={selected.nome} className="w-full h-64 object-cover rounded-lg mb-4" />}
            <div className="text-white/80 mb-3">{selected.descricao}</div>
            <div className="flex gap-3">
              {selected.preco && <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm">{selected.preco}</span>}
              {selected.compra_via === 'site' && selected.compra_info && (
                <a
                  href={selected.compra_info}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-neon-green text-black hover:bg-neon-green/90 transition-colors text-sm"
                >
                  Comprar no Site
                </a>
              )}
              {selected.compra_via === 'whatsapp' && selected.compra_info && (
                <a
                  href={`https://wa.me/${selected.compra_info.replace(/\\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-neon-pink text-black hover:bg-neon-pink/90 transition-colors text-sm"
                >
                  Comprar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
