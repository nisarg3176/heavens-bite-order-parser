import { BarChart3, Package, TrendingUp, Users } from 'lucide-react'
import type { Statistics } from '../types'

interface Props {
  statistics: Statistics | null
  loading: boolean
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Package
  label: string
  value: number | string
  accent: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white shadow-soft">
      <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-display font-bold text-bakery-brown">{value}</p>
      <p className="text-sm text-bakery-brown/60 mt-1">{label}</p>
    </div>
  )
}

export default function StatisticsPanel({ statistics, loading }: Props) {
  const mostOrderedItems = statistics?.most_ordered_items ?? []

  const maxQty =
    mostOrderedItems.length > 0
      ? mostOrderedItems[0]?.total_quantity ?? 1
      : 1

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-bakery-gold" />
        <h3 className="font-display text-xl font-bold text-bakery-brown">
          Bakery Statistics
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Orders"
          value={loading ? '—' : statistics?.total_orders ?? 0}
          accent="bg-bakery-gold"
        />

        <StatCard
          icon={TrendingUp}
          label="Items Sold"
          value={loading ? '—' : statistics?.total_items_sold ?? 0}
          accent="bg-bakery-rose"
        />

        <StatCard
          icon={Users}
          label="Unique Customers"
          value={loading ? '—' : statistics?.unique_customers ?? 0}
          accent="bg-bakery-sage"
        />

        <StatCard
          icon={BarChart3}
          label="Top Item (qty)"
          value={
            loading
              ? '—'
              : mostOrderedItems[0]?.total_quantity ?? 0
          }
          accent="bg-bakery-brown"
        />
      </div>

      {!loading && mostOrderedItems.length > 0 && (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-white shadow-soft">
          <h4 className="font-semibold text-bakery-brown mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-bakery-gold" />
            Most Ordered Items
          </h4>

          <div className="space-y-3">
            {mostOrderedItems.map((item, idx) => (
              <div key={item.item_name} className="flex items-center gap-4">
                <span className="w-6 text-sm font-bold text-bakery-brown/40">
                  #{idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <span className="font-medium text-bakery-brown truncate">
                      {item.item_name}
                    </span>

                    <span className="text-sm text-bakery-brown/60 shrink-0">
                      {item.total_quantity} sold · {item.order_count} orders
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-bakery-gold to-bakery-rose transition-all duration-500"
                      style={{
                        width: `${(item.total_quantity / maxQty) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (statistics?.total_orders ?? 0) === 0 && (
        <p className="text-center text-sm text-bakery-brown/50 py-4">
          Upload your first order to see statistics here.
        </p>
      )}
    </section>
  )
}