import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react'

export default function FileUpload({ onParsed }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const { parseExcel } = await import('../utils/excelParser')
      const result = await parseExcel(file)
      onParsed(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [onParsed])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: loading,
  })

  const borderColor = isDragReject
    ? 'border-red-400 bg-red-50'
    : isDragActive
    ? 'border-blue-500 bg-blue-50'
    : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50/30'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-lg w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">BNI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PALMS Dashboard</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Sube tu reporte PALMS de BNI para visualizar el rendimiento de tu capítulo
          </p>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${borderColor} ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <input {...getInputProps()} />

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-600 font-medium">Procesando archivo...</p>
            </div>
          ) : isDragActive && !isDragReject ? (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-blue-500" />
              <p className="text-blue-600 font-semibold text-lg">¡Suelta el archivo aquí!</p>
            </div>
          ) : isDragReject ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-600 font-semibold">Formato no válido. Usa .xlsx o .xls</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                <FileSpreadsheet className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-lg">
                  Arrastra tu archivo aquí
                </p>
                <p className="text-gray-400 text-sm mt-1">o haz clic para seleccionarlo</p>
              </div>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                .xlsx · .xls · .csv
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium text-sm">Error al procesar el archivo</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Los datos se procesan localmente en tu navegador. Ningún archivo se sube a servidores externos.
        </p>
      </div>
    </div>
  )
}
