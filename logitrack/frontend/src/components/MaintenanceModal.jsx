import { maskBrazilianDate } from '../utils/formatters.js'
export default function MaintenanceModal({ editingMaintenance, setFormOpen, formData, setFormData, saveMaintenance, vehicles, formError, saving }) {
  return (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false) }}>
          <section className="maintenance-modal" role="dialog" aria-modal="true" aria-labelledby="maintenance-form-title">
            <div className="modal-heading"><div><p className="eyebrow">GESTÃO DE SERVIÇOS</p><h2 id="maintenance-form-title">{editingMaintenance ? 'Editar manutenção' : 'Nova manutenção'}</h2></div><button className="close-button" aria-label="Fechar" onClick={() => setFormOpen(false)}>×</button></div>
            <p className="panel-description">Informe os dados do serviço para manter a agenda atualizada.</p>
            <form onSubmit={saveMaintenance} className="maintenance-form">
              <label>Veículo<select required value={formData.veiculoId} onChange={(event) => setFormData({ ...formData, veiculoId: event.target.value })}><option value="">Selecione um veículo</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.placa} · {vehicle.modelo}</option>)}</select></label>
              <div className="form-row"><label>Data de início<input required type="text" inputMode="numeric" maxLength="10" placeholder="DD/MM/AAAA" pattern="\d{2}/\d{2}/\d{4}" title="Use o formato DD/MM/AAAA" value={formData.dataInicio} onChange={(event) => setFormData({ ...formData, dataInicio: maskBrazilianDate(event.target.value) })} /></label><label>Finalização prevista<input type="text" inputMode="numeric" maxLength="10" placeholder="DD/MM/AAAA" pattern="\d{2}/\d{2}/\d{4}" title="Use o formato DD/MM/AAAA" value={formData.dataFinalizacao} onChange={(event) => setFormData({ ...formData, dataFinalizacao: maskBrazilianDate(event.target.value) })} /></label></div><p className="field-hint">Digite as datas no formato brasileiro: dia/mês/ano.</p>
              <label>Tipo de serviço<input required type="text" maxLength="100" placeholder="Ex.: Troca de óleo" value={formData.tipoServico} onChange={(event) => setFormData({ ...formData, tipoServico: event.target.value })} /></label>
              <div className="form-row"><label>Custo estimado (R$)<input type="number" min="0" step="0.01" placeholder="0,00" value={formData.custoEstimado} onChange={(event) => setFormData({ ...formData, custoEstimado: event.target.value })} /></label><label>Status<select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })}><option value="PENDENTE">Pendente</option><option value="EM_REALIZACAO">Em realização</option><option value="CONCLUIDA">Concluída</option></select></label></div><p className="field-hint">O padrão é “Pendente”. Se o serviço já começou, escolha “Em realização”.</p>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving || vehicles.length === 0}>{saving ? 'Salvando…' : editingMaintenance ? 'Salvar alterações' : 'Criar agendamento'}</button></div>
            </form>
          </section>
        </div>
  )
}
