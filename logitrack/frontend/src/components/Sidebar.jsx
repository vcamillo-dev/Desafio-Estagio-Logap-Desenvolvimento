import { NavLink } from 'react-router-dom'
export default function Sidebar({ maintenanceCount, vehicleCount, hasError }) {
  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>LogiTrack</strong><small>GESTÃO DE FROTA</small></span>
      </NavLink>
      <div className="nav-caption">MENU PRINCIPAL</div>
      <nav className="main-nav" aria-label="Navegação principal">
        <NavLink end to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><span className="nav-icon" aria-hidden="true">▦</span>Dashboard</NavLink>
        <NavLink to="/manutencoes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><span className="nav-icon" aria-hidden="true">⌁</span>Manutenções<span className="nav-count">{maintenanceCount}</span></NavLink>
        <NavLink to="/veiculos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><span className="nav-icon" aria-hidden="true">▱</span>Veículos<span className="nav-count">{vehicleCount}</span></NavLink>
        <NavLink to="/financeiro" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><span className="nav-icon nav-currency-icon" aria-hidden="true">R$</span>Financeiro</NavLink>
      </nav>
      <div className="sidebar-bottom"><span className="connection-dot" /><span><strong>API LogiTrack</strong><small>{hasError ? 'Verifique a conexão' : 'Conectada ao ambiente'}</small></span></div>
    </aside>
  )
}
