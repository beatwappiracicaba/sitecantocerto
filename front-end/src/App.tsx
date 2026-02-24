import Preloader from '@/components/shared/Preloader'
import Header from '@/components/layout/Header'
import Hero from '@/components/shared/Hero'
import Agenda from '@/components/shared/Agenda'
import Galeria from '@/components/shared/Galeria'
import Footer from '@/components/layout/Footer'
import CursorEffect from '@/components/shared/CursorEffect'
import SectionSnap from '@/components/shared/SectionSnap'

export default function App() {
  return (
    <>
      <Preloader />
      <CursorEffect />
      <div className="fixed inset-0 -z-10 bg-grain blur-3xl opacity-50" />
      <div className="noisy" />
      <main className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
        <Header />
        
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
                <div className="text-2xl font-light text-neon-green group-hover:scale-105 transition-transform origin-left">+55 (99) 99999-9999</div>
              </div>
              <div className="shine rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-colors group">
                <div className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Endereço</div>
                <div className="text-2xl font-light text-neon-pink group-hover:scale-105 transition-transform origin-left">Rua do Forró, 123 • Brasil</div>
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
