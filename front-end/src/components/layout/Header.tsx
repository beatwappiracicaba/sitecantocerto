import { useCallback, useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg border-b border-white/5' : 'py-6'}`}>
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
        <button onClick={scrollTop} className="flex items-center group" aria-label="Canto Certo - Início">
          <img
            src={scrolled ? '/images/CANTOBRANCO.png' : '/images/CANTOAMARELO.png'}
            alt="Canto Certo"
            width={140}
            height={48}
            className={`block h-12 w-auto group-hover:scale-105 transition-transform ${scrolled ? 'drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]' : 'drop-shadow-[0_0_12px_rgba(255,227,89,0.35)]'}`}
            loading="eager"
          />
        </button>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#agenda" className="text-white/70 hover:text-neon-green transition-colors font-medium">Agenda</a>
          <a href="#galeria" className="text-white/70 hover:text-neon-pink transition-colors font-medium">Galeria</a>
          <a href="#contato" className="shine inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105">
            Reservar Mesa
          </a>
        </nav>
      </div>
    </header>
  )
}
