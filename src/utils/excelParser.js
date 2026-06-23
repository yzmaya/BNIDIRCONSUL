import * as XLSX from 'xlsx'

const KNOWN_COLUMNS = ['P', 'A', 'L', 'M', 'S', 'RDI', 'RDE', 'RRI', 'RRE', 'V', '1-a-1', 'GPNC', 'UdE']
const SKIP_NAMES = ['visitantes', 'bni', 'invitados']

function findHeaderRow(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100')
  for (let r = range.s.r; r <= Math.min(range.e.r, 20); r++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })]
    if (cellA && typeof cellA.v === 'string' && cellA.v.toLowerCase().trim() === 'nombre') {
      return r
    }
  }
  return -1
}

function extractMetadata(sheet, headerRow) {
  const meta = { capitulo: '', de: '', a: '', usuario: '', region: '', pais: '' }
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100')

  for (let r = range.s.r; r < headerRow; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })]
      if (!cell) continue
      const val = String(cell.v || '').trim()
      const lower = val.toLowerCase()

      if (lower === 'capítulo' || lower === 'capitulo') {
        const next = sheet[XLSX.utils.encode_cell({ r, c: c + 1 })]
        if (next) meta.capitulo = String(next.v || '').trim()
      }
      if (lower === 'de:' || lower === 'de') {
        const next = sheet[XLSX.utils.encode_cell({ r, c: c + 1 })]
        if (next) meta.de = String(next.v || '').trim()
      }
      if (lower === 'a:' || lower === 'a') {
        const next = sheet[XLSX.utils.encode_cell({ r, c: c + 1 })]
        if (next) meta.a = String(next.v || '').trim()
      }

      // Try to find chapter name and region from header rows
      if (r <= 4 && val.includes('Titanes') && !meta.capitulo) meta.capitulo = val
    }
  }

  // Second pass: look for larger merged-cell values
  for (let r = 0; r < headerRow; r++) {
    for (let c = 0; c <= 20; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })]
      if (!cell) continue
      const val = String(cell.v || '').trim()
      if (val.toLowerCase().startsWith('capítulo') || val.toLowerCase().startsWith('capitulo')) {
        const parts = val.split(':')
        if (parts[1]) meta.capitulo = parts[1].trim()
      }
      if (val.toLowerCase().startsWith('de:')) meta.de = val.slice(3).trim()
      if (val.toLowerCase().startsWith('a:')) meta.a = val.slice(2).trim()
    }
  }

  return meta
}

function parseDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  // Excel serial date
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val)
    if (date) return new Date(date.y, date.m - 1, date.d)
  }
  // String date like "01/06/26" or "23/06/26"
  if (typeof val === 'string') {
    const parts = val.split('/')
    if (parts.length === 3) {
      const y = parseInt(parts[2]) + (parseInt(parts[2]) < 100 ? 2000 : 0)
      return new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]))
    }
  }
  return null
}

function formatDate(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  const d = parseDate(val)
  if (!d) return String(val)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: false })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const headerRow = findHeaderRow(sheet)
        if (headerRow === -1) throw new Error('No se encontró la fila de encabezados (Nombre/Apellido) en el archivo.')

        const rawMeta = extractMetadata(sheet, headerRow)

        // Build column index map from header row
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z200')
        const colMap = {}
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })]
          if (cell) {
            const key = String(cell.v || '').trim()
            colMap[key] = c
          }
        }

        const getVal = (r, key) => {
          const c = colMap[key]
          if (c === undefined) return null
          const cell = sheet[XLSX.utils.encode_cell({ r, c })]
          return cell ? cell.v : null
        }

        const getNum = (r, key) => {
          const v = getVal(r, key)
          const n = parseFloat(v)
          return isNaN(n) ? 0 : n
        }

        const getString = (r, key) => {
          const v = getVal(r, key)
          return v !== null && v !== undefined ? String(v).trim() : ''
        }

        const members = []
        let totals = null
        let maxPresencias = 0

        for (let r = headerRow + 1; r <= range.e.r; r++) {
          const nombre = getString(r, 'Nombre')
          const apellido = getString(r, 'Apellido')

          if (!nombre && !apellido) continue

          const fullName = `${nombre} ${apellido}`.trim()
          const lower = fullName.toLowerCase()

          if (lower.startsWith('total')) {
            totals = {
              P: getNum(r, 'P'),
              A: getNum(r, 'A'),
              L: getNum(r, 'L'),
              M: getNum(r, 'M'),
              S: getNum(r, 'S'),
              RDI: getNum(r, 'RDI'),
              RDE: getNum(r, 'RDE'),
              RRI: getNum(r, 'RRI'),
              RRE: getNum(r, 'RRE'),
              V: getNum(r, 'V'),
              '1-a-1': getNum(r, '1-a-1'),
              GPNC: getNum(r, 'GPNC'),
              UdE: getNum(r, 'UdE'),
            }
            break
          }

          if (SKIP_NAMES.some(s => lower.includes(s))) continue

          const member = {
            nombre,
            apellido,
            fullName,
            P: getNum(r, 'P'),
            A: getNum(r, 'A'),
            L: getNum(r, 'L'),
            M: getNum(r, 'M'),
            S: getNum(r, 'S'),
            RDI: getNum(r, 'RDI'),
            RDE: getNum(r, 'RDE'),
            RRI: getNum(r, 'RRI'),
            RRE: getNum(r, 'RRE'),
            V: getNum(r, 'V'),
            '1-a-1': getNum(r, '1-a-1'),
            GPNC: getNum(r, 'GPNC'),
            UdE: getNum(r, 'UdE'),
          }

          if (member.P > maxPresencias) maxPresencias = member.P
          members.push(member)
        }

        // Detect number of meetings from max P value (or use totals heuristic)
        const detectedMeetings = maxPresencias || 3

        // Build metadata with nice date strings
        const meta = {
          capitulo: rawMeta.capitulo || '',
          de: formatDate(rawMeta.de) || '',
          a: formatDate(rawMeta.a) || '',
          reuniones: detectedMeetings,
          totalMiembros: members.length,
        }

        // If Capitulo still empty try to find it in any cell containing chapter-like text
        if (!meta.capitulo) {
          for (let r = 0; r < headerRow; r++) {
            for (let c = 0; c <= 20; c++) {
              const cell = sheet[XLSX.utils.encode_cell({ r, c })]
              if (!cell) continue
              const v = String(cell.v || '').trim()
              if (v.length > 3 && v.length < 60 && !v.includes(':') && r >= 2) {
                // heuristic: likely chapter name
                if (!meta.capitulo && v !== 'Reporte PALMS' && !v.toLowerCase().includes('usuario')) {
                  meta.capitulo = v
                }
              }
            }
          }
        }

        resolve({ meta, members, totals })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsArrayBuffer(file)
  })
}
