import { formatCurrency, formatDate, maintenanceVehicle, statusLabel } from '../utils/formatters.js'
export default function MaintenancePage({ filteredMaintenances, maintenances, vehicles, maintenanceFilters, setMaintenanceFilters, loading, openEditMaintenance, deleteMaintenance }) {
  return (
          <section className="panel management-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">OPERAÇÃO DA FROTA</p><h2>Agenda de manutenções</h2></div>
              <span className="period-pill">{filteredMaintenances.length} de {maintenances.length} registros</span>
            </div>
            <p className="panel-description">Filtre e organize os agendamentos por veículo, serviço, datas, custo ou status.</p>
            <div className="maintenance-filters" aria-label="Filtros da agenda">
              <label>Veículo<select value={maintenanceFilters.vehicleId} onChange={(event) => setMaintenanceFilters({ ...maintenanceFilters, vehicleId: event.target.value })}><option value="">Todos os veículos</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.modelo} · {vehicle.placa}</option>)}</select></label>
              <label>Tipo de serviço<input type="search" placeholder="Buscar serviço" value={maintenanceFilters.service} onChange={(event) => setMaintenanceFilters({ ...maintenanceFilters, service: event.target.value })} /></label>
              <label>Status<select value={maintenanceFilters.status} onChange={(event) => setMaintenanceFilters({ ...maintenanceFilters, status: event.target.value })}><option value="">Todos os status</option><option value="PENDENTE">Pendente</option><option value="EM_REALIZACAO">Em realização</option><option value="CONCLUIDA">Concluída</option></select></label>
              <label>Ordenar por<select value={maintenanceFilters.sort} onChange={(event) => setMaintenanceFilters({ ...maintenanceFilters, sort: event.target.value })}><option value="inicio-recente">Início: mais recente</option><option value="inicio-antigo">Início: mais antigo</option><option value="previsao-proxima">Previsão: mais próxima</option><option value="previsao-distante">Previsão: mais distante</option><option value="custo-maior">Custo: maior para menor</option><option value="custo-menor">Custo: menor para maior</option></select></label>
              <button type="button" className="clear-filters" onClick={() => setMaintenanceFilters({ vehicleId: '', service: '', status: '', sort: 'inicio-recente' })}>Limpar filtros</button>
            </div>
            {loading ? <div className="empty-state">Carregando manutenções…</div> : maintenances.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">＋</span><strong>Nenhuma manutenção cadastrada</strong><span>Use “Nova manutenção” para criar o primeiro agendamento.</span></div>
            ) : filteredMaintenances.length === 0 ? (
              <div className="empty-state compact-empty"><strong>Nenhum resultado</strong><span>Ajuste os filtros para ver outras manutenções.</span></div>
            ) : (
              <div className="table-scroll"><table className="maintenance-table">
                <thead><tr><th>VEÍCULO</th><th>SERVIÇO</th><th>INÍCIO</th><th>PREVISÃO</th><th>CUSTO ESTIMADO</th><th>STATUS</th><th><span className="sr-only">Ações</span></th></tr></thead>
                <tbody>{filteredMaintenances.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{maintenanceVehicle(item)}</strong></td>
                    <td>{item.tipoServico || '—'}</td>
                    <td>{formatDate(item.dataInicio)}</td>
                    <td>{formatDate(item.dataFinalizacao)}</td>
                    <td>{formatCurrency(item.custoEstimado)}</td>
                    <td><span className={`status-badge status-${(item.status || 'PENDENTE').toLowerCase()}`}>{statusLabel(item.status)}</span></td>
                    <td className="row-actions"><button aria-label={`Editar manutenção ${item.id}`} onClick={() => openEditMaintenance(item)}>Editar</button><button className="delete-action" aria-label={`Excluir manutenção ${item.id}`} onClick={() => deleteMaintenance(item)}>Excluir</button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </section>
  )
}
