import { useEffect } from 'react'
import { Settings, X } from 'lucide-react'

function Field({ label, name, value, onChange, min = 0, max = 100, step = 1, prefix }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-gray-400">{prefix}</span>}
        <input
          type="number"
          name={name}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </div>
  )
}

export default function GoalSettings({ goals, reuniones, onGoalsChange, onReunionesChange, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleGoal = (e) => {
    const { name, value } = e.target
    onGoalsChange(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-gray-900">Configurar Metas</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field
              label="Reuniones en el período"
              name="reuniones"
              value={reuniones}
              min={1}
              max={20}
              onChange={(e) => onReunionesChange(parseInt(e.target.value) || 1)}
            />
          </div>

          <Field
            label="Asistencia mínima (%)"
            name="asistencia"
            value={goals.asistencia}
            min={0}
            max={100}
            onChange={handleGoal}
          />
          <Field
            label="Referencias por reunión"
            name="referenciasMin"
            value={goals.referenciasMin}
            min={0}
            max={20}
            onChange={handleGoal}
          />
          <Field
            label="1-a-1 mínimos por reunión"
            name="unoAUnoMin"
            value={goals.unoAUnoMin}
            min={0}
            max={20}
            onChange={handleGoal}
          />
          <Field
            label="Visitantes mínimos (período)"
            name="visitantesMin"
            value={goals.visitantesMin}
            min={0}
            max={20}
            onChange={handleGoal}
          />
          <Field
            label="UdE mínimas (período)"
            name="udeMin"
            value={goals.udeMin}
            min={0}
            max={50}
            onChange={handleGoal}
          />
          <Field
            label="GPNC mínimo deseable"
            name="gpncMeta"
            value={goals.gpncMeta}
            min={0}
            max={9999999}
            step={1000}
            prefix="$"
            onChange={handleGoal}
          />
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
          >
            Guardar y cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
