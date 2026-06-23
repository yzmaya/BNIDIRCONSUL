import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fmtCurrency } from '../../utils/bniMetrics'

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

export default function GpncChart({ members }) {
  const data = [...members]
    .filter(m => m.GPNC > 0)
    .sort((a, b) => b.GPNC - a.GPNC)
    .slice(0, 8)
    .map(m => ({ name: m.nombre, gpnc: m.GPNC }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Sin negocios cerrados reportados
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
        <XAxis
          type="number"
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={80}
          tick={{ fontSize: 11, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v) => [fmtCurrency(v), 'GPNC']}
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Bar dataKey="gpnc" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[Math.min(i, COLORS.length - 1)]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
