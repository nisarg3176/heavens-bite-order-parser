import { useState } from 'react'

import toast from 'react-hot-toast'

import {
  History,
  ImageIcon,
  FileText,
  Trash2,
  Pencil,
  Search,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react'

import {
  deleteOrder,
  updateOrder,
} from '../api/client'
import type { OrderRecord } from '../types'

interface Props {
  recentOrders: OrderRecord[]
  onRefresh: () => Promise<void>
}

export default function OrderHistory({
  recentOrders,
  onRefresh,
}: Props) {

  const [editingOrder, setEditingOrder] =
  useState<OrderRecord | null>(null)

  const [search, setSearch] = useState('')

  if (recentOrders.length === 0) return null

  const handleDelete = async (id: number) => {
  const confirmed = window.confirm(
    'Delete this order?'
  )

  if (!confirmed) return

  try {
    await deleteOrder(id)

toast.success('Order deleted successfully')

await onRefresh()
  } catch {
    toast.error('Failed to delete order')
  }
}

const handleSave = async () => {
  if (!editingOrder) return

  try {
    await updateOrder(editingOrder.id, editingOrder)

    toast.success('Order updated successfully')

    setEditingOrder(null)

    await onRefresh()
  } catch {
    toast.error('Failed to update order')
  }
}

  const modalInput =
    'w-full border border-white/70 bg-ivory/70 shadow-inset px-4 py-3 rounded-2xl mb-3 focus:outline-none focus:ring-2 focus:ring-pink/40 focus:bg-ivory transition-all'

  const query = search.trim().toLowerCase()

  const matched = recentOrders.filter((order) =>
    (order.customer_name ?? '').toLowerCase().includes(query),
  )

  const filtered = query ? matched : recentOrders.slice(0, 5)

  return (
    <section className="glass rounded-4xl p-6 md:p-8 shadow-glass">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-9 h-9 rounded-2xl bg-gradient-peach flex items-center justify-center ring-1 ring-white/60">
          <History className="w-5 h-5 text-white" strokeWidth={2.2} />
        </span>
        <h3 className="font-display text-2xl font-700 text-ink">Recent Orders</h3>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-white/70 bg-ivory/60 rounded-full pl-11 pr-4 py-3 shadow-inset focus:outline-none focus:ring-2 focus:ring-pink/40 focus:bg-ivory transition-all"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="hover-lift flex flex-col gap-3 p-5 rounded-3xl bg-ivory/70 border border-white/70 shadow-soft hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-ink-faint">#{order.id}</span>
                  <span className={`inline-flex items-center gap-1 text-[0.65rem] font-500 px-2 py-0.5 rounded-full ${
                    order.source_type === 'image'
                      ? 'bg-pink-soft/60 text-pink-deep'
                      : 'bg-sage-soft/60 text-sage-deep'
                  }`}>
                    {order.source_type === 'image' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {order.source_type === 'image' ? 'Screenshot' : 'Chat export'}
                  </span>
                </div>
                <p className="font-600 text-ink truncate">
                  {order.customer_name || 'Unknown Customer'}
                </p>
                <p className="text-sm text-ink-soft mt-0.5 line-clamp-2">
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') || 'No items'}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingOrder(order)}
                  className="p-2.5 rounded-2xl bg-white/80 border border-white text-pink-deep hover:bg-cream-100 hover:-translate-y-0.5 transition-all"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="p-2.5 rounded-2xl bg-pink-soft/40 border border-pink/30 text-pink-deep hover:bg-pink-soft/70 hover:-translate-y-0.5 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint pt-1 border-t border-cream-200/70">
              <span>{order.order_date || '—'}</span>
              {order.phone_number && (
                <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{order.phone_number}</span>
              )}
              {order.delivery_time && (
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{order.delivery_time}</span>
              )}
              {order.delivery_address && (
                <span className="inline-flex items-center gap-1 min-w-0 max-w-full truncate"><MapPin className="w-3 h-3 shrink-0" />{order.delivery_address}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-ink-faint py-8">
          No orders match “{search}”.
        </p>
      )}

      {editingOrder && (
        <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-4xl p-6 md:p-7 w-full max-w-md shadow-card animate-pop-in">
            <h3 className="font-display text-xl font-700 text-ink mb-5">
              Edit Order #{editingOrder.id}
            </h3>

            <input
              className={modalInput}
              placeholder="Customer Name"
              value={editingOrder.customer_name ?? ''}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, customer_name: e.target.value })
              }
            />
            <input
              className={modalInput}
              placeholder="Phone Number"
              value={editingOrder.phone_number ?? ''}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, phone_number: e.target.value })
              }
            />
            <input
              className={modalInput}
              placeholder="Delivery Address"
              value={editingOrder.delivery_address ?? ''}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, delivery_address: e.target.value })
              }
            />
            <input
              className={modalInput}
              placeholder="Delivery Time"
              value={editingOrder.delivery_time ?? ''}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, delivery_time: e.target.value })
              }
            />
            <textarea
              rows={3}
              className={`${modalInput} resize-y`}
              placeholder="Special Instructions"
              value={editingOrder.special_instructions ?? ''}
              onChange={(e) =>
                setEditingOrder({ ...editingOrder, special_instructions: e.target.value })
              }
            />

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSave}
                className="btn-gradient text-white font-600 px-6 py-3 rounded-full shadow-lift hover:-translate-y-0.5 transition-all"
              >
                Save changes
              </button>
              <button
                onClick={() => setEditingOrder(null)}
                className="border border-white/70 bg-ivory/60 text-ink-soft px-6 py-3 rounded-full hover:bg-cream-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
