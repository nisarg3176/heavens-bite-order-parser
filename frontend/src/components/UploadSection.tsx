import { useCallback, useRef, useState } from 'react'
import {
  FileText,
  ImageIcon,
  Loader2,
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
  {
    id: 'text',
    label: 'Chat Export',
    icon: FileText,
    hint: 'Upload one or more WhatsApp .txt exports',
  },
  {
    id: 'image',
    label: 'Screenshots',
    icon: ImageIcon,
    hint: 'Upload chat screenshot images',
  },
  {
    id: 'paste',
    label: 'Paste Text',
    icon: MessageSquareText,
    hint: 'Paste conversation directly',
  },
]

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
    <section className="bg-white/80 backdrop-blur rounded-3xl shadow-card border border-white p-6 md:p-8">
      <div className="flex flex-wrap gap-2 mb-6">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              onModeChange(id)
              setSelectedFiles([])
              onError(null)
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === id
                ? 'bg-bakery-brown text-white shadow-soft'
                : 'bg-cream-100 text-bakery-brown/70 hover:bg-cream-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'paste' ? (
        <div className="space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Paste your WhatsApp conversation here...

[12/06/2025, 10:30:15] Sarah Khan: Hi! I'd like to order 2 chocolate cupcakes
[12/06/2025, 10:31:02] Heaven's Bite Bakery: Sure! Delivery address?`}
            rows={10}
            className="w-full px-4 py-3 rounded-2xl border border-bakery-gold/30 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-bakery-gold/50 resize-y text-sm font-mono"
          />

          <button
            type="button"
            onClick={handlePasteSubmit}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bakery-brown text-white font-medium hover:bg-bakery-brown/90 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
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
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-bakery-gold bg-cream-100 scale-[1.01]'
              : 'border-bakery-gold/40 hover:border-bakery-gold hover:bg-cream-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={mode === 'text' ? '.txt' : 'image/*'}
            multiple={mode === 'image' || mode === 'text'}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />

          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <>
                <Loader2 className="w-12 h-12 text-bakery-gold animate-spin" />
                <p className="font-medium text-bakery-brown">
                  AI is reading your conversation...
                </p>
                <p className="text-sm text-bakery-brown/60">
                  This usually takes a few seconds
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cream-200 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-bakery-gold" />
                </div>

                <p className="font-medium text-bakery-brown">
                  Drop {mode === 'text' ? 'your .txt export(s)' : 'screenshot(s)'} here or click to browse
                </p>

                <p className="text-sm text-bakery-brown/60">
                  {MODES.find((m) => m.id === mode)?.hint}
                </p>

                {selectedFiles.length > 0 && (
                  <p className="text-xs text-bakery-sage mt-2">
                    Last upload: {selectedFiles.map((f) => f.name).join(', ')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-bakery-brown/50 text-center">
        Tip: In WhatsApp, open the chat → ⋮ → More → Export chat → Without media
      </p>
    </section>
  )
}
