import { AlertCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react'

const LEVEL_CONFIG = {
  error:   { icon: AlertCircle,   bg: 'bg-red-50',    border: 'border-red-200',   title: 'text-red-800',   badge: 'bg-red-100 text-red-700',   label: 'Crítico'    },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200', title: 'text-amber-800', badge: 'bg-amber-100 text-amber-700', label: 'Atención'  },
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',  title: 'text-blue-800',  badge: 'bg-blue-100 text-blue-700',  label: 'Mejora'     },
}

function SuggestionCard({ sugerencia }) {
  const cfg = LEVEL_CONFIG[sugerencia.nivel] || LEVEL_CONFIG.info
  const Icon = cfg.icon
  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.title}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>{cfg.label}</span>
            <p className={`font-semibold text-sm ${cfg.title}`}>{sugerencia.titulo}</p>
          </div>
          <p className="text-sm text-gray-600 mb-2">{sugerencia.detalle}</p>
          <div className="flex items-start gap-2 mt-2 p-3 bg-white/70 rounded-lg">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700 font-medium">{sugerencia.accion}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuggestionsPanel({ sugerencias }) {
  if (!sugerencias || sugerencias.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-gray-700 font-semibold">¡Tu capítulo está cumpliendo todas las metas!</p>
        <p className="text-gray-400 text-sm mt-1">Sigue así para mantener el momentum BNI.</p>
      </div>
    )
  }

  const criticos = sugerencias.filter(s => s.nivel === 'error')
  const atencion = sugerencias.filter(s => s.nivel === 'warning')
  const mejoras  = sugerencias.filter(s => s.nivel === 'info')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-gray-900">Sugerencias BNI</h3>
        <div className="ml-auto flex gap-2">
          {criticos.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">{criticos.length} crítico{criticos.length > 1 ? 's' : ''}</span>
          )}
          {atencion.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{atencion.length} atención</span>
          )}
          {mejoras.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{mejoras.length} mejora{mejoras.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        {sugerencias.map((s, i) => <SuggestionCard key={i} sugerencia={s} />)}
      </div>
    </div>
  )
}
