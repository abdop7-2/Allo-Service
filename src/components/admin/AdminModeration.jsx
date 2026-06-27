import { useState } from 'react';
import api from '../../api';
import { S, btn, Tag, Pager, usePaginated, STATUT_COLOR, fmtDate, fmtMAD } from './ui';

const DEMANDE_STATUTS = ['ouverte', 'en_cours', 'terminee', 'annulee'];
const OFFRE_STATUTS = ['en_attente', 'acceptee', 'refusee', 'negociation'];

function DemandesRows({ data, onDel, onStatut }) {
  return (
    <>
      <thead><tr><th style={S.th}>Titre</th><th style={S.th}>Client</th><th style={S.th}>Catégorie</th><th style={S.th}>Offres</th><th style={S.th}>Statut</th><th style={S.th}>Date</th><th style={S.th}></th></tr></thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.id}>
            <td style={{ ...S.td, fontWeight: 600, maxWidth: 240 }}>{d.title}</td>
            <td style={S.td}>{d.client?.name || '—'}</td>
            <td style={S.td}>{d.category?.nom || '—'}</td>
            <td style={S.td}>{d.offres_count}</td>
            <td style={S.td}>
              <select value={d.statut} onChange={(e) => onStatut(d.id, e.target.value)} style={{ ...S.input, padding: '4px 8px', fontSize: 12, color: STATUT_COLOR[d.statut], fontWeight: 600 }}>
                {DEMANDE_STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
            <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDate(d.created_at)}</td>
            <td style={{ ...S.td, textAlign: 'right' }}><button style={btn('danger')} onClick={() => onDel(d.id)}>Suppr.</button></td>
          </tr>
        ))}
        {data.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }} colSpan={7}>Aucune demande</td></tr>}
      </tbody>
    </>
  );
}

function OffresRows({ data, onDel }) {
  return (
    <>
      <thead><tr><th style={S.th}>Demande</th><th style={S.th}>Prestataire</th><th style={S.th}>Devis</th><th style={S.th}>Statut</th><th style={S.th}>Date</th><th style={S.th}></th></tr></thead>
      <tbody>
        {data.map((o) => (
          <tr key={o.id}>
            <td style={{ ...S.td, maxWidth: 240 }}>{o.demande?.title || '—'}</td>
            <td style={S.td}>{o.prestataire?.name || '—'}</td>
            <td style={{ ...S.td, fontWeight: 600 }}>{fmtMAD(o.devis)}</td>
            <td style={S.td}><Tag color={STATUT_COLOR[o.statut]}>{o.statut}</Tag></td>
            <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDate(o.created_at)}</td>
            <td style={{ ...S.td, textAlign: 'right' }}><button style={btn('danger')} onClick={() => onDel(o.id)}>Suppr.</button></td>
          </tr>
        ))}
        {data.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }} colSpan={6}>Aucune offre</td></tr>}
      </tbody>
    </>
  );
}

function AvisRows({ data, onDel }) {
  return (
    <>
      <thead><tr><th style={S.th}>Note</th><th style={S.th}>Commentaire</th><th style={S.th}>Client</th><th style={S.th}>Prestataire</th><th style={S.th}>Date</th><th style={S.th}></th></tr></thead>
      <tbody>
        {data.map((a) => (
          <tr key={a.id}>
            <td style={{ ...S.td, color: '#eab308', fontWeight: 700, whiteSpace: 'nowrap' }}>{'★'.repeat(a.note)}{'☆'.repeat(Math.max(0, 5 - a.note))}</td>
            <td style={{ ...S.td, maxWidth: 280, color: '#475569' }}>{a.commentaire || '—'}</td>
            <td style={S.td}>{a.client?.name || '—'}</td>
            <td style={S.td}>{a.prestataire?.name || '—'}</td>
            <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDate(a.created_at)}</td>
            <td style={{ ...S.td, textAlign: 'right' }}><button style={btn('danger')} onClick={() => onDel(a.id)}>Suppr.</button></td>
          </tr>
        ))}
        {data.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }} colSpan={6}>Aucun avis</td></tr>}
      </tbody>
    </>
  );
}

export default function AdminModeration({ resource }) {
  const [filters, setFilters] = useState({ search: '', statut: '' });
  const { data, page, setPage, lastPage, total, reload } = usePaginated(`/api/admin/${resource}`, filters);

  const del = async (id) => {
    const labels = { demandes: 'cette demande', offres: 'cette offre', avis: 'cet avis' };
    if (!window.confirm(`Supprimer ${labels[resource]} ?`)) return;
    try { await api.delete(`/api/admin/${resource}/${id}`); reload(); } catch { alert('Suppression impossible'); }
  };
  const setStatut = async (id, statut) => { try { await api.put(`/api/admin/demandes/${id}/statut`, { statut }); reload(); } catch {} };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input style={{ ...S.input, flex: 1, minWidth: 180 }}
          placeholder={resource === 'avis' ? 'Rechercher un commentaire…' : 'Rechercher…'} value={filters.search}
          onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, search: e.target.value })); }} />
        {(resource === 'demandes' || resource === 'offres') && (
          <select style={S.input} value={filters.statut} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, statut: e.target.value })); }}>
            <option value="">Tous statuts</option>
            {(resource === 'demandes' ? DEMANDE_STATUTS : OFFRE_STATUTS).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      <div style={{ ...S.card, padding: 0, overflowX: 'auto' }}>
        <table style={S.table}>
          {resource === 'demandes' && <DemandesRows data={data} onDel={del} onStatut={setStatut} />}
          {resource === 'offres' && <OffresRows data={data} onDel={del} />}
          {resource === 'avis' && <AvisRows data={data} onDel={del} />}
        </table>
      </div>
      <Pager page={page} lastPage={lastPage} total={total} onPage={setPage} />
    </div>
  );
}
