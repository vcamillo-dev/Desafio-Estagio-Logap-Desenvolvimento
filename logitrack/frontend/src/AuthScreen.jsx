import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthScreen({ configured }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!configured || !supabase) {
      setError('Configure a URL e a publishable key do Supabase no arquivo .env.')
      return
    }
    if (mode === 'register' && password !== confirmation) {
      setError('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome: name },
            emailRedirectTo: window.location.origin,
          },
        })
        if (signUpError) throw signUpError
        if (!data.session) {
          setMessage('Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível concluir a solicitação.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="brand auth-brand" href="#inicio">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>LogiTrack</strong><small>GESTÃO DE FROTA</small></span>
        </a>
        <p className="eyebrow">ACESSO À PLATAFORMA</p>
        <h1>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
        <p className="auth-description">{mode === 'login' ? 'Entre para acompanhar a operação da sua frota.' : 'Cadastre-se para acessar o painel LogiTrack.'}</p>
        {!configured && <p className="form-error" role="alert">Configure a URL e a publishable key do Supabase no arquivo .env.</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && <label>Nome<input autoComplete="name" required maxLength="80" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" /></label>}
          <label>E-mail<input autoComplete="email" type="email" required maxLength="120" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></label>
          <label>Senha<input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" required minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Pelo menos 8 caracteres" /></label>
          {mode === 'register' && <label>Confirmar senha<input autoComplete="new-password" type="password" required minLength="8" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Digite a senha novamente" /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={submitting || !configured}>{submitting ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}>{mode === 'login' ? 'Criar conta' : 'Entrar'}</button></p>
      </section>
      <p className="auth-footer">LogiTrack · Gestão simples e eficiente da sua frota</p>
    </main>
  )
}
