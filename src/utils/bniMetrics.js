export const DEFAULT_GOALS = {
  asistencia: 100,        // % mínimo de asistencia
  referenciasMin: 1,      // referencias dadas mínimas (RDI+RDE) por reunión
  unoAUnoMin: 1,          // 1-a-1 mínimos por reunión
  visitantesMin: 1,       // visitantes mínimos en el período
  udeMin: 3,              // unidades de entrenamiento mínimas
  gpncMeta: 10000,        // GPNC mínimo deseable (MXN)
}

export function calcMemberScore(member, goals, reuniones) {
  const totalRefs = member.RDI + member.RDE
  const asistencia = reuniones > 0 ? ((member.P / reuniones) * 100) : 0
  const refMeta = goals.referenciasMin * reuniones
  const unoMeta = goals.unoAUnoMin * reuniones

  return {
    asistenciaPct: asistencia,
    cumpleAsistencia: asistencia >= goals.asistencia,
    cumpleRefs: totalRefs >= refMeta,
    cumpleUno: member['1-a-1'] >= unoMeta,
    cumpleVisitantes: member.V >= goals.visitantesMin,
    cumpleUde: member.UdE >= goals.udeMin,
    cumpleGpnc: member.GPNC >= goals.gpncMeta,
    totalRefs,
    refMeta,
    unoMeta,
    alertas: buildAlertas(member, goals, reuniones, asistencia, totalRefs, refMeta, unoMeta),
  }
}

function buildAlertas(member, goals, reuniones, asistencia, totalRefs, refMeta, unoMeta) {
  const list = []
  if (asistencia < goals.asistencia) {
    list.push({ tipo: 'error', msg: `Asistencia ${asistencia.toFixed(0)}% (meta ${goals.asistencia}%)` })
  }
  if (member.A > 0 && member.M === 0) {
    list.push({ tipo: 'error', msg: `${member.A} ausencia(s) sin sustituto` })
  }
  if (totalRefs < refMeta) {
    list.push({ tipo: 'warning', msg: `Solo ${totalRefs} ref(s) dadas (meta ${refMeta})` })
  }
  if (member['1-a-1'] < unoMeta) {
    list.push({ tipo: 'warning', msg: `${member['1-a-1']} 1-a-1 (meta ${unoMeta})` })
  }
  if (member.V === 0) {
    list.push({ tipo: 'info', msg: 'Sin visitantes en el período' })
  }
  if (member.UdE < goals.udeMin) {
    list.push({ tipo: 'info', msg: `${member.UdE} UdE (meta ${goals.udeMin})` })
  }
  return list
}

export function calcChapterStats(members, goals, reuniones) {
  const scores = members.map(m => ({ member: m, score: calcMemberScore(m, goals, reuniones) }))

  const totalMembers = members.length
  const conAusencias = members.filter(m => m.A > 0).length
  const sinRefs = members.filter(m => m.RDI + m.RDE === 0).length
  const sinUnoAUno = members.filter(m => m['1-a-1'] === 0).length
  const sinVisitantes = members.filter(m => m.V === 0).length
  const sinUde = members.filter(m => m.UdE < goals.udeMin).length
  const sinGpnc = members.filter(m => m.GPNC === 0).length

  const totalGpnc = members.reduce((s, m) => s + m.GPNC, 0)
  const totalRefs = members.reduce((s, m) => s + m.RDI + m.RDE, 0)
  const totalUnoAUno = members.reduce((s, m) => s + m['1-a-1'], 0)
  const totalVisitantes = members.reduce((s, m) => s + m.V, 0)
  const totalUde = members.reduce((s, m) => s + m.UdE, 0)

  const asistenciaTotal = members.reduce((s, m) => s + m.P, 0)
  const posibleTotal = totalMembers * reuniones
  const asistenciaPct = posibleTotal > 0 ? (asistenciaTotal / posibleTotal) * 100 : 0

  const topGpnc = [...members].sort((a, b) => b.GPNC - a.GPNC).slice(0, 5)
  const topRefs = [...members].sort((a, b) => (b.RDI + b.RDE) - (a.RDI + a.RDE)).slice(0, 5)
  const topUno = [...members].sort((a, b) => b['1-a-1'] - a['1-a-1']).slice(0, 5)

  return {
    totalMembers,
    conAusencias,
    sinRefs,
    sinUnoAUno,
    sinVisitantes,
    sinUde,
    sinGpnc,
    totalGpnc,
    totalRefs,
    totalUnoAUno,
    totalVisitantes,
    totalUde,
    asistenciaPct,
    topGpnc,
    topRefs,
    topUno,
    scores,
  }
}

export function buildSuggestions(stats, goals, reuniones) {
  const sugerencias = []

  const metaRefs = goals.referenciasMin * reuniones
  const metaUno = goals.unoAUnoMin * reuniones

  if (stats.sinRefs > 0) {
    sugerencias.push({
      nivel: 'error',
      titulo: `${stats.sinRefs} miembro(s) sin referencias dadas`,
      detalle: 'En BNI, dar referencias es la base del sistema Givers Gain®. Cada miembro debe dar al menos 1 referencia por reunión.',
      accion: 'Realiza un "referral blitz": pide a cada miembro que identifique 1 prospecto esta semana antes de la próxima reunión.',
    })
  }

  if (stats.conAusencias > 0) {
    sugerencias.push({
      nivel: 'error',
      titulo: `${stats.conAusencias} miembro(s) con ausencias`,
      detalle: 'La política de asistencia BNI es crítica: más de 3 ausencias en 6 meses puede resultar en baja del capítulo.',
      accion: 'Contacta a los miembros ausentes, recuérdales la política y ayúdalos a planificar sustitutos con anticipación.',
    })
  }

  if (stats.sinUnoAUno > 0) {
    sugerencias.push({
      nivel: 'warning',
      titulo: `${stats.sinUnoAUno} miembro(s) sin 1-a-1 realizados`,
      detalle: 'Los 1-a-1 construyen el conocimiento mutuo necesario para dar referencias de calidad (Know, Like, Trust).',
      accion: 'Promueve "Speed Networking" en la próxima reunión. Meta: 1-a-1 por semana.',
    })
  }

  if (stats.sinVisitantes > 0) {
    sugerencias.push({
      nivel: 'warning',
      titulo: `${stats.sinVisitantes} miembro(s) sin traer visitantes`,
      detalle: 'Los visitantes son el principal medio de crecimiento del capítulo y generan nuevas referencias.',
      accion: 'Cada miembro debe traer al menos 1 visitante por mes. Comparte el calendario de actividades con prospectos.',
    })
  }

  if (stats.sinUde > 0) {
    sugerencias.push({
      nivel: 'info',
      titulo: `${stats.sinUde} miembro(s) con UdE por debajo de la meta`,
      detalle: 'Las Unidades de Entrenamiento reflejan el compromiso con la metodología BNI y mejoran la calidad de la participación.',
      accion: 'Recomienda completar módulos en BNI Online® y BNI Business Builder. Asigna un compañero de entrenamiento.',
    })
  }

  if (stats.sinGpnc > 0) {
    sugerencias.push({
      nivel: 'info',
      titulo: `${stats.sinGpnc} miembro(s) sin negocio cerrado reportado`,
      detalle: 'El GPNC es el indicador más importante del ROI para cada miembro. Puede haber negocios cerrados no reportados.',
      accion: 'Recuerda a los miembros reportar TODA referencia cerrada, aunque sea pequeña. La transparencia genera confianza.',
    })
  }

  const refsExpected = stats.totalMembers * metaRefs
  if (stats.totalRefs < refsExpected) {
    sugerencias.push({
      nivel: 'warning',
      titulo: 'Total de referencias por debajo de la meta del capítulo',
      detalle: `El capítulo generó ${stats.totalRefs} referencias cuando la meta es ${refsExpected} (${goals.referenciasMin}/reunión × ${reuniones} reuniones × ${stats.totalMembers} miembros).`,
      accion: 'Realiza ejercicio de "Givers Gain": comparte testimoniales de referidos exitosos para motivar al grupo.',
    })
  }

  if (stats.asistenciaPct < goals.asistencia) {
    sugerencias.push({
      nivel: 'warning',
      titulo: `Asistencia del capítulo ${stats.asistenciaPct.toFixed(1)}%`,
      detalle: 'La asistencia del capítulo afecta la energía, el momentum y la capacidad de dar referencias de calidad.',
      accion: 'Implementa sistema de sustitutos: cada miembro debe tener mínimo 2 sustitutos registrados y listos.',
    })
  }

  return sugerencias
}

export function fmtCurrency(val) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val)
}
