import { Clock, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function PendingPage() {
  const { signOut, profile, session } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BNI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-xl leading-none">PALMS Dashboard</h1>
              <p className="text-xs text-gray-400">Directores Consultores</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cuenta en revisión</h2>
          <p className="text-gray-500 text-sm mb-2">
            Hola <span className="font-semibold text-gray-700">{profile?.nombre || session?.user?.email}</span>,
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Tu registro fue recibido correctamente. Un administrador revisará tu información
            y activará tu cuenta pronto. Recibirás un correo cuando esté lista.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-500 space-y-1 mb-6">
            <p><span className="font-medium text-gray-700">Correo:</span> {session?.user?.email}</p>
            {profile?.chapters?.nombre && (
              <p><span className="font-medium text-gray-700">Capítulo:</span> {profile.chapters.nombre}</p>
            )}
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-2 mx-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
