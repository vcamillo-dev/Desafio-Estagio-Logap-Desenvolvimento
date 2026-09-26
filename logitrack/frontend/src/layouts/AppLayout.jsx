import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../supabaseClient'
import { maintenanceVehicle, statusLabel, toBrazilianDate, toIsoDate } from '../utils/formatters.js'
import Sidebar from '../components/Sidebar.jsx'
import AppHeader from '../components/AppHeader.jsx'
import MaintenanceModal from '../components/MaintenanceModal.jsx'
import VehicleFormModal from '../components/VehicleFormModal.jsx'
import VehicleDetailsModal from '../components/VehicleDetailsModal.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import MaintenancePage from '../pages/MaintenancePage.jsx'
import VehiclesPage from '../pages/VehiclesPage.jsx'
import FinancePage from '../pages/FinancePage.jsx'

const emptyVehicle = {
  placa: '',
  modelo: '',
  tipo: 'LEVE',
  ano: '',
}

const emptyMaintenance = {
  veiculoId: '',
  dataInicio: '',
  dataFinalizacao: '',
  tipoServico: '',
  custoEstimado: '',
  status: 'PENDENTE',
}

async function apiRequest(path, options = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  })
  const text = await response.text()
  let result = null

  if (text) {
    try {
      result = JSON.parse(text)
    } catch {
      result = text
    }
  }

  if (response.status === 401) {
    await supabase.auth.signOut()
    throw new Error('Sua sessão expirou. Entre novamente.')
  }

  if (!response.ok) {
    throw new Error(result?.detail || result?.message || result || 'Não foi possível concluir a solicitação.')
  }

  return result
}

function AppLayout({ activePage }) {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [maintenances, setMaintenances] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false)
  const [vehicleFormData, setVehicleFormData] = useState(emptyVehicle)
  const [vehicleFormError, setVehicleFormError] = useState('')
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [vehicleDetails, setVehicleDetails] = useState(null)
  const [vehicleDetailsLoading, setVehicleDetailsLoading] = useState(false)
  const [vehicleDetailsError, setVehicleDetailsError] = useState('')
  const [deletingVehicle, setDeletingVehicle] = useState(false)
  const [maintenanceFilters, setMaintenanceFilters] = useState({ vehicleId: '', service: '', status: '', sort: 'inicio-recente' })
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear())
  const [vehicleFilters, setVehicleFilters] = useState({ search: '', type: '', year: '', sort: 'modelo-az' })
  const [editingMaintenance, setEditingMaintenance] = useState(null)
  const [formData, setFormData] = useState(emptyMaintenance)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)


  const loadData = useCallback(async () => {
    try {
      const [dashboardData, maintenanceData, vehicleData] = await Promise.all([
        apiRequest('/api/dashboard'),
        apiRequest('/api/manutencoes'),
        apiRequest('/api/veiculos'),
      ])
      setDashboard(dashboardData)
      setMaintenances(maintenanceData || [])
      setVehicles(vehicleData || [])
      setError('')
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar os dados da frota.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session) return undefined
    const timer = window.setTimeout(() => loadData(), 0)
    return () => window.clearTimeout(timer)
  }, [session, loadData])


  function openNewMaintenance() {
    setSuccess('')
    setEditingMaintenance(null)
    setFormData(emptyMaintenance)
    setFormError('')
    setFormOpen(true)
  }

  function openEditMaintenance(maintenance) {
    setSuccess('')
    setEditingMaintenance(maintenance)
    setFormData({
      veiculoId: String(maintenance.veiculoId ?? ''),
      dataInicio: toBrazilianDate(maintenance.dataInicio),
      dataFinalizacao: toBrazilianDate(maintenance.dataFinalizacao),
      tipoServico: maintenance.tipoServico || '',
      custoEstimado: maintenance.custoEstimado ?? '',
      status: maintenance.status || 'PENDENTE',
    })
    setFormError('')
    setFormOpen(true)
  }

  async function saveMaintenance(event) {
    event.preventDefault()
    setFormError('')

    const dataInicio = toIsoDate(formData.dataInicio)
    const dataFinalizacao = formData.dataFinalizacao ? toIsoDate(formData.dataFinalizacao) : null
    if (!dataInicio) {
      setFormError('Informe uma data de início válida no formato DD/MM/AAAA.')
      return
    }
    if (formData.dataFinalizacao && !dataFinalizacao) {
      setFormError('Informe uma previsão válida no formato DD/MM/AAAA.')
      return
    }
    if (dataFinalizacao && dataFinalizacao < dataInicio) {
      setFormError('A previsão de finalização não pode ser anterior à data de início.')
      return
    }

    setSaving(true)
    const payload = {
      ...formData,
      veiculoId: Number(formData.veiculoId),
      dataInicio,
      dataFinalizacao,
      custoEstimado: formData.custoEstimado === '' ? null : Number(formData.custoEstimado),
    }
    const path = editingMaintenance
      ? `/api/manutencoes/${editingMaintenance.id}`
      : '/api/manutencoes'

    try {
      await apiRequest(path, {
        method: editingMaintenance ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      setFormOpen(false)
      await loadData()
      setSuccess(`Manutenção salva com status: ${statusLabel(payload.status)}.`)
    } catch (saveError) {
      setFormError(saveError.message || 'Não foi possível salvar a manutenção.')
    } finally {
      setSaving(false)
    }
  }


  function openNewVehicle() {
    setError('')
    setSuccess('')
    setVehicleFormData(emptyVehicle)
    setVehicleFormError('')
    setVehicleFormOpen(true)
  }

  async function openVehicleDetails(vehicle) {
    setSelectedVehicle(vehicle)
    setVehicleDetails(null)
    setVehicleDetailsError('')
    setVehicleDetailsLoading(true)

    try {
      const details = await apiRequest(`/api/veiculos/${vehicle.id}/detalhes`)
      setVehicleDetails(details)
    } catch (detailsError) {
      setVehicleDetailsError(detailsError.message || 'Não foi possível carregar as viagens deste veículo.')
    } finally {
      setVehicleDetailsLoading(false)
    }
  }

  async function deleteVehicle(vehicle) {
    const confirmed = window.confirm(`Excluir ${vehicle.modelo} (${vehicle.placa})? As viagens e manutenções associadas também serão removidas.`)
    if (!confirmed) return

    setDeletingVehicle(true)
    setVehicleDetailsError('')
    try {
      await apiRequest(`/api/veiculos/${vehicle.id}`, { method: 'DELETE' })
      setSelectedVehicle(null)
      await loadData()
      setSuccess(`Veículo ${vehicle.placa} excluído com sucesso.`)
    } catch (deleteError) {
      setVehicleDetailsError(deleteError.message || 'Não foi possível excluir o veículo.')
    } finally {
      setDeletingVehicle(false)
    }
  }

  async function saveVehicle(event) {
    event.preventDefault()
    setSavingVehicle(true)
    setVehicleFormError('')

    const payload = {
      ...vehicleFormData,
      placa: vehicleFormData.placa.trim().toUpperCase(),
      modelo: vehicleFormData.modelo.trim(),
      ano: vehicleFormData.ano === '' ? null : Number(vehicleFormData.ano),
    }

    try {
      await apiRequest('/api/veiculos', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setVehicleFormOpen(false)
      await loadData()
      setSuccess(`Veículo ${payload.placa} cadastrado com sucesso.`)
    } catch (saveError) {
      setVehicleFormError(saveError.message || 'Não foi possível cadastrar o veículo.')
    } finally {
      setSavingVehicle(false)
    }
  }

  async function deleteMaintenance(maintenance) {
    const shouldDelete = window.confirm(`Deseja excluir a manutenção de ${maintenanceVehicle(maintenance)}?`)
    if (!shouldDelete) return

    try {
      await apiRequest(`/api/manutencoes/${maintenance.id}`, { method: 'DELETE' })
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Não foi possível excluir a manutenção.')
    }
  }

  const pageTitle = activePage === 'dashboard'
    ? 'Visão geral da frota'
    : activePage === 'manutencoes'
      ? 'Manutenções'
      : activePage === 'veiculos'
        ? 'Veículos'
        : 'Financeiro'
  const pageDescription = activePage === 'financeiro'
    ? 'Acompanhe os custos das manutenções por mês e por ano, desde 2024.'
    : 'Acompanhe os indicadores e a operação da sua frota em um só lugar.'

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())
  const categories = ['LEVE', 'PESADO'].map((name) => ({
    name,
    total: Number(dashboard?.volumePorCategoria?.[name] || 0),
  }))
  const maximumCategory = Math.max(...categories.map((category) => category.total), 1)
  const upcomingMaintenances = dashboard?.proximasManutencoes || []
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const financialYears = Array.from({ length: Math.max(currentYear - 2024 + 1, 1) }, (_, index) => 2024 + index)
  const annualFinancialSummary = financialYears.map((year) => {
    const yearMaintenances = maintenances.filter((item) => item.dataInicio?.startsWith(`${year}-`))
    return {
      year,
      total: yearMaintenances.reduce((sum, item) => sum + Number(item.custoEstimado || 0), 0),
      count: yearMaintenances.length,
    }
  })
  const monthsInSelectedYear = financialYear === currentYear ? currentDate.getMonth() + 1 : 12
  const monthlyFinancialSummary = Array.from({ length: monthsInSelectedYear }, (_, index) => {
    const month = monthsInSelectedYear - index
    const monthKey = `${financialYear}-${String(month).padStart(2, '0')}`
    const monthMaintenances = maintenances.filter((item) => item.dataInicio?.startsWith(monthKey))
    return {
      month,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(financialYear, month - 1, 1)),
      total: monthMaintenances.reduce((sum, item) => sum + Number(item.custoEstimado || 0), 0),
      count: monthMaintenances.length,
    }
  })
  const selectedYearTotal = monthlyFinancialSummary.reduce((sum, month) => sum + month.total, 0)
  const todayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
  const overdueMaintenances = maintenances
    .filter((item) => item.status !== 'CONCLUIDA' && (item.dataFinalizacao || item.dataInicio) < todayString)
    .sort((first, second) => (first.dataFinalizacao || first.dataInicio).localeCompare(second.dataFinalizacao || second.dataInicio))
    .slice(0, 5)
  const inProgressMaintenances = maintenances.filter((item) => item.status === 'EM_REALIZACAO')
  const filteredMaintenances = maintenances
    .filter((item) => !maintenanceFilters.vehicleId || String(item.veiculoId) === maintenanceFilters.vehicleId)
    .filter((item) => !maintenanceFilters.service || (item.tipoServico || '').toLocaleLowerCase('pt-BR').includes(maintenanceFilters.service.trim().toLocaleLowerCase('pt-BR')))
    .filter((item) => !maintenanceFilters.status || item.status === maintenanceFilters.status)
    .sort((first, second) => {
      const sorters = {
        'inicio-recente': ['dataInicio', -1],
        'inicio-antigo': ['dataInicio', 1],
        'previsao-proxima': ['dataFinalizacao', 1],
        'previsao-distante': ['dataFinalizacao', -1],
        'custo-maior': ['custoEstimado', -1],
        'custo-menor': ['custoEstimado', 1],
      }
      const [field, direction] = sorters[maintenanceFilters.sort] || sorters['inicio-recente']
      const firstValue = first[field]
      const secondValue = second[field]
      if (firstValue == null) return secondValue == null ? 0 : 1
      if (secondValue == null) return -1
      if (field === 'custoEstimado') return (Number(firstValue) - Number(secondValue)) * direction
      return String(firstValue).localeCompare(String(secondValue)) * direction
    })
  const vehicleYears = [...new Set(vehicles.map((vehicle) => vehicle.ano).filter(Boolean))].sort((first, second) => second - first)
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      const search = vehicleFilters.search.trim().toLocaleLowerCase('pt-BR')
      return !search || `${vehicle.modelo} ${vehicle.placa}`.toLocaleLowerCase('pt-BR').includes(search)
    })
    .filter((vehicle) => !vehicleFilters.type || vehicle.tipo === vehicleFilters.type)
    .filter((vehicle) => !vehicleFilters.year || String(vehicle.ano) === vehicleFilters.year)
    .sort((first, second) => {
      const sorters = {
        'modelo-az': ['modelo', 1],
        'modelo-za': ['modelo', -1],
        'placa-az': ['placa', 1],
        'placa-za': ['placa', -1],
        'ano-novo': ['ano', -1],
        'ano-antigo': ['ano', 1],
      }
      const [field, direction] = sorters[vehicleFilters.sort] || sorters['modelo-az']
      if (first[field] == null) return second[field] == null ? 0 : 1
      if (second[field] == null) return -1
      if (field === 'ano') return (Number(first[field]) - Number(second[field])) * direction
      return String(first[field]).localeCompare(String(second[field]), 'pt-BR', { sensitivity: 'base' }) * direction
    })
  const topVehicle = dashboard?.veiculoMaiorKm || {}

  return (
    <div className="app-shell">
      <Sidebar maintenanceCount={maintenances.length} vehicleCount={vehicles.length} hasError={Boolean(error)} />

      <main className="main-content">
        <AppHeader
          pageTitle={pageTitle}
          pageDescription={pageDescription}
          userLabel={session.user.user_metadata?.nome || session.user.email}
          userInitial={(session.user.user_metadata?.nome || session.user.email || 'L').charAt(0).toUpperCase()}
          onSignOut={signOut}
          showAction={activePage !== 'financeiro'}
          actionLabel={activePage === 'veiculos' ? 'Novo veículo' : 'Nova manutenção'}
          onAction={activePage === 'veiculos' ? openNewVehicle : openNewMaintenance}
        />

        {error && <div className="alert" role="alert"><span>{error}</span><button onClick={loadData}>Tentar novamente</button></div>}
        {success && <div className="success-message" role="status"><span className="success-check">✓</span>{success}</div>}

        {activePage === 'dashboard' && <DashboardPage
          loading={loading} dashboard={dashboard} categories={categories} maximumCategory={maximumCategory}
          monthName={monthName} inProgressMaintenances={inProgressMaintenances} topVehicle={topVehicle}
          upcomingMaintenances={upcomingMaintenances} setActivePage={(page) => navigate(page === 'dashboard' ? '/' : `/${page}`)}
          overdueMaintenances={overdueMaintenances} openNewMaintenance={openNewMaintenance}
        />}
        {activePage === 'manutencoes' && <MaintenancePage
          filteredMaintenances={filteredMaintenances} maintenances={maintenances} vehicles={vehicles}
          maintenanceFilters={maintenanceFilters} setMaintenanceFilters={setMaintenanceFilters} loading={loading}
          openEditMaintenance={openEditMaintenance} deleteMaintenance={deleteMaintenance}
        />}
        {activePage === 'veiculos' && <VehiclesPage
          vehicles={vehicles} filteredVehicles={filteredVehicles} vehicleFilters={vehicleFilters}
          setVehicleFilters={setVehicleFilters} vehicleYears={vehicleYears} loading={loading}
          openVehicleDetails={openVehicleDetails}
        />}
        {activePage === 'financeiro' && <FinancePage
          annualFinancialSummary={annualFinancialSummary} financialYear={financialYear}
          setFinancialYear={setFinancialYear} financialYears={financialYears} loading={loading}
          monthlyFinancialSummary={monthlyFinancialSummary} selectedYearTotal={selectedYearTotal}
        />}
      </main>

      {formOpen && <MaintenanceModal editingMaintenance={editingMaintenance} setFormOpen={setFormOpen} formData={formData} setFormData={setFormData} saveMaintenance={saveMaintenance} vehicles={vehicles} formError={formError} saving={saving} />}
      {vehicleFormOpen && <VehicleFormModal setVehicleFormOpen={setVehicleFormOpen} saveVehicle={saveVehicle} vehicleFormData={vehicleFormData} setVehicleFormData={setVehicleFormData} vehicleFormError={vehicleFormError} savingVehicle={savingVehicle} />}
      {selectedVehicle && <VehicleDetailsModal selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle} vehicleDetailsLoading={vehicleDetailsLoading} vehicleDetailsError={vehicleDetailsError} vehicleDetails={vehicleDetails} deletingVehicle={deletingVehicle} deleteVehicle={deleteVehicle} />}

    </div>
  )
}

export default AppLayout
