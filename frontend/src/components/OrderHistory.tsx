import {
  History,
  ImageIcon,
  FileText,
  Trash2,
  Pencil,
} from 'lucide-react'

import { deleteOrder } from '../api/client'
import type { OrderRecord } from '../types'

interface Props {
  recentOrders: OrderRecord[]
  onRefresh: () => Promise<void>
}

export default function OrderHistory({
  recentOrders,
  onRefresh,
}: Props) {
  if (recentOrders.length === 0) return null

  const handleDelete = async (id: number) => {
  const confirmed = window.confirm(
    'Delete this order?'
  )

  if (!confirmed) return

  try {
    await deleteOrder(id)
    await onRefresh()
  } catch {
    alert('Failed to delete order')
  }
}

  return (
    <section className="bg-white/60 backdrop-blur rounded-3xl p-6 border border-white shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-bakery-gold" />
        <h3 className="font-display text-xl font-bold text-bakery-brown">Recent Orders</h3>
      </div>

      <div className="space-y-3">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-2xl bg-cream-50 border border-cream-200"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-bakery-brown/40">#{order.id}</span>
                {order.source_type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-bakery-brown/40" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-bakery-brown/40" />
                )}
              </div>
              <p className="font-medium text-bakery-brown">
                {order.customer_name || 'Unknown Customer'}
              </p>
              <p className="text-sm text-bakery-brown/60 mt-0.5 truncate">
                {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') || 'No items'}
              </p>
            </div>
<div className="text-right text-sm text-bakery-brown/50 shrink-0">
  <div className="flex gap-2 justify-end mb-2">
    <button
      className="p-2 rounded-lg bg-white border"
      title="Edit"
    >
      <Pencil className="w-4 h-4" />
    </button>

    <button
      onClick={() => handleDelete(order.id)}
      className="p-2 rounded-lg bg-red-50 border border-red-200"
      title="Delete"
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </button>
  </div>

  <p>{order.order_date || '—'}</p>

  {order.delivery_time && (
    <p className="text-xs mt-0.5">
      {order.delivery_time}
    </p>
  )}
</div>
          </div>
        ))}
      </div>
    </section>
  )
}
