import { ReactNode } from 'react'

interface SectionSnapProps {
  children: ReactNode
  id?: string
  className?: string
}

export default function SectionSnap({ children, id, className = '' }: SectionSnapProps) {
  return (
    <section id={id} className={`section-snap w-full py-20 relative ${className}`}>
      {children}
    </section>
  )
}
