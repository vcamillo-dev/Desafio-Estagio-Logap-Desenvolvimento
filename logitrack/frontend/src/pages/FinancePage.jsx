import { formatCurrency } from '../utils/formatters.js'
export default function FinancePage({ annualFinancialSummary, financialYear, setFinancialYear, financialYears, loading, monthlyFinancialSummary, selectedYearTotal }) {
  return (
          <section className="panel management-panel financial-panel">
            <div className="panel-heading"><div><p className="eyebrow">CUSTOS DA FROTA</p><h2>Resumo anual</h2></div><span className="period-pill">Desde 2024</span></div>
            <p className="panel-description">Custos estimados das manutenções, agrupados pelo mês de início.</p>
            {loading ? <div className="empty-state">Carregando informações financeiras…</div> : (
              <>
                <div className="annual-summary-grid">{annualFinancialSummary.map((summary) => (
                  <button type="button" key={summary.year} className={financialYear === summary.year ? 'annual-year-card selected' : 'annual-year-card'} onClick={() => setFinancialYear(summary.year)}>
                    <span>{summary.year}</span><strong>{formatCurrency(summary.total)}</strong><small>{summary.count} {summary.count === 1 ? 'manutenção' : 'manutenções'}</small>
                  </button>
                ))}</div>
                <div className="financial-month-heading"><div><p className="eyebrow">DETALHAMENTO</p><h2>Gastos por mês</h2></div><label>Ano<select value={financialYear} onChange={(event) => setFinancialYear(Number(event.target.value))}>{financialYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label></div>
                <p className="panel-description">Total estimado de manutenções iniciadas em cada mês.</p>
                <div className="table-scroll"><table className="maintenance-table financial-table">
                  <thead><tr><th>MÊS</th><th>MANUTENÇÕES</th><th>CUSTO ESTIMADO</th></tr></thead>
                  <tbody>{monthlyFinancialSummary.map((month) => (
                    <tr key={month.month}><td className="capitalize">{month.label}</td><td>{month.count}</td><td><strong>{formatCurrency(month.total)}</strong></td></tr>
                  ))}</tbody>
                  <tfoot><tr><th>Total de {financialYear}</th><th>{monthlyFinancialSummary.reduce((sum, month) => sum + month.count, 0)}</th><th>{formatCurrency(selectedYearTotal)}</th></tr></tfoot>
                </table></div>
              </>
            )}
          </section>
  )
}
