import { useEffect, useState } from 'react';
import api from '../../api';
import { S, btn } from './ui';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ nom: '', icone: '' });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/api/admin/categories').then((r) => setCats(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault(); setErr('');
    try {
      if (editing) await api.put(`/api/admin/categories/${editing}`, form);
      else await api.post('/api/admin/categories', form);
      setForm({ nom: '', icone: '' }); setEditing(null); load();
    } catch (e2) {
      setErr(e2.response?.data?.message || Object.values(e2.response?.data?.errors || {}).flat().join(' ') || 'Erreur');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try { await api.delete(`/api/admin/categories/${id}`); load(); }
    catch (e2) { alert(e2.response?.data?.message || 'Suppression impossible'); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Nom</th><th style={S.th}>Icône</th><th style={S.th}>Demandes</th><th style={S.th}>Prestataires</th><th style={S.th}></th>
          </tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td style={{ ...S.td, fontWeight: 600 }}>{c.nom}</td>
                <td style={S.td}>{c.icone || '—'}</td>
                <td style={S.td}>{c.demandes_count}</td>
                <td style={S.td}>{c.prestataire_profiles_count}</td>
                <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button style={btn('light')} onClick={() => { setEditing(c.id); setForm({ nom: c.nom, icone: c.icone || '' }); }}>Modifier</button>{' '}
                  <button style={btn('danger')} onClick={() => del(c.id)}>Suppr.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form style={S.card} onSubmit={save}>
        <h3 style={{ ...S.h2, fontSize: 15, marginBottom: 12 }}>{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
        {err && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 8 }}>{err}</div>}
        <input style={{ ...S.input, width: '100%', marginBottom: 8, boxSizing: 'border-box' }} placeholder="Nom" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} required />
        <input style={{ ...S.input, width: '100%', marginBottom: 12, boxSizing: 'border-box' }} placeholder="Icône (ex: wrench)" value={form.icone} onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value }))} />
        <button type="submit" style={{ ...btn('primary'), width: '100%' }}>{editing ? 'Enregistrer' : 'Ajouter'}</button>
        {editing && <button type="button" style={{ ...btn('ghost'), width: '100%', marginTop: 6 }} onClick={() => { setEditing(null); setForm({ nom: '', icone: '' }); }}>Annuler</button>}
      </form>
    </div>
  );
}
