import { useState } from 'react'

import toast from 'react-hot-toast'

import {
  History,
  ImageIcon,
  FileText,
  Trash2,
  Pencil,
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

  return (
    <section className="bg-white/60 backdrop-blur rounded-3xl p-6 border border-white shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-bakery-gold" />
        <h3 className="font-display text-xl font-bold text-bakery-brown">Recent Orders</h3>
      </div>

<input
  type="text"
  placeholder="Search customer..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full border rounded-xl px-3 py-2 mb-4"
/>

      <div className="space-y-3">
        {recentOrders
  .filter((order) =>
    (order.customer_name ?? '')
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .map((order) => (
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
  onClick={() => setEditingOrder(order)}
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

  {order.phone_number && (
  <p className="text-xs">
    {order.phone_number}
  </p>
)}

{order.delivery_address && (
  <p className="text-xs">
    {order.delivery_address}
  </p>
)}

  {order.delivery_time && (
    <p className="text-xs mt-0.5">
      {order.delivery_time}
    </p>
  )}
</div>
          </div>
        ))}
      </div>
      {editingOrder && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl w-full max-w-md">
      <h3 className="text-lg font-bold mb-4">
        Edit Order #{editingOrder.id}
      </h3>

      <input
  className="w-full border p-2 rounded mb-3"
  placeholder="Customer Name"
  value={editingOrder.customer_name ?? ''}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            customer_name: e.target.value,
          })
        }
      />
      <input
  className="w-full border p-2 rounded mb-3"
  placeholder="Phone Number"
  value={editingOrder.phone_number ?? ''}
  onChange={(e) =>
    setEditingOrder({
      ...editingOrder,
      phone_number: e.target.value,
    })
  }
/>

<input
  className="w-full border p-2 rounded mb-3"
  placeholder="Delivery Address"
  value={editingOrder.delivery_address ?? ''}
  onChange={(e) =>
    setEditingOrder({
      ...editingOrder,
      delivery_address: e.target.value,
    })
  }
/>

<input
  className="w-full border p-2 rounded mb-3"
  placeholder="Delivery Time"
  value={editingOrder.delivery_time ?? ''}
  onChange={(e) =>
    setEditingOrder({
      ...editingOrder,
      delivery_time: e.target.value,
    })
  }
/>

<textarea
  rows={3}
  className="w-full border p-2 rounded mb-3"
  placeholder="Special Instructions"
  value={editingOrder.special_instructions ?? ''}
  onChange={(e) =>
    setEditingOrder({
      ...editingOrder,
      special_instructions: e.target.value,
    })
  }
/>
      <div className="flex gap-2">
        <button
        onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>

        <button
          onClick={() => setEditingOrder(null)}
          className="border px-4 py-2 rounded"
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
