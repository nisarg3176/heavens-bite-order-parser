import { Cake } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-bakery-gold/20 bg-white/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-bakery-gold to-bakery-rose flex items-center justify-center shadow-soft">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-bakery-brown leading-tight">
              Heaven&apos;s Bite Bakery
            </h1>
            <p className="text-xs text-bakery-brown/60 tracking-wide uppercase">
              Order Extractor
            </p>
          </div>
        </div>
        <span className="hidden sm:inline text-sm text-bakery-brown/50">
          POC · WhatsApp Order Automation
        </span>
      </div>
    </header>
  )
}
