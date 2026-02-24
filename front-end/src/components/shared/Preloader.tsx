import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Preloader() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Mantém o preloader por 2.5s para garantir que as fontes/imagens carreguem e o usuário veja a marca
    const timer = setTimeout(() => setShow(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-20 border-t border-r border-neon-yellow/20 rounded-full blur-xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-32 border-b border-l border-neon-pink/10 rounded-full blur-2xl"
            />
            
            <motion.img
              src="/images/CANTOAMARELO.png"
              alt="Canto Certo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative z-10 w-64 h-auto drop-shadow-[0_0_30px_rgba(255,227,89,0.2)]"
            />
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="absolute -bottom-8 left-0 h-[2px] bg-gradient-to-r from-transparent via-neon-yellow to-transparent"
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-12 text-white/40 text-sm tracking-[0.2em] uppercase font-light"
          >
            Carregando Experiência
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
