export function getDashboardViewData(dashboard, maintenances, financialYear) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const financialYears = Array.from(
    { length: Math.max(currentYear - 2024 + 1, 1) },
    (_, index) => 2024 + index,
  )
  const annualFinancialSummary = financialYears.map((year) => {
    const yearMaintenances = maintenances.filter((item) => item.dataInicio?.startsWith(year + '-'))
    return {
      year,
      total: yearMaintenances.reduce((sum, item) => sum + Number(item.custoEstimado || 0), 0),
      count: yearMaintenances.length,
    }
  })

  const monthsInSelectedYear = financialYear === currentYear ? currentDate.getMonth() + 1 : 12
  const monthlyFinancialSummary = Array.from({ length: monthsInSelectedYear }, (_, index) => {
    const month = monthsInSelectedYear - index
    const monthKey = financialYear + '-' + String(month).padStart(2, '0')
    const monthMaintenances = maintenances.filter((item) => item.dataInicio?.startsWith(monthKey))
    return {
      month,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'long' })
        .format(new Date(financialYear, month - 1, 1)),
      total: monthMaintenances.reduce((sum, item) => sum + Number(item.custoEstimado || 0), 0),
      count: monthMaintenances.length,
    }
  })

  const categories = ['LEVE', 'PESADO'].map((name) => ({
    name,
    total: Number(dashboard?.volumePorCategoria?.[name] || 0),
  }))

  return {
    monthName: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate),
    categories,
    maximumCategory: Math.max(...categories.map((category) => category.total), 1),
    upcomingMaintenances: dashboard?.proximasManutencoes || [],
    financialYears,
    annualFinancialSummary,
    monthlyFinancialSummary,
    selectedYearTotal: monthlyFinancialSummary.reduce((sum, month) => sum + month.total, 0),
    topVehicle: dashboard?.veiculoMaiorKm || {},
  }
}

export function getMaintenanceViewData(maintenances, filters) {
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  const overdueMaintenances = maintenances
    .filter((item) => item.status !== 'CONCLUIDA' && (item.dataFinalizacao || item.dataInicio) < today)
    .sort((first, second) =>
      (first.dataFinalizacao || first.dataInicio).localeCompare(second.dataFinalizacao || second.dataInicio),
    )
    .slice(0, 5)

  const sorters = {
    'inicio-recente': ['dataInicio', -1],
    'inicio-antigo': ['dataInicio', 1],
    'previsao-proxima': ['dataFinalizacao', 1],
    'previsao-distante': ['dataFinalizacao', -1],
    'custo-maior': ['custoEstimado', -1],
    'custo-menor': ['custoEstimado', 1],
  }
  const [field, direction] = sorters[filters.sort] || sorters['inicio-recente']
  const filteredMaintenances = maintenances
    .filter((item) => !filters.vehicleId || String(item.veiculoId) === filters.vehicleId)
    .filter((item) =>
      !filters.service
      || (item.tipoServico || '').toLocaleLowerCase('pt-BR')
        .includes(filters.service.trim().toLocaleLowerCase('pt-BR')),
    )
    .filter((item) => !filters.status || item.status === filters.status)
    .sort((first, second) => {
      const firstValue = first[field]
      const secondValue = second[field]
      if (firstValue == null) return secondValue == null ? 0 : 1
      if (secondValue == null) return -1
      if (field === 'custoEstimado') {
        return (Number(firstValue) - Number(secondValue)) * direction
      }
      return String(firstValue).localeCompare(String(secondValue)) * direction
    })

  return {
    overdueMaintenances,
    inProgressMaintenances: maintenances.filter((item) => item.status === 'EM_REALIZACAO'),
    filteredMaintenances,
  }
}

export function getVehicleViewData(vehicles, filters) {
  const vehicleYears = [...new Set(vehicles.map((vehicle) => vehicle.ano).filter(Boolean))]
    .sort((first, second) => second - first)
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const search = filters.search.trim().toLocaleLowerCase('pt-BR')
      return !search || (vehicle.modelo + ' ' + vehicle.placa).toLocaleLowerCase('pt-BR').includes(search)
    })
    .filter((vehicle) => !filters.type || vehicle.tipo === filters.type)
    .filter((vehicle) => !filters.year || String(vehicle.ano) === filters.year)
    .sort((first, second) => {
      const sorters = {
        'modelo-az': ['modelo', 1],
        'modelo-za': ['modelo', -1],
        'placa-az': ['placa', 1],
        'placa-za': ['placa', -1],
        'ano-novo': ['ano', -1],
        'ano-antigo': ['ano', 1],
      }
      const [field, direction] = sorters[filters.sort] || sorters['modelo-az']
      if (first[field] == null) return second[field] == null ? 0 : 1
      if (second[field] == null) return -1
      if (field === 'ano') return (Number(first[field]) - Number(second[field])) * direction
      return String(first[field]).localeCompare(String(second[field]), 'pt-BR', { sensitivity: 'base' }) * direction
    })

  return { vehicleYears, filteredVehicles }
}
