import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  StickyNote,
  User,
} from 'lucide-react'
import type { ExtractedOrder } from '../types'

interface Props {
  order: ExtractedOrder
}

function Field({
  icon: Icon,
  label,
  value,
  className = '',
}: {
  icon: typeof User
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={`group flex gap-3.5 p-3.5 rounded-2xl transition-colors hover:bg-cream-100/70 ${className}`}>
      <div className="w-10 h-10 rounded-2xl bg-gradient-dawn flex items-center justify-center shrink-0 ring-1 ring-white/70 transition-transform group-hover:scale-105">
        <Icon className="w-4 h-4 text-pink-deep" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-[0.62rem] uppercase tracking-[0.16em] font-600 text-ink-faint mb-1">
          {label}
        </p>
        <p className="text-ink font-500 break-words leading-snug">
          {value || <span className="text-ink-faint italic font-400">Not specified</span>}
        </p>
      </div>
    </div>
  )
}

const confidenceColors: Record<string, string> = {
  high: 'bg-sage-soft/60 text-sage-deep ring-1 ring-sage/50',
  medium: 'bg-peach-soft/70 text-peach-deep ring-1 ring-peach/50',
  low: 'bg-pink-soft/60 text-pink-deep ring-1 ring-pink/50',
}

export default function OrderResult({ order }: Props) {
  const items = Array.isArray(order?.items) ? order.items : []

  return (
    <div className="glass rounded-4xl shadow-glass overflow-hidden animate-fade-up">
      <div className="px-7 py-6 border-b border-white/50 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-peach-soft/50 via-ivory/40 to-sage-soft/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-gradient-peach flex items-center justify-center ring-1 ring-white/70 shadow-soft">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-display text-xl font-700 text-ink leading-tight">
              Extracted Order
            </h3>
            {order?.raw_summary && (
              <p className="text-sm text-ink-soft mt-0.5">{order.raw_summary}</p>
            )}
          </div>
        </div>

        {order?.confidence && (
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-600 uppercase tracking-wide ${
              confidenceColors[order.confidence] || 'bg-cream-200 text-ink-soft'
            }`}
          >
            {order.confidence} confidence
          </span>
        )}
      </div>

      <div className="p-5 md:p-6 grid md:grid-cols-2 gap-1.5">
        <Field icon={User} label="Customer Name" value={order?.customer_name} />
        <Field icon={Phone} label="Phone Number" value={order?.phone_number} />
        <Field icon={Calendar} label="Order Date" value={order?.order_date} />
        <Field icon={Clock} label="Delivery Time" value={order?.delivery_time} />
        <Field icon={MapPin} label="Delivery Address" value={order?.delivery_address} className="md:col-span-2" />
        <Field icon={StickyNote} label="Special Instructions" value={order?.special_instructions} className="md:col-span-2" />
      </div>

      <div className="px-5 md:px-7 pb-7">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-pink-deep" />
          <h4 className="font-display font-700 text-ink">Ordered Items</h4>
          <span className="text-xs bg-cream-200/80 px-2.5 py-0.5 rounded-full text-ink-soft font-500">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 rounded-3xl bg-cream-100/60 border border-white/60">
            <p className="text-ink-faint italic text-sm">No items detected in the conversation.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item: any, idx: number) => (
              <div
                key={`${item?.name ?? 'item'}-${idx}`}
                className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-ivory/70 border border-white/70 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div>
                  <p className="font-600 text-ink">{item?.name ?? 'Unknown Item'}</p>
                  {item?.notes && <p className="text-sm text-ink-soft mt-0.5">{item.notes}</p>}
                </div>
                <span className="shrink-0 min-w-[2.75rem] h-11 px-3 rounded-2xl bg-gradient-peach flex items-center justify-center font-700 text-white ring-1 ring-white/60">
                  ×{item?.quantity ?? 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
