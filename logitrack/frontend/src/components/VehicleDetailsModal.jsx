import { formatDateTime, formatNumber } from '../utils/formatters.js'
export default function VehicleDetailsModal({ selectedVehicle, setSelectedVehicle, vehicleDetailsLoading, vehicleDetailsError, vehicleDetails, deletingVehicle, deleteVehicle }) {
  return (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedVehicle(null) }}>
          <section className="maintenance-modal vehicle-details-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-details-title">
            <div className="modal-heading"><div><p className="eyebrow">HISTÓRICO DO VEÍCULO</p><h2 id="vehicle-details-title">{selectedVehicle.modelo}</h2><p className="panel-description">Placa {selectedVehicle.placa} · {selectedVehicle.tipo === 'LEVE' ? 'Leve' : 'Pesado'}</p></div><button className="close-button" aria-label="Fechar detalhes do veículo" onClick={() => setSelectedVehicle(null)}>×</button></div>
            {vehicleDetailsLoading ? <div className="empty-state">Carregando viagens…</div> : vehicleDetailsError ? <p className="form-error" role="alert">{vehicleDetailsError}</p> : vehicleDetails && (
              <>
                <div className="vehicle-detail-stats"><article><span>Viagens feitas</span><strong>{formatNumber(vehicleDetails.totalViagens)}</strong></article><article><span>Distância percorrida</span><strong>{formatNumber(vehicleDetails.distanciaTotalKm, 2)} km</strong></article></div>
                <h3 className="vehicle-trips-title">Viagens</h3>
                {vehicleDetails.viagens.length === 0 ? <div className="empty-state compact-empty"><strong>Nenhuma viagem cadastrada</strong><span>As viagens deste veículo aparecerão aqui.</span></div> : (
                  <div className="vehicle-trip-list">{vehicleDetails.viagens.map((trip) => (
                    <article className="vehicle-trip-row" key={trip.id}>
                      <div><strong>{trip.origem || 'Origem não informada'} → {trip.destino || 'Destino não informado'}</strong><span>Saída: {formatDateTime(trip.dataSaida)} · Chegada: {formatDateTime(trip.dataChegada)}</span></div>
                      <strong className="vehicle-trip-distance">{formatNumber(trip.kmPercorrida, 2)} km</strong>
                    </article>
                  ))}</div>
                )}
                <div className="vehicle-details-actions"><button type="button" className="delete-vehicle-button" disabled={deletingVehicle} onClick={() => deleteVehicle(selectedVehicle)}>{deletingVehicle ? 'Excluindo…' : 'Excluir veículo'}</button></div>
              </>
            )}
          </section>
        </div>
  )
}
