import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

export default function AttendanceChart({ stats, goals, reuniones }) {
  const totalMembers = stats.totalMembers || 1
  const pctSinRefs = Math.round(((totalMembers - stats.sinRefs) / totalMembers) * 100)
  const pctSinUno = Math.round(((totalMembers - stats.sinUnoAUno) / totalMembers) * 100)
  const pctSinVis = Math.round(((totalMembers - stats.sinVisitantes) / totalMembers) * 100)
  const pctSinUde = Math.round(((totalMembers - stats.sinUde) / totalMembers) * 100)
  const pctSinGpnc = Math.round(((totalMembers - stats.sinGpnc) / totalMembers) * 100)
  const asist = Math.round(stats.asistenciaPct)

  const data = [
    { metric: 'Asistencia', value: asist },
    { metric: 'Referencias', value: pctSinRefs },
    { metric: '1-a-1', value: pctSinUno },
    { metric: 'Visitantes', value: pctSinVis },
    { metric: 'Entrenam.', value: pctSinUde },
    { metric: 'GPNC', value: pctSinGpnc },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid gridType="polygon" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#374151' }} />
        <Radar
          dataKey="value"
          stroke="#dc2626"
          fill="#dc2626"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Cumplimiento']}
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
