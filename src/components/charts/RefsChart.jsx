import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RefsChart({ members }) {
  const data = [...members]
    .filter(m => m.RDI + m.RDE + m.RRI + m.RRE > 0)
    .sort((a, b) => (b.RDI + b.RDE) - (a.RDI + a.RDE))
    .slice(0, 10)
    .map(m => ({
      name: m.nombre,
      'Dadas Int.': m.RDI,
      'Dadas Ext.': m.RDE,
      'Recib. Int.': m.RRI,
      'Recib. Ext.': m.RRE,
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Sin referencias registradas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 30 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          angle={-35}
          textAnchor="end"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Dadas Int." stackId="d" fill="#3b82f6" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Dadas Ext." stackId="d" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Recib. Int." stackId="r" fill="#f59e0b" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Recib. Ext." stackId="r" fill="#fbbf24" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
