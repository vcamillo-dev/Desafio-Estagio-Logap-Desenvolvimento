import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { apiRequest } from '../services/fleetApi.js'

export default function useFleetData() {
  const { session } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [maintenances, setMaintenances] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  return {
    dashboard,
    maintenances,
    vehicles,
    loading,
    error,
    setError,
    success,
    setSuccess,
    loadData,
  }
}
