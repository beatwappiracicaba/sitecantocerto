import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/casadeshow.png" 
          alt="Casa de Show" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>
      
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 pointer-events-none z-5"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vmin] h-[140vmin] rounded-full blur-[120px] opacity-40 mix-blend-screen pulse" style={{ background: 'radial-gradient(circle, rgba(255,46,146,0.5) 0%, rgba(37,194,255,0.5) 35%, rgba(53,255,157,0.5) 70%, transparent 75%)' }} />
      </motion.div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tight leading-tight text-white drop-shadow-2xl"
        >
          Forró de<br />Outro Mundo
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium drop-shadow-lg"
        >
          Sinta o ritmo pulsar, brilhe nas luzes e viva uma experiência surreal.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a href="#agenda" className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform duration-300">
            <span className="relative z-10">Próximas atrações</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-pink via-neon-blue to-neon-green opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 -z-10" />
          </a>
          
          <a href="#galeria" className="group px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300">
            Explorar Galeria
          </a>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-sm"
      >
        <span>Role para descobrir</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  )
}
