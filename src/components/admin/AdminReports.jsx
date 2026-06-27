import { useState } from 'react';
import api from '../../api';
import { S, btn, Tag, Pager, usePaginated, fmtDateTime } from './ui';

const STATUS_COLOR = { pending: '#f59e0b', reviewed: '#16a34a', dismissed: '#94a3b8' };
const STATUS_LABEL = { pending: 'En attente', reviewed: 'Traité', dismissed: 'Rejeté' };
const TYPE_LABEL = { demande: 'Demande', offre: 'Offre', avis: 'Avis', message: 'Message', user: 'Utilisateur' };

export default function AdminReports() {
  const [filters, setFilters] = useState({ status: '' });
  const { data, page, setPage, lastPage, total, reload } = usePaginated('/api/admin/reports', filters);

  const setStatus = async (id, status) => {
    try { await api.put(`/api/admin/reports/${id}`, { status }); reload(); } catch {}
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <select style={S.input} value={filters.status} onChange={(e) => { setPage(1); setFilters({ status: e.target.value }); }}>
          <option value="">Tous les signalements</option>
          <option value="pending">En attente</option>
          <option value="reviewed">Traités</option>
          <option value="dismissed">Rejetés</option>
        </select>
      </div>
      <div style={{ ...S.card, padding: 0, overflowX: 'auto' }}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Type</th><th style={S.th}>Cible</th><th style={S.th}>Motif</th><th style={S.th}>Signalé par</th><th style={S.th}>Statut</th><th style={S.th}>Date</th><th style={S.th}></th>
          </tr></thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td style={S.td}><Tag color="#7c3aed">{TYPE_LABEL[r.reportable_type] || r.reportable_type}</Tag></td>
                <td style={S.td}>#{r.reportable_id}</td>
                <td style={{ ...S.td, maxWidth: 260 }}>
                  {r.reason}
                  {r.details && <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{r.details}</div>}
                </td>
                <td style={S.td}>{r.reporter?.name || '—'}</td>
                <td style={S.td}><Tag color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Tag></td>
                <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDateTime(r.created_at)}</td>
                <td style={{ ...S.td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {r.status === 'pending' && (
                    <>
                      <button style={btn('light')} onClick={() => setStatus(r.id, 'reviewed')}>Traiter</button>{' '}
                      <button style={btn('ghost')} onClick={() => setStatus(r.id, 'dismissed')}>Rejeter</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }} colSpan={7}>Aucun signalement</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} lastPage={lastPage} total={total} onPage={setPage} />
    </div>
  );
}
