import { useEffect, useState } from 'react';
import api from '../../api';
import { S, btn, Tag, fmtDateTime } from './ui';

const AUD = { all: 'Tous', client: 'Clients', prestataire: 'Prestataires' };

export default function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });
  const [err, setErr] = useState('');

  const load = () => api.get('/api/admin/announcements').then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setErr('');
    try { await api.post('/api/admin/announcements', form); setForm({ title: '', body: '', audience: 'all' }); load(); }
    catch (e2) { setErr(e2.response?.data?.message || 'Erreur'); }
  };

  const del = async (id) => {
    if (window.confirm('Supprimer cette annonce ?')) { await api.delete(`/api/admin/announcements/${id}`); load(); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.length === 0 && <div style={{ ...S.card, color: '#94a3b8' }}>Aucune annonce pour le moment.</div>}
        {list.map((a) => (
          <div key={a.id} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>📢 {a.title}</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 4, whiteSpace: 'pre-wrap' }}>{a.body}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8 }}>{fmtDateTime(a.created_at)} · par {a.admin?.name || '—'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                <Tag color="#7c3aed">{AUD[a.audience]}</Tag>
                <button style={btn('danger')} onClick={() => del(a.id)}>Suppr.</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form style={S.card} onSubmit={save}>
        <h3 style={{ ...S.h2, fontSize: 15, marginBottom: 12 }}>Nouvelle annonce</h3>
        {err && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>{err}</div>}
        <input style={{ ...S.input, width: '100%', marginBottom: 8, boxSizing: 'border-box' }} placeholder="Titre" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        <textarea rows={4} style={{ ...S.input, width: '100%', marginBottom: 8, resize: 'vertical', boxSizing: 'border-box' }} placeholder="Message diffusé aux utilisateurs…" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} required />
        <select style={{ ...S.input, width: '100%', marginBottom: 12 }} value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
          <option value="all">Tous les utilisateurs</option>
          <option value="client">Clients uniquement</option>
          <option value="prestataire">Prestataires uniquement</option>
        </select>
        <button type="submit" style={{ ...btn('primary'), width: '100%' }}>Publier l'annonce</button>
      </form>
    </div>
  );
}
