import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Croissant,
  Sparkles,
} from 'lucide-react'
import { checkHealth, fetchStatistics } from './api/client'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import OrderResult from './components/OrderResult'
import StatisticsPanel from './components/StatisticsPanel'
import OrderHistory from './components/OrderHistory'
import type { ExtractedOrder, Statistics, UploadMode } from './types'

interface ExtractedEntry {
  order: ExtractedOrder
  savedId: number | null
}

function BackgroundDecor() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-petals" />
      <div className="blob w-[26rem] h-[26rem] bg-peach/40 -top-24 -left-24 animate-float" />
      <div className="blob w-[22rem] h-[22rem] bg-pink/30 top-1/3 -right-28 animate-float-slow" />
      <div className="blob w-[24rem] h-[24rem] bg-sage-soft/50 -bottom-28 left-1/4 animate-float" style={{ animationDelay: '3s' }} />
    </div>
  )
}

function WaveDivider({ flip = false, className = '' }: { flip?: boolean; className?: string }) {
  return (
    <div className={`w-full leading-none ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className={`w-full h-12 md:h-16 ${flip ? 'rotate-180' : ''}`}
      >
        <path
          d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,45 L1440,90 L0,90 Z"
          fill="rgba(255,253,249,0.55)"
        />
        <path
          d="M0,55 C260,95 520,25 780,50 C1040,75 1240,35 1440,60 L1440,90 L0,90 Z"
          fill="rgba(248,220,200,0.35)"
        />
      </svg>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState<UploadMode>('text')
  const [extractedOrders, setExtractedOrders] = useState<ExtractedEntry[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null)

  const loadStatistics = async () => {
    try {
      const stats = await fetchStatistics()
      setStatistics(stats)
    } catch {
      // Statistics are optional on first load
    }
  }

  useEffect(() => {
    checkHealth()
  .then(() => setAiConfigured(true))
  .catch(() => setAiConfigured(false))
    loadStatistics()
  }, [])

  const handleExtractSuccess = (order: ExtractedOrder, orderId?: number | null) => {
    setExtractedOrders((prev) => [...prev, { order, savedId: orderId ?? null }])
    setError(null)
    loadStatistics()
  }

  const handleResetResults = () => {
    setExtractedOrders([])
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12 reveal">
        {aiConfigured === false && (
          <div className="flex items-start gap-3 p-4 rounded-3xl glass border border-peach/40 text-ink shadow-soft">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-peach-deep" />
            <div>
              <p className="font-600">AI API key not configured</p>
              <p className="text-sm mt-1 text-ink-soft">
                Copy <code className="bg-cream-200 px-1.5 py-0.5 rounded-md">backend/.env.example</code> to{' '}
                <code className="bg-cream-200 px-1.5 py-0.5 rounded-md">backend/.env</code> and add your Gemini or OpenAI key.
              </p>
            </div>
          </div>
        )}

        <section className="relative text-center max-w-2xl mx-auto pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-pink-deep mb-6 shadow-soft">
            <Sparkles className="w-4 h-4 text-peach-deep" />
            WhatsApp → Structured Orders
          </div>
          <p className="font-display italic text-xl text-pink-deep mb-2">handcrafted order-keeping,</p>
          <h2 className="font-display text-4xl md:text-[3.4rem] font-800 text-ink leading-[1.04] mb-5">
            Turn chats into <span className="text-gradient">bakery orders</span>
          </h2>
          <p className="text-ink-soft leading-relaxed max-w-xl mx-auto">
            Upload one or more exported WhatsApp chats, paste a conversation, or drop screenshots.
            Our AI extracts customer details, items, delivery info, and special instructions instantly.
          </p>
        </section>

        <UploadSection
          mode={mode}
          onModeChange={setMode}
          loading={loading}
          onLoadingChange={setLoading}
          onSuccess={handleExtractSuccess}
          onResetResults={handleResetResults}
          onError={setError}
        />

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-3xl glass border border-pink/40 text-pink-deep shadow-soft animate-pop-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {extractedOrders.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sage-deep font-600 animate-pop-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {extractedOrders.length === 1
                  ? 'Order extracted successfully'
                  : `${extractedOrders.length} orders extracted successfully`}
              </span>
            </div>

            {extractedOrders.map((entry, i) => (
              <div key={i} className="space-y-2">
                {extractedOrders.length > 1 && (
                  <p className="font-display text-sm font-600 text-pink-deep">
                    Order {i + 1}
                    {entry.savedId ? ` · Saved as #${entry.savedId}` : ''}
                  </p>
                )}
                <OrderResult order={entry.order} />
              </div>
            ))}
          </div>
        )}

        <WaveDivider className="opacity-90" />

        <StatisticsPanel statistics={statistics} loading={!statistics} />

        <OrderHistory
  recentOrders={statistics?.recent_orders ?? []}
  onRefresh={loadStatistics}
/>

        <footer className="text-center pt-6 pb-10 text-ink-faint text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Croissant className="w-4 h-4 text-peach-deep" />
            <span className="font-display font-600 text-ink-soft">
              Heaven&apos;s Bite Bakery — Order Extractor POC
            </span>
          </div>
          <p>Built for student demonstration · FastAPI + React + Gemini AI</p>
        </footer>
      </main>
    </div>
  )
}

export default App
