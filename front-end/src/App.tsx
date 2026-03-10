import { useState } from 'react'
import { motion } from 'framer-motion'
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

        <SectionSnap id="contato" className="relative bg-black/40 backdrop-blur-md overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[120px]" />
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-[120px]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 w-full h-full flex flex-col justify-center relative z-10 py-10 md:py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-10 md:mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                Fale Conosco
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Entre em contato para reservas e informações ou venha nos visitar.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Contact Info */}
              <div className="space-y-6">
                <motion.a 
                  href="https://wa.me/5519971553424"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="block group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all hover:border-neon-green/30 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.15)]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
                    <svg className="w-16 h-16 text-neon-green" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-neon-green/10 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform duration-300 border border-neon-green/20">
                      <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-white/50 font-medium uppercase tracking-wider text-xs md:text-sm mb-1">WhatsApp / Reservas</h3>
                      <p className="text-xl md:text-3xl font-light text-white group-hover:text-neon-green transition-colors">(19) 97155-3424</p>
                    </div>
                  </div>
                </motion.a>

                <motion.a 
                  href="https://maps.google.com/?q=Av+Armando+Salles+de+Oliveira+2572+Piracicaba"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="block group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all hover:border-neon-pink/30 hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.15)]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
                    <svg className="w-16 h-16 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-neon-pink/10 flex items-center justify-center text-neon-pink group-hover:scale-110 transition-transform duration-300 border border-neon-pink/20">
                      <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-white/50 font-medium uppercase tracking-wider text-xs md:text-sm mb-1">Localização</h3>
                      <p className="text-lg md:text-xl font-light text-white group-hover:text-neon-pink transition-colors leading-tight">
                        Av. Armando Salles, 2572<br />
                        <span className="text-sm md:text-base text-white/50">Piracicaba - SP</span>
                      </p>
                    </div>
                  </div>
                </motion.a>
              </div>

              {/* Map */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 group"
              >
                <iframe 
                  src="https://maps.google.com/maps?q=Av+Armando+Salles+de+Oliveira+2572+Piracicaba&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(100%) invert(90%) opacity(0.8)' }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="group-hover:filter-none group-hover:opacity-100 transition-all duration-700"
                />
                
                {/* Map Overlay Gradient */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 w-full z-20">
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
