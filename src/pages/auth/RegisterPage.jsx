import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export default function RegisterPage({ onGoLogin }) {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
    bni_connect_password: '',
    chapter_id: '',
  })

  useEffect(() => {
    supabase.from('chapters').select('id, nombre, ciudad, dia_reunion').eq('activo', true).order('nombre')
      .then(({ data }) => setChapters(data || []))
  }, [])

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    // 1. Create Supabase auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (authErr) { setError(authErr.message); setLoading(false); return }

    const userId = authData.user?.id
    if (!userId) { setError('Error creando la cuenta. Intenta de nuevo.'); setLoading(false); return }

    // 2. Upsert profile with all fields
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      bni_connect_email: form.email.trim(),
      bni_connect_password: form.bni_connect_password, // stored in DB; Edge Functions encrypt before storage
      chapter_id: form.chapter_id || null,
      role: 'director',
      aprobado: false,
    })

    if (profileErr) { setError(profileErr.message); setLoading(false); return }

    setLoading(false)
    // Auth state change will redirect to PendingPage via App router
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BNI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-xl leading-none">PALMS Dashboard</h1>
              <p className="text-xs text-gray-400">Crear cuenta de Director Consultor</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Registro</h2>
          <p className="text-xs text-gray-500 mb-6">
            Tu cuenta requiere aprobación del administrador antes de poder acceder al dashboard.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal info */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
              <input required value={form.nombre} onChange={set('nombre')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Néstor Yzmaya" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono (WhatsApp) *</label>
              <input required type="tel" value={form.telefono} onChange={set('telefono')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="+52 55 1234 5678" />
            </div>

            {/* Chapter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Capítulo BNI que lideras *</label>
              <select required value={form.chapter_id} onChange={set('chapter_id')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="">Selecciona tu capítulo…</option>
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}{c.ciudad ? ` — ${c.ciudad}` : ''}{c.dia_reunion ? ` (${c.dia_reunion})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* BNI Connect credentials */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-bold">!</span>
                Credenciales de BNI Connect
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Se usan para descargar tu reporte PALMS automáticamente. Se guardan de forma segura y solo las usa el sistema.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Correo de BNI Connect *
                  </label>
                  <input required type="email" value={form.email} onChange={set('email')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="correo@bniconnect.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Contraseña de BNI Connect *
                  </label>
                  <input required type="password" value={form.bni_connect_password} onChange={set('bni_connect_password')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Tu contraseña de bniconnectglobal.com" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* App password */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3">Contraseña para esta app</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
                  <input required type="password" value={form.password} onChange={set('password')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Mínimo 8 caracteres" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar contraseña *</label>
                  <input required type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Repite la contraseña" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onGoLogin} className="text-red-600 font-semibold hover:underline">
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
