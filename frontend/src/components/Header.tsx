import { Croissant } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-peach flex items-center justify-center shadow-soft ring-1 ring-white/70 transition-transform duration-500 hover:rotate-6">
              <Croissant className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sage ring-2 ring-ivory" />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-xl sm:text-[1.4rem] font-700 text-ink">
              Heaven&apos;s Bite
            </h1>
            <p className="font-body text-[0.68rem] font-500 tracking-[0.26em] uppercase text-ink-faint">
              Order Studio
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full glass-soft text-sm text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-sage-deep animate-pulse-soft" />
          Internal order desk
        </div>
      </div>
    </header>
  )
}
