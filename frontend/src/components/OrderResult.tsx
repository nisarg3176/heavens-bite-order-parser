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
    <div className={`flex gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-cream-200 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-bakery-gold" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-bakery-brown/50 mb-0.5">{label}</p>
        <p className="text-bakery-brown font-medium break-words">
          {value || <span className="text-bakery-brown/40 italic">Not specified</span>}
        </p>
      </div>
    </div>
  )
}

const confidenceColors: Record<string, string> = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-red-100 text-red-800',
}

export default function OrderResult({ order }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-card border border-white overflow-hidden">
      <div className="px-6 py-5 border-b border-cream-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-cream-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bakery-rose/30 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-bakery-brown" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-bakery-brown">Extracted Order</h3>
            {order.raw_summary && (
              <p className="text-sm text-bakery-brown/60 mt-0.5">{order.raw_summary}</p>
            )}
          </div>
        </div>
        {order.confidence && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
              confidenceColors[order.confidence] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {order.confidence} confidence
          </span>
        )}
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        <Field icon={User} label="Customer Name" value={order.customer_name} />
        <Field icon={Phone} label="Phone Number" value={order.phone_number} />
        <Field icon={Calendar} label="Order Date" value={order.order_date} />
        <Field icon={Clock} label="Delivery Time" value={order.delivery_time} />
        <Field
          icon={MapPin}
          label="Delivery Address"
          value={order.delivery_address}
          className="md:col-span-2"
        />
        <Field
          icon={StickyNote}
          label="Special Instructions"
          value={order.special_instructions}
          className="md:col-span-2"
        />
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-bakery-gold" />
          <h4 className="font-semibold text-bakery-brown">Ordered Items</h4>
          <span className="text-xs bg-cream-200 px-2 py-0.5 rounded-full text-bakery-brown/70">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {order.items.length === 0 ? (
          <p className="text-bakery-brown/50 italic text-sm">No items detected in the conversation.</p>
        ) : (
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200"
              >
                <div>
                  <p className="font-medium text-bakery-brown">{item.name}</p>
                  {item.notes && (
                    <p className="text-sm text-bakery-brown/60 mt-0.5">{item.notes}</p>
                  )}
                </div>
                <span className="shrink-0 w-10 h-10 rounded-xl bg-bakery-gold/20 flex items-center justify-center font-bold text-bakery-brown">
                  ×{item.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
