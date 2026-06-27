import { useState } from 'react';
import api from '../../api';
import { S, btn, Avatar, Tag, Pager, usePaginated, ROLE_COLOR, STATUT_COLOR, fmtDate } from './ui';

const ROLE_LABEL = { client: 'Client', prestataire: 'Prestataire', admin: 'Admin' };
const inp = { ...S.input, width: '100%', boxSizing: 'border-box', marginTop: 4 };

function Item({ children, onClick, danger }) {
  return (
    <div onClick={onClick}
      style={{ padding: '7px 8px', fontSize: 12.5, cursor: 'pointer', borderRadius: 6, color: danger ? '#dc2626' : '#334155' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      {children}
    </div>
  );
}

function Actions({ u, onEdit, onSuspend, onReactivate, onVerify, onRole, onDelete }) {
  return (
    <details style={{ position: 'relative', display: 'inline-block' }}>
      <summary style={{ listStyle: 'none', cursor: 'pointer', padding: '3px 10px', borderRadius: 6, background: '#f1f5f9', fontWeight: 700 }}>⋯</summary>
      <div style={{ position: 'absolute', right: 0, top: '112%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, minWidth: 190, padding: 6 }}>
        <Item onClick={() => onEdit(u)}>✎ Modifier</Item>
        {u.is_active ? <Item onClick={() => onSuspend(u)} danger>⊘ Suspendre</Item> : <Item onClick={() => onReactivate(u)}>✓ Réactiver</Item>}
        {u.role === 'prestataire' && (u.prestataire_profile?.is_verified
          ? <Item onClick={() => onVerify(u, false)}>✗ Retirer la vérification</Item>
          : <Item onClick={() => onVerify(u, true)}>✓ Vérifier</Item>)}
        <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
        <div style={{ fontSize: 10.5, color: '#94a3b8', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Changer le rôle</div>
        {['client', 'prestataire', 'admin'].filter((r) => r !== u.role).map((r) => <Item key={r} onClick={() => onRole(u, r)}>→ {ROLE_LABEL[r]}</Item>)}
        <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
        <Item onClick={() => onDelete(u)} danger>🗑 Supprimer</Item>
      </div>
    </details>
  );
}

function Overlay({ children, onClose, width = 460 }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 22, width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>{children}</div>
    </div>
  );
}

export default function AdminUsers() {
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const { data, page, setPage, lastPage, total, reload } = usePaginated('/api/admin/users', filters);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const act = async (fn) => { try { await fn(); reload(); } catch (e) { alert(e.response?.data?.message || 'Action impossible'); } };
  const suspend = (u) => { const reason = window.prompt(`Suspendre ${u.name} ? Raison (optionnelle) :`, ''); if (reason === null) return; act(() => api.put(`/api/admin/users/${u.id}/suspend`, { reason })); };
  const reactivate = (u) => act(() => api.put(`/api/admin/users/${u.id}/reactivate`));
  const verify = (u, val) => act(() => api.put(`/api/admin/users/${u.id}/verify`, { verified: val }));
  const setRole = (u, role) => act(() => api.put(`/api/admin/users/${u.id}/role`, { role }));
  const del = (u) => { if (window.confirm(`Supprimer définitivement ${u.name} et toutes ses données ?`)) act(() => api.delete(`/api/admin/users/${u.id}`)); };
  const openEdit = (u) => { setEditing(u.id); setEditForm({ name: u.name, email: u.email, phone: u.phone || '' }); };
  const saveEdit = async () => { await act(() => api.put(`/api/admin/users/${editing}`, editForm)); setEditing(null); };
  const openDetail = async (u) => { try { setDetail((await api.get(`/api/admin/users/${u.id}`)).data); } catch {} };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input style={{ ...S.input, flex: 1, minWidth: 180 }} placeholder="Rechercher nom ou email…" value={filters.search}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })); }} />
        <select style={S.input} value={filters.role} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, role: e.target.value })); }}>
          <option value="">Tous les rôles</option><option value="client">Clients</option><option value="prestataire">Prestataires</option><option value="admin">Admins</option>
        </select>
        <select style={S.input} value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
          <option value="">Tous statuts</option><option value="active">Actifs</option><option value="suspended">Suspendus</option>
        </select>
      </div>

      <div style={{ ...S.card, padding: 0, overflowX: 'auto' }}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Utilisateur</th><th style={S.th}>Rôle</th><th style={S.th}>Statut</th><th style={S.th}>Demandes</th><th style={S.th}>Offres</th><th style={S.th}>Inscrit</th><th style={S.th}></th>
          </tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => openDetail(u)}>
                    <Avatar user={u} size={34} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.name} {u.prestataire_profile?.is_verified && <span title="Vérifié" style={{ color: '#0ea5e9' }}>✓</span>}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={S.td}><Tag color={ROLE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Tag></td>
                <td style={S.td}>{u.is_active ? <Tag color="#22c55e">Actif</Tag> : <Tag color="#ef4444">Suspendu</Tag>}</td>
                <td style={S.td}>{u.demandes_count}</td>
                <td style={S.td}>{u.offres_count}</td>
                <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDate(u.created_at)}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <Actions u={u} onEdit={openEdit} onSuspend={suspend} onReactivate={reactivate} onVerify={verify} onRole={setRole} onDelete={del} />
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td style={{ ...S.td, color: '#94a3b8', textAlign: 'center' }} colSpan={7}>Aucun utilisateur</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} lastPage={lastPage} total={total} onPage={setPage} />

      {editing && (
        <Overlay onClose={() => setEditing(null)}>
          <h3 style={{ ...S.h2, fontSize: 16, marginBottom: 14 }}>Modifier l'utilisateur</h3>
          <label style={{ fontSize: 12, color: '#64748b' }}>Nom<input style={inp} value={editForm.name || ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 10 }}>Email<input style={inp} value={editForm.email || ''} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} /></label>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 10 }}>Téléphone<input style={inp} value={editForm.phone || ''} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} /></label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button style={btn('ghost')} onClick={() => setEditing(null)}>Annuler</button>
            <button style={btn('primary')} onClick={saveEdit}>Enregistrer</button>
          </div>
        </Overlay>
      )}

      {detail && (
        <Overlay onClose={() => setDetail(null)} width={540}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <Avatar user={detail.user} size={48} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{detail.user.name}</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{detail.user.email} · {detail.user.phone || 'sans téléphone'}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}><Tag color={ROLE_COLOR[detail.user.role]}>{ROLE_LABEL[detail.user.role]}</Tag></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <Tag color="#2563eb">{detail.stats.demandes} demandes</Tag>
            <Tag color="#6366f1">{detail.stats.offres} offres</Tag>
            <Tag color="#eab308">{detail.stats.avis_recus} avis reçus</Tag>
            {!detail.user.is_active && <Tag color="#ef4444">Suspendu{detail.user.suspended_reason ? ` : ${detail.user.suspended_reason}` : ''}</Tag>}
          </div>
          {detail.demandes?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Demandes récentes</div>
              {detail.demandes.map((d) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
                  <span>{d.title}</span><Tag color={STATUT_COLOR[d.statut]}>{d.statut}</Tag>
                </div>
              ))}
            </div>
          )}
          {detail.offres?.length > 0 && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Offres récentes</div>
              {detail.offres.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
                  <span>{o.demande?.title || 'Demande'}</span><Tag color={STATUT_COLOR[o.statut]}>{o.statut}</Tag>
                </div>
              ))}
            </div>
          )}
        </Overlay>
      )}
    </div>
  );
}
