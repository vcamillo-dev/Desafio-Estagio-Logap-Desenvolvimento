export default function AppHeader({ pageTitle, pageDescription, userLabel, userInitial, onSignOut, showAction, actionLabel, onAction }) {
  return (
    <>
      <header className="topbar">
        <div className="breadcrumbs"><span>LogiTrack</span><b>/</b><strong>{pageTitle}</strong></div>
        <div className="topbar-right"><span className="today-date">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())}</span><span className="user-name">{userLabel}</span><span className="avatar">{userInitial}</span><button className="logout-button" onClick={onSignOut}>Sair</button></div>
      </header>
      <div className="page-heading">
        <div><p className="eyebrow">PAINEL DE CONTROLE</p><h1>{pageTitle}</h1><p className="page-subtitle">{pageDescription}</p></div>
        {showAction && <button className="primary-button" onClick={onAction}><span aria-hidden="true">＋</span> {actionLabel}</button>}
      </div>
    </>
  )
}
