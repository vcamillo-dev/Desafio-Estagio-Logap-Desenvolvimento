export default function VehiclesPage({ vehicles, filteredVehicles, vehicleFilters, setVehicleFilters, vehicleYears, loading, openVehicleDetails }) {
  return (
          <section className="panel management-panel">
            <div className="panel-heading"><div><p className="eyebrow">CADASTRO DA FROTA</p><h2>Veículos cadastrados</h2></div><span className="period-pill">{filteredVehicles.length} de {vehicles.length} veículos</span></div>
            <p className="panel-description">Veículos disponíveis para consulta e agendamento de manutenção.</p>
            <div className="maintenance-filters vehicle-filters" aria-label="Filtros da lista de veículos">
              <label>Buscar<input type="search" placeholder="Modelo ou placa" value={vehicleFilters.search} onChange={(event) => setVehicleFilters({ ...vehicleFilters, search: event.target.value })} /></label>
              <label>Tipo<select value={vehicleFilters.type} onChange={(event) => setVehicleFilters({ ...vehicleFilters, type: event.target.value })}><option value="">Todos os tipos</option><option value="LEVE">Leve</option><option value="PESADO">Pesado</option></select></label>
              <label>Ano<select value={vehicleFilters.year} onChange={(event) => setVehicleFilters({ ...vehicleFilters, year: event.target.value })}><option value="">Todos os anos</option>{vehicleYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
              <label>Ordenar por<select value={vehicleFilters.sort} onChange={(event) => setVehicleFilters({ ...vehicleFilters, sort: event.target.value })}><option value="modelo-az">Modelo: A a Z</option><option value="modelo-za">Modelo: Z a A</option><option value="placa-az">Placa: A a Z</option><option value="placa-za">Placa: Z a A</option><option value="ano-novo">Ano: mais novo</option><option value="ano-antigo">Ano: mais antigo</option></select></label>
              <button type="button" className="clear-filters" onClick={() => setVehicleFilters({ search: '', type: '', year: '', sort: 'modelo-az' })}>Limpar filtros</button>
            </div>
            {loading ? <div className="empty-state">Carregando veículos…</div> : vehicles.length === 0 ? <div className="empty-state"><strong>Nenhum veículo cadastrado</strong><span>Use “Novo veículo” para adicionar o primeiro veículo à frota.</span></div> : (
              filteredVehicles.length === 0 ? <div className="empty-state compact-empty"><strong>Nenhum resultado</strong><span>Ajuste os filtros para ver outros veículos.</span></div> : <div className="vehicle-grid">{filteredVehicles.map((vehicle) => (
                <article className="vehicle-card" key={vehicle.id}>
                  <button type="button" className="vehicle-summary" aria-label={`Ver viagens e quilometragem de ${vehicle.modelo}`} onClick={() => openVehicleDetails(vehicle)}>
                    <span className="vehicle-card-icon" aria-hidden="true">▱</span><span><h3>{vehicle.modelo}</h3><span className="vehicle-plate">Placa {vehicle.placa}</span><p>{vehicle.ano || 'Ano não informado'} <span>·</span> {vehicle.tipo === 'LEVE' ? 'Leve' : 'Pesado'}</p></span>
                  </button>
                </article>
              ))}</div>
            )}
          </section>
  )
}
