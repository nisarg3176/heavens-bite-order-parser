import { useCallback, useRef, useState } from 'react'
import {
  FileText,
  ImageIcon,
  MessageSquareText,
  Upload,
} from 'lucide-react'
import { extractFromImages, extractFromPaste, extractFromText } from '../api/client'
import type { ExtractedOrder, UploadMode } from '../types'

interface Props {
  mode: UploadMode
  onModeChange: (mode: UploadMode) => void
  loading: boolean
  onLoadingChange: (loading: boolean) => void
  onSuccess: (order: ExtractedOrder, savedId?: number | null) => void
  onResetResults: () => void
  onError: (error: string | null) => void
}

const MODES: { id: UploadMode; label: string; icon: typeof FileText; hint: string }[] = [
  { id: 'text', label: 'Chat Export', icon: FileText, hint: 'Upload one or more WhatsApp .txt exports' },
  { id: 'image', label: 'Screenshots', icon: ImageIcon, hint: 'Upload chat screenshot images' },
  { id: 'paste', label: 'Paste Text', icon: MessageSquareText, hint: 'Paste conversation directly' },
]

function SoftLoader() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse-soft" />
      <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
      <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
    </span>
  )
}

export default function UploadSection({
  mode,
  onModeChange,
  loading,
  onLoadingChange,
  onSuccess,
  onResetResults,
  onError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (!fileArray.length) return

      onLoadingChange(true)
      onError(null)
      onResetResults()

      try {
        if (mode === 'text') {
          const txtFiles = fileArray.filter((f) =>
            f.name.toLowerCase().endsWith('.txt'),
          )

          if (!txtFiles.length) {
            throw new Error('Please upload one or more .txt WhatsApp export files')
          }

          setSelectedFiles(txtFiles)

          const errors: string[] = []

          for (const file of txtFiles) {
            try {
              const result = await extractFromText(file)
              onSuccess(result.order, result.saved_order_id)
            } catch (err) {
              errors.push(
                `${file.name}: ${err instanceof Error ? err.message : 'failed'}`,
              )
            }
          }

          if (errors.length) {
            onError(`Some files failed — ${errors.join('; ')}`)
          }
        } else if (mode === 'image') {
          setSelectedFiles(fileArray)

          const result = await extractFromImages(fileArray)
          onSuccess(result.order, result.saved_order_id)
        }
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Extraction failed')
      } finally {
        onLoadingChange(false)
      }
    },
    [mode, onError, onLoadingChange, onResetResults, onSuccess],
  )

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      onError('Please paste a WhatsApp conversation')
      return
    }

    onLoadingChange(true)
    onError(null)
    onResetResults()

    try {
      const result = await extractFromPaste(pasteText)
      onSuccess(result.order, result.saved_order_id)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      onLoadingChange(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (mode !== 'paste' && e.dataTransfer.files.length) {
      processFiles(e.dataTransfer.files)
    }
  }

  return (
    <section className="glass rounded-4xl shadow-glass p-6 md:p-9 relative overflow-hidden">
      <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-peach/25 blur-3xl pointer-events-none" />

      <div className="relative flex flex-wrap gap-2 mb-7 p-1.5 rounded-full bg-cream-100/70 w-fit">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onModeChange(id)
              setSelectedFiles([])
              onError(null)
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-600 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink/60 ${
              mode === id
                ? 'bg-ivory text-ink shadow-soft'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'paste' ? (
        <div className="relative space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Paste your WhatsApp conversation here...

[12/06/2025, 10:30:15] Sarah Khan: Hi! I'd like to order 2 chocolate cupcakes
[12/06/2025, 10:31:02] Heaven's Bite Bakery: Sure! Delivery address?`}
            rows={10}
            className="w-full px-5 py-4 rounded-3xl border border-white/70 bg-ivory/70 shadow-inset focus:outline-none focus:ring-2 focus:ring-pink/40 focus:bg-ivory resize-y text-sm font-mono transition-all"
          />

          <button
            type="button"
            onClick={handlePasteSubmit}
            disabled={loading}
            className="btn-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-white font-600 shadow-lift hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink/60"
          >
            {loading ? <SoftLoader /> : <Upload className="w-5 h-5" />}
            Extract Order
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative rounded-4xl p-12 text-center cursor-pointer transition-all duration-500 overflow-hidden border ${
            dragOver
              ? 'border-pink bg-pink-soft/30 scale-[1.01] shadow-soft'
              : 'border-dashed border-peach/50 bg-ivory/40 hover:bg-ivory/70 hover:border-pink/60'
          }`}
        >
          <div className="absolute inset-0 bg-petals opacity-[0.06] group-hover:opacity-10 transition-opacity" />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={mode === 'text' ? '.txt' : 'image/*'}
            multiple={mode === 'image' || mode === 'text'}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />

          <div className="relative flex flex-col items-center gap-3">
            {loading ? (
              <>
                <div className="w-16 h-16 rounded-full border-4 border-pink-soft border-t-pink-deep animate-spin-slow" />
                <p className="font-display font-700 text-ink text-lg mt-1">
                  Preparing your order...
                </p>
                <p className="text-sm text-ink-soft">
                  AI is reading the conversation — just a few seconds
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-gradient-dawn flex items-center justify-center shadow-soft ring-1 ring-white/70 transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:rotate-3">
                  <Upload className="w-8 h-8 text-pink-deep" strokeWidth={2.2} />
                </div>

                <p className="font-display font-700 text-ink text-lg">
                  Drop {mode === 'text' ? 'your .txt export(s)' : 'screenshot(s)'} here or click to browse
                </p>

                <p className="text-sm text-ink-soft">
                  {MODES.find((m) => m.id === mode)?.hint}
                </p>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {selectedFiles.map((f) => (
                      <span key={f.name} className="text-xs px-3 py-1 rounded-full bg-sage-soft/60 text-sage-deep font-500">
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <p className="relative mt-5 text-xs text-ink-faint text-center">
        Tip: In WhatsApp, open the chat → ⋮ → More → Export chat → Without media
      </p>
    </section>
  )
}
