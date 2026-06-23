import { useState } from 'react'
import {
  DollarSign, Users, Share2, CalendarCheck, UserPlus,
  BookOpen, Settings, Upload, TrendingUp, Award, LogOut, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_GOALS, calcChapterStats, buildSuggestions, fmtCurrency } from '../utils/bniMetrics'
import KPICard from './KPICard'
import MemberTable from './MemberTable'
import GoalSettings from './GoalSettings'
import SuggestionsPanel from './SuggestionsPanel'
import GpncChart from './charts/GpncChart'
import RefsChart from './charts/RefsChart'
import AttendanceChart from './charts/AttendanceChart'

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-5 pt-4 pb-2 border-b border-gray-100">
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function Dashboard({ data, onReset, profile, onGoAdmin }) {
  const { signOut } = useAuth()
  const { meta, members } = data
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [reuniones, setReuniones] = useState(meta.reuniones || 3)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const stats = calcChapterStats(members, goals, reuniones)
  const sugerencias = buildSuggestions(stats, goals, reuniones)

  const asistPct = stats.asistenciaPct
  const asistStatus = asistPct >= goals.asistencia ? 'good' : asistPct >= goals.asistencia * 0.85 ? 'warning' : 'danger'

  const refsMeta = goals.referenciasMin * reuniones * members.length
  const refsStatus = stats.totalRefs >= refsMeta ? 'good' : stats.totalRefs >= refsMeta * 0.5 ? 'warning' : 'danger'

  const unoMeta = goals.unoAUnoMin * reuniones * members.length
  const unoStatus = stats.totalUnoAUno >= unoMeta ? 'good' : stats.totalUnoAUno >= unoMeta * 0.5 ? 'warning' : 'danger'

  const visStatus = stats.sinVisitantes === 0 ? 'good' : stats.sinVisitantes <= members.length * 0.3 ? 'warning' : 'danger'

  const criticalCount = sugerencias.filter(s => s.nivel === 'error').length

  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'members', label: 'Miembros' },
    { id: 'charts', label: 'Gráficas' },
    { id: 'suggestions', label: `Sugerencias${sugerencias.length ? ` (${sugerencias.length})` : ''}` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">BNI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-none">
                {meta.capitulo || 'PALMS Dashboard'}
              </h1>
              {(meta.de || meta.a) && (
                <p className="text-xs text-gray-400">{meta.de} – {meta.a} · {reuniones} reuniones</p>
              )}
            </div>
          </div>

          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {criticalCount} alerta{criticalCount > 1 ? 's' : ''} crítica{criticalCount > 1 ? 's' : ''}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {onGoAdmin && (
              <button onClick={onGoAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                <Shield className="w-4 h-4" /> Admin
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" /> Metas
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Upload className="w-4 h-4" /> Nuevo archivo
            </button>
            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <KPICard
                icon={DollarSign}
                title="GPNC Total"
                value={fmtCurrency(stats.totalGpnc)}
                subtitle={`${members.length - stats.sinGpnc} de ${members.length} reportaron`}
                status={stats.sinGpnc < members.length * 0.5 ? 'good' : 'warning'}
                badge={stats.sinGpnc === 0 ? 'Todos reportaron' : `${stats.sinGpnc} sin negocio`}
              />
              <KPICard
                icon={Users}
                title="Asistencia"
                value={`${asistPct.toFixed(1)}%`}
                subtitle={`${stats.conAusencias} miembro(s) con ausencias`}
                status={asistStatus}
                badge={stats.conAusencias === 0 ? '100% asistencia' : `${stats.conAusencias} faltas`}
              />
              <KPICard
                icon={Share2}
                title="Referencias"
                value={stats.totalRefs}
                subtitle={`Meta capítulo: ${refsMeta}`}
                status={refsStatus}
                badge={stats.sinRefs === 0 ? 'Todos participaron' : `${stats.sinRefs} sin dar refs`}
              />
              <KPICard
                icon={CalendarCheck}
                title="1-a-1 totales"
                value={stats.totalUnoAUno}
                subtitle={`Meta: ${unoMeta} total`}
                status={unoStatus}
                badge={stats.sinUnoAUno === 0 ? 'Excelente' : `${stats.sinUnoAUno} sin 1-a-1`}
              />
              <KPICard
                icon={UserPlus}
                title="Visitantes"
                value={stats.totalVisitantes}
                subtitle={`${members.length - stats.sinVisitantes} miembros trajeron`}
                status={visStatus}
                badge={stats.sinVisitantes === 0 ? 'Todos trajeron' : `${stats.sinVisitantes} sin invitados`}
              />
              <KPICard
                icon={BookOpen}
                title="UdE totales"
                value={stats.totalUde}
                subtitle={`${stats.sinUde} por debajo de meta`}
                status={stats.sinUde === 0 ? 'good' : stats.sinUde <= members.length * 0.3 ? 'warning' : 'danger'}
                badge={`Meta: ${goals.udeMin}/miembro`}
              />
            </div>

            {/* Radar + Top performers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartCard title="Radar de Cumplimiento del Capítulo">
                <AttendanceChart stats={stats} goals={goals} reuniones={reuniones} />
              </ChartCard>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Top GPNC */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Top GPNC</h4>
                  </div>
                  {stats.topGpnc.filter(m => m.GPNC > 0).slice(0, 4).map((m, i) => (
                    <div key={m.fullName} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{m.nombre}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{fmtCurrency(m.GPNC)}</span>
                    </div>
                  ))}
                  {stats.topGpnc.filter(m => m.GPNC > 0).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Sin negocios reportados</p>
                  )}
                </div>

                {/* Top Referencias */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Top Refs</h4>
                  </div>
                  {stats.topRefs.filter(m => m.RDI + m.RDE > 0).slice(0, 4).map((m, i) => (
                    <div key={m.fullName} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{m.nombre}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600">{m.RDI + m.RDE} refs</span>
                    </div>
                  ))}
                  {stats.topRefs.filter(m => m.RDI + m.RDE > 0).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Sin referencias</p>
                  )}
                </div>

                {/* Top 1-a-1 */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarCheck className="w-4 h-4 text-purple-500" />
                    <h4 className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Top 1-a-1</h4>
                  </div>
                  {stats.topUno.filter(m => m['1-a-1'] > 0).slice(0, 4).map((m, i) => (
                    <div key={m.fullName} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{m.nombre}</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600">{m['1-a-1']}</span>
                    </div>
                  ))}
                  {stats.topUno.filter(m => m['1-a-1'] > 0).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Sin 1-a-1</p>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions preview */}
            {sugerencias.length > 0 && (
              <div
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => setActiveTab('suggestions')}
              >
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    Tienes {sugerencias.length} sugerencia{sugerencias.length > 1 ? 's' : ''} de mejora BNI
                  </p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    {criticalCount > 0 ? `${criticalCount} alerta(s) crítica(s) que requieren atención inmediata` : 'Ver recomendaciones y mejores prácticas'}
                  </p>
                </div>
                <span className="text-amber-600 text-sm font-semibold">Ver →</span>
              </div>
            )}
          </>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <MemberTable members={members} goals={goals} reuniones={reuniones} />
        )}

        {/* CHARTS TAB */}
        {activeTab === 'charts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="GPNC por miembro (top 8)">
              <GpncChart members={members} />
            </ChartCard>
            <ChartCard title="Referencias por miembro">
              <RefsChart members={members} />
            </ChartCard>
            <div className="md:col-span-2">
              <ChartCard title="Radar de cumplimiento del capítulo (% de miembros que cumplen por categoría)">
                <AttendanceChart stats={stats} goals={goals} reuniones={reuniones} />
              </ChartCard>
            </div>
          </div>
        )}

        {/* SUGGESTIONS TAB */}
        {activeTab === 'suggestions' && (
          <SuggestionsPanel sugerencias={sugerencias} />
        )}
      </main>

      {/* Goals modal */}
      {showSettings && (
        <GoalSettings
          goals={goals}
          reuniones={reuniones}
          onGoalsChange={setGoals}
          onReunionesChange={setReuniones}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
