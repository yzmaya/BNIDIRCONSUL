import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { calcMemberScore, fmtCurrency } from '../utils/bniMetrics'

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-500" />
    : <ChevronDown className="w-3 h-3 text-blue-500" />
}

function StatusDot({ ok, warn }) {
  if (ok) return <CheckCircle className="w-4 h-4 text-emerald-500" />
  if (warn) return <AlertCircle className="w-4 h-4 text-amber-500" />
  return <XCircle className="w-4 h-4 text-red-500" />
}

function NumCell({ val, meta, modeMin = true }) {
  const ok = modeMin ? val >= meta : val <= meta
  const warn = modeMin ? val >= meta * 0.5 : val <= meta * 1.5
  const color = ok
    ? 'text-emerald-700 bg-emerald-50'
    : warn
    ? 'text-amber-700 bg-amber-50'
    : 'text-red-700 bg-red-50'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${color}`}>{val}</span>
  )
}

const SORT_KEYS = {
  nombre: m => m.fullName,
  P: m => m.P,
  A: m => m.A,
  refs: m => m.RDI + m.RDE,
  '1-a-1': m => m['1-a-1'],
  V: m => m.V,
  UdE: m => m.UdE,
  GPNC: m => m.GPNC,
}

export default function MemberTable({ members, goals, reuniones }) {
  const [sortCol, setSortCol] = useState('GPNC')
  const [sortDir, setSortDir] = useState('desc')
  const [filter, setFilter] = useState('')

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const filteredSorted = [...members]
    .filter(m => m.fullName.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const fn = SORT_KEYS[sortCol] || (m => m.fullName)
      const va = fn(a), vb = fn(b)
      return sortDir === 'asc'
        ? (typeof va === 'string' ? va.localeCompare(vb) : va - vb)
        : (typeof vb === 'string' ? vb.localeCompare(va) : vb - va)
    })

  const refMeta = goals.referenciasMin * reuniones
  const unoMeta = goals.unoAUnoMin * reuniones

  const Th = ({ col, children }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 whitespace-nowrap select-none"
    >
      <div className="flex items-center gap-1 justify-center">
        {children}
        <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
      </div>
    </th>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <h3 className="font-bold text-gray-900">Rendimiento por Miembro</h3>
        <div className="sm:ml-auto">
          <input
            type="text"
            placeholder="Buscar miembro..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left sticky left-0 bg-gray-50">
                <div onClick={() => handleSort('nombre')} className="flex items-center gap-1 cursor-pointer hover:text-gray-800 select-none">
                  Miembro <SortIcon col="nombre" sortCol={sortCol} sortDir={sortDir} />
                </div>
              </th>
              <Th col="P">P</Th>
              <Th col="A">A</Th>
              <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">L</th>
              <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">M/S</th>
              <Th col="refs">Refs</Th>
              <Th col="1-a-1">1-a-1</Th>
              <Th col="V">Vis.</Th>
              <Th col="UdE">UdE</Th>
              <Th col="GPNC">GPNC</Th>
              <th className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSorted.map((m) => {
              const score = calcMemberScore(m, goals, reuniones)
              const totalRefs = m.RDI + m.RDE
              const rowBg = score.alertas.some(a => a.tipo === 'error')
                ? 'bg-red-50/30'
                : score.alertas.some(a => a.tipo === 'warning')
                ? 'bg-amber-50/20'
                : ''
              const statusOk = score.alertas.length === 0
              const statusWarn = !statusOk && !score.alertas.some(a => a.tipo === 'error')

              return (
                <tr key={m.fullName} className={`hover:bg-gray-50 transition-colors ${rowBg}`}>
                  <td className="px-3 py-3 sticky left-0 bg-white/80 backdrop-blur-sm">
                    <div className="font-medium text-gray-900 whitespace-nowrap">{m.nombre}</div>
                    <div className="text-xs text-gray-400">{m.apellido}</div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <NumCell val={m.P} meta={reuniones} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <NumCell val={m.A} meta={0} modeMin={false} />
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-600">{m.L || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="text-xs text-gray-500">{m.M}/{m.S}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <NumCell val={totalRefs} meta={refMeta} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <NumCell val={m['1-a-1']} meta={unoMeta} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <NumCell val={m.V} meta={goals.visitantesMin} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <NumCell val={m.UdE} meta={goals.udeMin} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs font-semibold ${m.GPNC > 0 ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {m.GPNC > 0 ? fmtCurrency(m.GPNC) : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center" title={score.alertas.map(a => a.msg).join(' | ')}>
                      <StatusDot ok={statusOk} warn={statusWarn} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Cumple metas</span>
        <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Atención requerida</span>
        <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-500" /> Incumple metas críticas</span>
        <span className="ml-auto text-gray-400">{filteredSorted.length} de {members.length} miembros · Haz clic en columnas para ordenar</span>
      </div>
    </div>
  )
}
