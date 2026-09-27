import { useState } from 'react'
import { maintenanceVehicle, statusLabel, toBrazilianDate, toIsoDate } from '../utils/formatters.js'
import { apiRequest } from '../services/fleetApi.js'

const emptyVehicle = { placa: '', modelo: '', tipo: 'LEVE', ano: '' }
const emptyMaintenance = {
  veiculoId: '',
  dataInicio: '',
  dataFinalizacao: '',
  tipoServico: '',
  custoEstimado: '',
  status: 'PENDENTE',
}

export default function useFleetActions({ loadData, setError, setSuccess }) {
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
  const [editingMaintenance, setEditingMaintenance] = useState(null)
  const [formData, setFormData] = useState(emptyMaintenance)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

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
      ? '/api/manutencoes/' + editingMaintenance.id
      : '/api/manutencoes'

    try {
      await apiRequest(path, {
        method: editingMaintenance ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      setFormOpen(false)
      await loadData()
      setSuccess('Manutenção salva com status: ' + statusLabel(payload.status) + '.')
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
      const details = await apiRequest('/api/veiculos/' + vehicle.id + '/detalhes')
      setVehicleDetails(details)
    } catch (detailsError) {
      setVehicleDetailsError(detailsError.message || 'Não foi possível carregar as viagens deste veículo.')
    } finally {
      setVehicleDetailsLoading(false)
    }
  }

  async function deleteVehicle(vehicle) {
    const confirmed = window.confirm(
      'Excluir ' + vehicle.modelo + ' (' + vehicle.placa + ')? As viagens e manutenções associadas também serão removidas.',
    )
    if (!confirmed) return

    setDeletingVehicle(true)
    setVehicleDetailsError('')
    try {
      await apiRequest('/api/veiculos/' + vehicle.id, { method: 'DELETE' })
      setSelectedVehicle(null)
      await loadData()
      setSuccess('Veículo ' + vehicle.placa + ' excluído com sucesso.')
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
      setSuccess('Veículo ' + payload.placa + ' cadastrado com sucesso.')
    } catch (saveError) {
      setVehicleFormError(saveError.message || 'Não foi possível cadastrar o veículo.')
    } finally {
      setSavingVehicle(false)
    }
  }

  async function deleteMaintenance(maintenance) {
    const shouldDelete = window.confirm('Deseja excluir a manutenção de ' + maintenanceVehicle(maintenance) + '?')
    if (!shouldDelete) return

    try {
      await apiRequest('/api/manutencoes/' + maintenance.id, { method: 'DELETE' })
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Não foi possível excluir a manutenção.')
    }
  }

  return {
    formOpen, setFormOpen, editingMaintenance, formData, setFormData, formError, saving,
    vehicleFormOpen, setVehicleFormOpen, vehicleFormData, setVehicleFormData, vehicleFormError, savingVehicle,
    selectedVehicle, setSelectedVehicle, vehicleDetails, vehicleDetailsLoading, vehicleDetailsError,
    deletingVehicle, openNewMaintenance, openEditMaintenance, saveMaintenance, openNewVehicle,
    openVehicleDetails, deleteVehicle, saveVehicle, deleteMaintenance,
  }
}
