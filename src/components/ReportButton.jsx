import { useState } from 'react';
import api from '../api';

const REASONS = ['Contenu inapproprié', 'Spam ou arnaque', 'Faux profil', 'Comportement abusif', 'Autre'];

const inp = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, margin: '4px 0 10px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const btnGhost = { background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnDanger = { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };

export default function ReportButton({ type, id, label = 'Signaler', style }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true); setMsg('');
    try {
      await api.post('/api/reports', { reportable_type: type, reportable_id: id, reason, details });
      setMsg('ok');
      setTimeout(() => { setOpen(false); setMsg(''); setDetails(''); }, 1200);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Une erreur est survenue.');
    } finally { setSending(false); }
  };

  return (
    <>
      <button type="button" title="Signaler"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 12, cursor: 'pointer', ...style }}>
        ⚑{label ? ' ' + label : ''}
      </button>
      {open && (
        <div onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 22, width: 'min(400px, 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Signaler ce contenu</h3>
            {msg === 'ok' ? (
              <p style={{ color: '#16a34a', fontSize: 13.5, margin: 0 }}>✅ Signalement envoyé. Merci de votre vigilance.</p>
            ) : (
              <>
                {msg && <p style={{ color: '#dc2626', fontSize: 12.5, marginBottom: 8 }}>{msg}</p>}
                <label style={{ fontSize: 12, color: '#64748b' }}>Motif</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} style={inp}>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea placeholder="Détails (optionnel)" value={details} onChange={(e) => setDetails(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => setOpen(false)} style={btnGhost}>Annuler</button>
                  <button onClick={submit} disabled={sending} style={btnDanger}>{sending ? '...' : 'Envoyer'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
