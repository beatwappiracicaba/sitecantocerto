import { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Preloader from '@/components/shared/Preloader'
import Header from '@/components/layout/Header'
import Hero from '@/components/shared/Hero'
import Agenda from '@/components/shared/Agenda'
import Galeria from '@/components/shared/Galeria'
import Footer from '@/components/layout/Footer'
import CursorEffect from '@/components/shared/CursorEffect'
import SectionSnap from '@/components/shared/SectionSnap'
import Dashboard from '@/components/admin/Dashboard'

type LoginPanelProps = {
  open: boolean
  onClose: () => void
}

function LoginPanel({ open, onClose }: LoginPanelProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const success = await login(email, password)
    if (success) {
      onClose()
      setEmail('')
      setPassword('')
    } else {
      setError('Credenciais inválidas')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black/85 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors text-sm"
        >
          Fechar
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center">Acesso Autorizado</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm text-center mb-4">{error}</div>
          )}
          <div className="text-left">
            <label className="block text-sm text-white/60 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="text-left">
            <label className="block text-sm text-white/60 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green/60"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full rounded-full bg-neon-green/90 px-4 py-2 text-sm font-semibold text-black hover:bg-neon-green transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, logout } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  // Se o usuário estiver logado e com cargo Membro, mostrar a dashboard
  if (user && user.role === 'Membro') {
    return <Dashboard onLogout={logout} />
  }

  // Se não estiver logado, mostrar o site normal
  return (
    <>
      <Preloader />
      <CursorEffect />
      <LoginPanel open={loginOpen} onClose={() => setLoginOpen(false)} />
      <div className="fixed inset-0 -z-10 bg-grain blur-3xl opacity-50" />
      <div className="noisy" />
      <main className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
        <Header onOpenLogin={() => setLoginOpen(true)} />
        
        <SectionSnap id="inicio">
          <Hero />
        </SectionSnap>

        <SectionSnap id="agenda">
          <Agenda />
        </SectionSnap>

        <SectionSnap id="galeria">
          <Galeria />
        </SectionSnap>

        <SectionSnap id="contato" className="bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Contato</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="shine rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-colors group">
                <div className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">WhatsApp</div>
                <div className="text-2xl font-light text-neon-green group-hover:scale-105 transition-transform origin-left">(19) 97155-3424</div>
              </div>
              <div className="shine rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-colors group">
                <div className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Endereço</div>
                <div className="text-2xl font-light text-neon-pink group-hover:scale-105 transition-transform origin-left">Av Armando Salles Nº 2572 • Piracicaba - SP</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 w-full">
            <Footer />
          </div>
        </SectionSnap>
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
