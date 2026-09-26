import { formatCurrency, formatDate, formatNumber, maintenanceVehicle, statusLabel } from '../utils/formatters.js'
export default function DashboardPage({ loading, dashboard, categories, maximumCategory, monthName, inProgressMaintenances, topVehicle, upcomingMaintenances, setActivePage, overdueMaintenances, openNewMaintenance }) {
  return (
          <>
            <section className="stats-grid" aria-label="Indicadores principais">
              <article className="stat-card stat-blue">
                <div className="stat-top"><span className="stat-icon">↗</span><span className="stat-label">QUILOMETRAGEM TOTAL</span></div>
                <strong className="stat-value">{loading ? '—' : formatNumber(dashboard?.totalKmPercorrido, 0)} <small>km</small></strong>
                <span className="stat-foot">Distância percorrida por toda a frota</span>
              </article>
              <article className="stat-card stat-green">
                <div className="stat-top"><span className="stat-icon">R$</span><span className="stat-label">PROJEÇÃO FINANCEIRA</span></div>
                <strong className="stat-value">{loading ? '—' : formatCurrency(dashboard?.custoTotalMesAtual)}</strong>
                <span className="stat-foot">Custos estimados em <span className="capitalize">{monthName}</span></span>
              </article>
              <article className="stat-card stat-amber">
                <div className="stat-top"><span className="stat-icon">★</span><span className="stat-label">MAIOR UTILIZAÇÃO</span></div>
                <strong className="stat-value vehicle-stat">{topVehicle.placa || (loading ? '—' : 'Sem viagens')}</strong>
                <span className="stat-foot">{topVehicle.modelo || 'Veículo com maior quilometragem acumulada'}{topVehicle.totalKm != null ? ` · ${formatNumber(topVehicle.totalKm)} km` : ''}</span>
              </article>
              <article className="stat-card stat-purple">
                <div className="stat-top"><span className="stat-icon">◷</span><span className="stat-label">EM ANDAMENTO</span></div>
                <strong className="stat-value">{loading ? '—' : inProgressMaintenances.length}</strong>
                <span className="stat-foot">Serviços marcados como em realização</span>
              </article>
            </section>

            <section className="dashboard-grid">
              <article className="panel category-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">DESEMPENHO DA FROTA</p><h2>Viagens por categoria</h2></div>
                  <span className="period-pill">Por tipo de veículo</span>
                </div>
                <p className="panel-description">Quantidade de viagens registradas para cada categoria.</p>
                <div className="category-chart">
                  {categories.map((category, index) => (
                    <div className="category-column" key={category.name}>
                      <strong className="category-total">{loading ? '—' : formatNumber(category.total)}</strong>
                      <div className="bar-track"><div className={`bar-fill bar-${index}`} style={{ height: `${Math.max((category.total / maximumCategory) * 100, category.total ? 8 : 0)}%` }} /></div>
                      <span className="category-name">{category.name === 'LEVE' ? 'Leves' : 'Pesados'}</span>
                      <span className="category-note">{category.name === 'LEVE' ? 'Categoria leve' : 'Categoria pesada'}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-legend"><span><i className="legend-dot legend-blue" /> Veículos leves</span><span><i className="legend-dot legend-teal" /> Veículos pesados</span></div>
              </article>

              <article className="panel schedule-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">ACOMPANHAMENTO</p><h2>Próximas manutenções</h2></div>
                  <button className="text-button" onClick={() => setActivePage('manutencoes')}>Ver todas <span>→</span></button>
                </div>
                <p className="panel-description">Até 5 serviços agendados, organizados por data.</p>
                {loading ? <div className="empty-state">Carregando agenda…</div> : upcomingMaintenances.length === 0 ? (
                  <div className="empty-state"><span className="empty-icon">✓</span><strong>Nenhuma manutenção futura</strong><span>Não há serviço com início a partir de hoje.</span></div>
                ) : (
                  <div className="schedule-list">
                    {upcomingMaintenances.map((item) => (
                      <div className="schedule-row" key={item.id}>
                        <div className="schedule-date"><strong>{formatDate(item.dataInicio).slice(0, 2)}</strong><span>{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(`${item.dataInicio}T12:00:00`)).replace('.', '')}</span></div>
                        <div className="schedule-info"><strong>{item.tipoServico || 'Manutenção'}</strong><span>{maintenanceVehicle(item)} · {item.veiculo?.modelo || 'Frota'}</span></div>
                        <span className={`status-badge status-${(item.status || 'PENDENTE').toLowerCase()}`}>{statusLabel(item.status)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!loading && overdueMaintenances.length > 0 && (
                  <div className="overdue-section">
                    <div className="overdue-heading"><strong>Registros com data passada</strong><span>{overdueMaintenances.length} sem conclusão</span></div>
                    <div className="schedule-list">
                      {overdueMaintenances.map((item) => (
                        <div className="schedule-row overdue-row" key={`overdue-${item.id}`}>
                          <div className="schedule-date overdue-date"><strong>{formatDate(item.dataInicio).slice(0, 2)}</strong><span>{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(`${item.dataInicio}T12:00:00`)).replace('.', '')}</span></div>
                          <div className="schedule-info"><strong>{item.tipoServico || 'Manutenção'}</strong><span>{maintenanceVehicle(item)} · prevista para {formatDate(item.dataFinalizacao || item.dataInicio)}</span></div>
                          <span className="status-badge status-overdue">Data passada</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button className="schedule-footer" onClick={openNewMaintenance}>＋ Agendar manutenção</button>
              </article>
            </section>

            <section className="panel active-work-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">STATUS DA OPERAÇÃO</p><h2>Processos em andamento</h2></div>
                <span className="period-pill">{inProgressMaintenances.length} {inProgressMaintenances.length === 1 ? 'serviço' : 'serviços'}</span>
              </div>
              <p className="panel-description">Manutenções cujo status está marcado como “Em realização”.</p>
              {loading ? <div className="empty-state">Carregando processos…</div> : inProgressMaintenances.length === 0 ? (
                <div className="empty-state compact-empty"><strong>Nenhum serviço em andamento</strong><span>Ao cadastrar, escolha “Em realização” se o serviço já começou.</span><button className="text-button" onClick={openNewMaintenance}>＋ Nova manutenção</button></div>
              ) : (
                <div className="active-maintenance-list">{inProgressMaintenances.map((item) => (
                  <article className="active-maintenance-row" key={item.id}>
                    <span className="active-work-icon" aria-hidden="true">⌁</span>
                    <div className="active-work-main"><strong>{item.tipoServico || 'Manutenção'}</strong><span>{maintenanceVehicle(item)} · {item.veiculo?.modelo || 'Frota'}</span></div>
                    <div className="active-work-dates"><span>Início <strong>{formatDate(item.dataInicio)}</strong></span><span>Previsão <strong>{formatDate(item.dataFinalizacao)}</strong></span></div>
                    <strong className="active-work-cost">{formatCurrency(item.custoEstimado)}</strong>
                    <span className="status-badge status-em_realizacao">Em realização</span>
                  </article>
                ))}</div>
              )}
            </section>

            <div className="dashboard-note"><span className="note-mark">i</span><span>Indicadores calculados a partir dos dados cadastrados no LogiTrack. O ranking considera a quilometragem acumulada por veículo.</span></div>
          </>
  )
}
