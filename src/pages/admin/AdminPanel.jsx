import { useEffect, useState } from 'react'
import { Users, BookOpen, CheckCircle, XCircle, Plus, Pencil, Trash2, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

// ── Users tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*, chapters(nombre)')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const toggle = async (user, field, value) => {
    await supabase.from('profiles').update({ [field]: value }).eq('id', user.id)
    fetchUsers()
  }

  if (loading) return <p className="text-sm text-gray-400 py-8 text-center">Cargando usuarios…</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left py-3 px-4 font-medium">Nombre</th>
            <th className="text-left py-3 px-4 font-medium">Correo</th>
            <th className="text-left py-3 px-4 font-medium">Capítulo</th>
            <th className="text-left py-3 px-4 font-medium">Teléfono</th>
            <th className="text-center py-3 px-4 font-medium">Rol</th>
            <th className="text-center py-3 px-4 font-medium">Aprobado</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-800">{u.nombre || '—'}</td>
              <td className="py-3 px-4 text-gray-500">{u.bni_connect_email}</td>
              <td className="py-3 px-4 text-gray-600">{u.chapters?.nombre || '—'}</td>
              <td className="py-3 px-4 text-gray-500">{u.telefono || '—'}</td>
              <td className="py-3 px-4 text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => toggle(u, 'aprobado', !u.aprobado)}>
                  {u.aprobado
                    ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                    : <XCircle className="w-5 h-5 text-red-400 mx-auto" />}
                </button>
              </td>
              <td className="py-3 px-4">
                {u.role !== 'admin' && (
                  <button
                    onClick={() => toggle(u, 'role', u.role === 'admin' ? 'director' : 'admin')}
                    className="text-xs text-gray-400 hover:text-gray-700 underline"
                  >
                    {u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No hay usuarios registrados aún.</p>
      )}
    </div>
  )
}

// ── Chapters tab ───────────────────────────────────────────────────────────────
function ChaptersTab() {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nombre: '', ciudad: '', region: '', dia_reunion: '' })
  const [saving, setSaving] = useState(false)

  const fetchChapters = async () => {
    setLoading(true)
    const { data } = await supabase.from('chapters').select('*').order('nombre')
    setChapters(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchChapters() }, [])

  const openNew = () => { setEditing(null); setForm({ nombre: '', ciudad: '', region: '', dia_reunion: '' }); setShowForm(true) }
  const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, ciudad: c.ciudad || '', region: c.region || '', dia_reunion: c.dia_reunion || '' }); setShowForm(true) }
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await supabase.from('chapters').update(form).eq('id', editing.id)
    } else {
      await supabase.from('chapters').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    fetchChapters()
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar este capítulo?')) return
    await supabase.from('chapters').delete().eq('id', id)
    fetchChapters()
  }

  const toggle = async (c) => {
    await supabase.from('chapters').update({ activo: !c.activo }).eq('id', c.id)
    fetchChapters()
  }

  if (loading) return <p className="text-sm text-gray-400 py-8 text-center">Cargando capítulos…</p>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Nuevo capítulo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">{editing ? 'Editar capítulo' : 'Nuevo capítulo'}</h3>
            <form onSubmit={save} className="space-y-3">
              {[['nombre', 'Nombre *', true], ['ciudad', 'Ciudad', false], ['region', 'Región', false]].map(([k, label, req]) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input required={req} value={form[k]} onChange={set(k)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Día de reunión *</label>
                <select required value={form.dia_reunion} onChange={set('dia_reunion')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="">Selecciona…</option>
                  {DIAS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left py-3 px-4 font-medium">Capítulo</th>
            <th className="text-left py-3 px-4 font-medium">Ciudad</th>
            <th className="text-left py-3 px-4 font-medium">Región</th>
            <th className="text-left py-3 px-4 font-medium">Día reunión</th>
            <th className="text-center py-3 px-4 font-medium">Activo</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {chapters.map(c => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-800">{c.nombre}</td>
              <td className="py-3 px-4 text-gray-500">{c.ciudad || '—'}</td>
              <td className="py-3 px-4 text-gray-500">{c.region || '—'}</td>
              <td className="py-3 px-4 text-gray-600 capitalize">{c.dia_reunion || '—'}</td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => toggle(c)}>
                  {c.activo
                    ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                    : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
                </button>
              </td>
              <td className="py-3 px-4 flex items-center gap-2 justify-end">
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => remove(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {chapters.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No hay capítulos. Agrega el primero.</p>
      )}
    </div>
  )
}

// ── Main AdminPanel ────────────────────────────────────────────────────────────
export default function AdminPanel({ onGoToDashboard }) {
  const { signOut, profile } = useAuth()
  const [tab, setTab] = useState('users')

  const tabs = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'chapters', label: 'Capítulos', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">BNI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-none">Panel Admin</h1>
              <p className="text-xs text-gray-400">{profile?.nombre}</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {onGoToDashboard && (
              <button onClick={onGoToDashboard}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Ver Dashboard →
              </button>
            )}
            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {tab === 'users' && <UsersTab />}
          {tab === 'chapters' && <ChaptersTab />}
        </div>
      </main>
    </div>
  )
}
