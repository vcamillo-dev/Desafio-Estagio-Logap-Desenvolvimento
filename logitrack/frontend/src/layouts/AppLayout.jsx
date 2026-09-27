import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import useFleetData from '../hooks/useFleetData.js'
import useFleetActions from '../hooks/useFleetActions.js'
import { getDashboardViewData, getMaintenanceViewData, getVehicleViewData } from '../utils/fleetViewData.js'
import Sidebar from '../components/Sidebar.jsx'
import AppHeader from '../components/AppHeader.jsx'
import MaintenanceModal from '../components/MaintenanceModal.jsx'
import VehicleFormModal from '../components/VehicleFormModal.jsx'
import VehicleDetailsModal from '../components/VehicleDetailsModal.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import MaintenancePage from '../pages/MaintenancePage.jsx'
import VehiclesPage from '../pages/VehiclesPage.jsx'
import FinancePage from '../pages/FinancePage.jsx'

function getPageTitle(page) {
  const titles = {
    dashboard: 'Visão geral da frota',
    manutencoes: 'Manutenções',
    veiculos: 'Veículos',
    financeiro: 'Financeiro',
  }
  return titles[page] || titles.dashboard
}

export default function AppLayout({ activePage }) {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const fleet = useFleetData()
  const actions = useFleetActions({
    loadData: fleet.loadData,
    setError: fleet.setError,
    setSuccess: fleet.setSuccess,
  })
  const [maintenanceFilters, setMaintenanceFilters] = useState({
    vehicleId: '',
    service: '',
    status: '',
    sort: 'inicio-recente',
  })
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear())
  const [vehicleFilters, setVehicleFilters] = useState({
    search: '',
    type: '',
    year: '',
    sort: 'modelo-az',
  })

  const pageTitle = getPageTitle(activePage)
  const pageDescription = activePage === 'financeiro'
    ? 'Acompanhe os custos das manutenções por mês e por ano, desde 2024.'
    : 'Acompanhe os indicadores e a operação da sua frota em um só lugar.'
  const dashboardView = getDashboardViewData(fleet.dashboard, fleet.maintenances, financialYear)
  const maintenanceView = getMaintenanceViewData(fleet.maintenances, maintenanceFilters)
  const vehicleView = getVehicleViewData(fleet.vehicles, vehicleFilters)

  return (
    <div className="app-shell">
      <Sidebar
        maintenanceCount={fleet.maintenances.length}
        vehicleCount={fleet.vehicles.length}
        hasError={Boolean(fleet.error)}
      />

      <main className="main-content">
        <AppHeader
          pageTitle={pageTitle}
          pageDescription={pageDescription}
          userLabel={session.user.user_metadata?.nome || session.user.email}
          userInitial={(session.user.user_metadata?.nome || session.user.email || 'L').charAt(0).toUpperCase()}
          onSignOut={signOut}
          showAction={activePage !== 'financeiro'}
          actionLabel={activePage === 'veiculos' ? 'Novo veículo' : 'Nova manutenção'}
          onAction={activePage === 'veiculos' ? actions.openNewVehicle : actions.openNewMaintenance}
        />

        {fleet.error && (
          <div className="alert" role="alert">
            <span>{fleet.error}</span>
            <button onClick={fleet.loadData}>Tentar novamente</button>
          </div>
        )}
        {fleet.success && (
          <div className="success-message" role="status">
            <span className="success-check">✓</span>
            {fleet.success}
          </div>
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            loading={fleet.loading}
            dashboard={fleet.dashboard}
            categories={dashboardView.categories}
            maximumCategory={dashboardView.maximumCategory}
            monthName={dashboardView.monthName}
            inProgressMaintenances={maintenanceView.inProgressMaintenances}
            topVehicle={dashboardView.topVehicle}
            upcomingMaintenances={dashboardView.upcomingMaintenances}
            setActivePage={(page) => navigate(page === 'dashboard' ? '/' : '/' + page)}
            overdueMaintenances={maintenanceView.overdueMaintenances}
            openNewMaintenance={actions.openNewMaintenance}
          />
        )}

        {activePage === 'manutencoes' && (
          <MaintenancePage
            filteredMaintenances={maintenanceView.filteredMaintenances}
            maintenances={fleet.maintenances}
            vehicles={fleet.vehicles}
            maintenanceFilters={maintenanceFilters}
            setMaintenanceFilters={setMaintenanceFilters}
            loading={fleet.loading}
            openEditMaintenance={actions.openEditMaintenance}
            deleteMaintenance={actions.deleteMaintenance}
          />
        )}

        {activePage === 'veiculos' && (
          <VehiclesPage
            vehicles={fleet.vehicles}
            filteredVehicles={vehicleView.filteredVehicles}
            vehicleFilters={vehicleFilters}
            setVehicleFilters={setVehicleFilters}
            vehicleYears={vehicleView.vehicleYears}
            loading={fleet.loading}
            openVehicleDetails={actions.openVehicleDetails}
          />
        )}

        {activePage === 'financeiro' && (
          <FinancePage
            annualFinancialSummary={dashboardView.annualFinancialSummary}
            financialYear={financialYear}
            setFinancialYear={setFinancialYear}
            financialYears={dashboardView.financialYears}
            loading={fleet.loading}
            monthlyFinancialSummary={dashboardView.monthlyFinancialSummary}
            selectedYearTotal={dashboardView.selectedYearTotal}
          />
        )}
      </main>

      {actions.formOpen && (
        <MaintenanceModal
          editingMaintenance={actions.editingMaintenance}
          setFormOpen={actions.setFormOpen}
          formData={actions.formData}
          setFormData={actions.setFormData}
          saveMaintenance={actions.saveMaintenance}
          vehicles={fleet.vehicles}
          formError={actions.formError}
          saving={actions.saving}
        />
      )}

      {actions.vehicleFormOpen && (
        <VehicleFormModal
          setVehicleFormOpen={actions.setVehicleFormOpen}
          saveVehicle={actions.saveVehicle}
          vehicleFormData={actions.vehicleFormData}
          setVehicleFormData={actions.setVehicleFormData}
          vehicleFormError={actions.vehicleFormError}
          savingVehicle={actions.savingVehicle}
        />
      )}

      {actions.selectedVehicle && (
        <VehicleDetailsModal
          selectedVehicle={actions.selectedVehicle}
          setSelectedVehicle={actions.setSelectedVehicle}
          vehicleDetailsLoading={actions.vehicleDetailsLoading}
          vehicleDetailsError={actions.vehicleDetailsError}
          vehicleDetails={actions.vehicleDetails}
          deletingVehicle={actions.deletingVehicle}
          deleteVehicle={actions.deleteVehicle}
        />
      )}
    </div>
  )
}
