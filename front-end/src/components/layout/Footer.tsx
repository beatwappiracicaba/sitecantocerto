export default function Footer() {
  return (
    <footer className="w-full">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white/40 text-sm">© {new Date().getFullYear()} Canto Certo. Todos os direitos reservados.</div>
        <div className="flex items-center gap-6 text-white/40 text-sm">
          <a href="#" className="hover:text-neon-pink transition-colors">Instagram</a>
          <a href="#" className="hover:text-neon-blue transition-colors">TikTok</a>
          <a href="#" className="hover:text-neon-green transition-colors">YouTube</a>
        </div>
      </div>
    </footer>
  )
}
