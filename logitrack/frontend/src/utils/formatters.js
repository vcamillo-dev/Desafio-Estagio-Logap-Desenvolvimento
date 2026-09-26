export const formatNumber = (value, maximumFractionDigits = 0) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(Number(value || 0))

export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

export function formatDate(value) {
  if (!value) return 'Não informada'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? 'Não informada' : new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatDateTime(value) {
  if (!value) return 'Não informada'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Não informada'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export function toBrazilianDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}

export function toIsoDate(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const [, day, month, year] = match
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth() !== Number(month) - 1 || parsed.getUTCDate() !== Number(day)) {
    return null
  }
  return `${year}-${month}-${day}`
}

export function maskBrazilianDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function maintenanceVehicle(maintenance) {
  return maintenance.placaVeiculo || maintenance.veiculo?.placa || 'Veículo'
}

export function statusLabel(status) {
  const labels = {
    PENDENTE: 'Pendente',
    EM_REALIZACAO: 'Em realização',
    CONCLUIDA: 'Concluída',
  }
  return labels[status] || status || 'Pendente'
}
