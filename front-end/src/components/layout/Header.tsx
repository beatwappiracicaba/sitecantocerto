import { useCallback, useState, useEffect } from 'react'

type HeaderProps = {
  onOpenLogin: () => void
}

export default function Header({ onOpenLogin }: HeaderProps) {
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
      <div className="mx-auto max-w-6xl px-6 flex items-center justify-between gap-4">
        <button onClick={scrollTop} className="flex items-center group" aria-label="Canto Certo - Início">
          <img
            src={scrolled ? '/images/CANTOBRANCO.png' : '/images/CANTOAMARELO.png'}
            alt="Canto Certo"
            width={140}
            height={48}
            className={`h-12 w-auto group-hover:scale-105 transition-transform ${scrolled ? 'drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]' : 'drop-shadow-[0_0_12px_rgba(255,227,89,0.35)]'}`}
            loading="eager"
          />
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenLogin}
            className="md:hidden inline-flex items-center rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm hover:bg-white/10 hover:text-neon-green transition-colors"
          >
            Entrar
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#contato" className="text-white/70 hover:text-neon-green transition-colors font-medium">Contato</a>
            <a href="#galeria" className="text-white/70 hover:text-neon-pink transition-colors font-medium">Galeria</a>
            <a href="#agenda" className="shine inline-flex items-center rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105">
              Próximos Shows
            </a>
            <button
              onClick={onOpenLogin}
              className="text-white/70 hover:text-neon-green transition-colors font-medium"
            >
              Entrar
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
