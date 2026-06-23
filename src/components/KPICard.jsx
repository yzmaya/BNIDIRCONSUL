import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const STATUS_STYLES = {
  good:    { card: 'bg-white border-emerald-200',   badge: 'bg-emerald-50 text-emerald-700', icon: TrendingUp,   iconColor: 'text-emerald-500' },
  warning: { card: 'bg-white border-amber-200',     badge: 'bg-amber-50 text-amber-700',     icon: Minus,        iconColor: 'text-amber-500'   },
  danger:  { card: 'bg-white border-red-200',       badge: 'bg-red-50 text-red-700',         icon: TrendingDown, iconColor: 'text-red-500'     },
  neutral: { card: 'bg-white border-gray-200',      badge: 'bg-gray-50 text-gray-600',       icon: Minus,        iconColor: 'text-gray-400'    },
}

export default function KPICard({ icon: Icon, title, value, subtitle, status = 'neutral', badge }) {
  const s = STATUS_STYLES[status]
  const TrendIcon = s.icon

  return (
    <div className={`rounded-2xl border-2 p-5 shadow-sm flex flex-col gap-2 ${s.card}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gray-50">
            <Icon className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        </div>
        <TrendIcon className={`w-4 h-4 ${s.iconColor}`} />
      </div>

      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>

      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}

      {badge && (
        <span className={`self-start mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}>
          {badge}
        </span>
      )}
    </div>
  )
}
