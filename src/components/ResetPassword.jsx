import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const inp = {
  width: '100%', padding: '11px 13px', borderRadius: 10, border: '1.5px solid #e2e8f0',
  fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      await api.post('/api/reset-password', { token, email, password, password_confirmation: confirm });
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #eef2ff 55%, #e0f2fe 100%)',
      fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20,
    }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 'min(420px, 100%)', boxShadow: '0 18px 44px rgba(15,23,42,.14)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Nouveau mot de passe</h1>
        {done ? (
          <p style={{ color: '#16a34a', fontSize: 14 }}>✅ Mot de passe réinitialisé. Redirection vers la connexion…</p>
        ) : !token || !email ? (
          <p style={{ color: '#dc2626', fontSize: 13.5 }}>Lien de réinitialisation invalide.</p>
        ) : (
          <form onSubmit={submit}>
            <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px' }}>Pour le compte <b>{email}</b></p>
            {error && <p style={{ color: '#dc2626', fontSize: 12.5, marginBottom: 10 }}>{error}</p>}
            <input type="password" placeholder="Nouveau mot de passe (min. 8)" value={password} onChange={(e) => setPassword(e.target.value)} required style={inp} />
            <input type="password" placeholder="Confirmer le mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inp} />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 10, border: 'none',
              background: '#0d9488', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 6,
            }}>
              {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
