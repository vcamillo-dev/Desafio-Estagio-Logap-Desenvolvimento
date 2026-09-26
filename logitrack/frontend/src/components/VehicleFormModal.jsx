export default function VehicleFormModal({ setVehicleFormOpen, saveVehicle, vehicleFormData, setVehicleFormData, vehicleFormError, savingVehicle }) {
  return (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVehicleFormOpen(false) }}>
          <section className="maintenance-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-form-title">
            <div className="modal-heading"><div><p className="eyebrow">CADASTRO DA FROTA</p><h2 id="vehicle-form-title">Novo veículo</h2></div><button className="close-button" aria-label="Fechar" onClick={() => setVehicleFormOpen(false)}>×</button></div>
            <p className="panel-description">Preencha os dados do veículo para adicioná-lo à frota.</p>
            <form onSubmit={saveVehicle} className="maintenance-form">
              <label>Placa<input required type="text" maxLength="10" placeholder="Ex.: ABC-1234" value={vehicleFormData.placa} onChange={(event) => setVehicleFormData({ ...vehicleFormData, placa: event.target.value.toUpperCase() })} /></label>
              <label>Modelo<input required type="text" maxLength="50" placeholder="Ex.: Fiat Fiorino" value={vehicleFormData.modelo} onChange={(event) => setVehicleFormData({ ...vehicleFormData, modelo: event.target.value })} /></label>
              <div className="form-row"><label>Tipo<select required value={vehicleFormData.tipo} onChange={(event) => setVehicleFormData({ ...vehicleFormData, tipo: event.target.value })}><option value="LEVE">Leve</option><option value="PESADO">Pesado</option></select></label><label>Ano<input type="number" min="1900" max={new Date().getFullYear() + 1} placeholder="Ex.: 2024" value={vehicleFormData.ano} onChange={(event) => setVehicleFormData({ ...vehicleFormData, ano: event.target.value })} /></label></div>
              {vehicleFormError && <p className="form-error" role="alert">{vehicleFormError}</p>}
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setVehicleFormOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={savingVehicle}>{savingVehicle ? 'Salvando…' : 'Cadastrar veículo'}</button></div>
            </form>
          </section>
        </div>
  )
}
