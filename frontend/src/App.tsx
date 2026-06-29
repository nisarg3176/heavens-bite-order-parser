import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
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
    <div className="min-h-screen gradient-bakery">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {aiConfigured === false && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI API key not configured</p>
              <p className="text-sm mt-1 opacity-90">
                Copy <code className="bg-amber-100 px-1 rounded">backend/.env.example</code> to{' '}
                <code className="bg-amber-100 px-1 rounded">backend/.env</code> and add your Gemini or OpenAI key.
              </p>
            </div>
          </div>
        )}

        <section className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-bakery-gold/30 text-sm text-bakery-brown mb-4">
            <Sparkles className="w-4 h-4 text-bakery-gold" />
            WhatsApp → Structured Orders
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-bakery-brown mb-3">
            Turn chats into bakery orders
          </h2>
          <p className="text-bakery-brown/70 leading-relaxed">
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
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {extractedOrders.length > 0 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-bakery-sage">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">
                {extractedOrders.length === 1
                  ? 'Order extracted successfully'
                  : `${extractedOrders.length} orders extracted successfully`}
              </span>
            </div>

            {extractedOrders.map((entry, i) => (
              <div key={i} className="space-y-2">
                {extractedOrders.length > 1 && (
                  <p className="text-sm font-medium text-bakery-brown/70">
                    Order {i + 1}
                    {entry.savedId ? ` · Saved as #${entry.savedId}` : ''}
                  </p>
                )}
                <OrderResult order={entry.order} />
              </div>
            ))}
          </div>
        )}

        <StatisticsPanel statistics={statistics} loading={!statistics} />

        <OrderHistory recentOrders={statistics?.recent_orders ?? []} />

        <footer className="text-center py-8 text-bakery-brown/50 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="w-4 h-4" />
            <span>Heaven&apos;s Bite Bakery — Order Extractor POC</span>
          </div>
          <p>Built for student demonstration · FastAPI + React + Gemini AI</p>
        </footer>
      </main>
    </div>
  )
}

export default App
