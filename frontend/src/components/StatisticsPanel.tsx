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
  gradient,
}: {
  icon: typeof Package
  label: string
  value: number | string
  gradient: string
}) {
  return (
    <div className="hover-lift glass rounded-3xl p-6 shadow-glass hover:shadow-card">
      <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center mb-4 ring-1 ring-white/60 shadow-soft`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <p className="text-4xl font-display font-800 text-ink leading-none">{value}</p>
      <p className="text-sm text-ink-soft mt-2">{label}</p>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 shadow-glass">
      <div className="skeleton w-12 h-12 rounded-2xl mb-4" />
      <div className="skeleton h-9 w-20 rounded-xl" />
      <div className="skeleton h-4 w-28 rounded-lg mt-3" />
    </div>
  )
}

export default function StatisticsPanel({ statistics, loading }: Props) {
  const mostOrderedItems = statistics?.most_ordered_items ?? []
  const maxQty = mostOrderedItems.length > 0 ? mostOrderedItems[0]?.total_quantity ?? 1 : 1

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-2xl bg-gradient-sage flex items-center justify-center ring-1 ring-white/60">
          <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.2} />
        </span>
        <h3 className="font-display text-2xl font-700 text-ink">Bakery Statistics</h3>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Total Orders" value={statistics?.total_orders ?? 0} gradient="bg-gradient-peach" />
          <StatCard icon={TrendingUp} label="Items Sold" value={statistics?.total_items_sold ?? 0} gradient="bg-gradient-to-br from-pink to-pink-deep" />
          <StatCard icon={Users} label="Unique Customers" value={statistics?.unique_customers ?? 0} gradient="bg-gradient-sage" />
          <StatCard icon={BarChart3} label="Top Item (qty)" value={mostOrderedItems[0]?.total_quantity ?? 0} gradient="bg-gradient-to-br from-peach-deep to-pink-deep" />
        </div>
      )}

      {!loading && mostOrderedItems.length > 0 && (
        <div className="glass rounded-3xl p-6 md:p-7 shadow-glass">
          <h4 className="font-display font-700 text-ink mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-deep" />
            Most Ordered Items
          </h4>

          <div className="space-y-4">
            {mostOrderedItems.map((item, idx) => (
              <div key={item.item_name} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-full bg-cream-200/80 flex items-center justify-center font-display text-xs font-700 text-pink-deep shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1.5 gap-2">
                    <span className="font-500 text-ink truncate">{item.item_name}</span>
                    <span className="text-sm text-ink-soft shrink-0">
                      {item.total_quantity} sold · {item.order_count} orders
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-cream-200/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-peach origin-left"
                      style={{
                        width: `${(item.total_quantity / maxQty) * 100}%`,
                        animation: 'grow-x 0.9s cubic-bezier(0.22,1,0.36,1) both',
                        animationDelay: `${idx * 0.09}s`,
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
        <div className="glass rounded-3xl px-6 py-12 text-center shadow-glass">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-dawn flex items-center justify-center mb-4 ring-1 ring-white/60">
            <Package className="w-6 h-6 text-pink-deep" strokeWidth={2} />
          </div>
          <p className="font-display font-600 text-ink">No orders yet</p>
          <p className="text-sm text-ink-soft mt-1">Upload your first conversation to see statistics bloom here.</p>
        </div>
      )}
    </section>
  )
}
