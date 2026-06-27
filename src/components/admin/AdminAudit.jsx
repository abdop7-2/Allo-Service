import { S, Tag, Pager, usePaginated, fmtDateTime } from './ui';

const ACTION_LABEL = {
  user_suspend: 'Suspension', user_reactivate: 'Réactivation', user_role_change: 'Changement de rôle',
  user_delete: 'Suppression utilisateur', prestataire_verify: 'Vérification prestataire',
  demande_delete: 'Suppression demande', offre_delete: 'Suppression offre', avis_delete: 'Suppression avis',
  demande_statut: 'Statut de demande', report_reviewed: 'Signalement traité', report_dismissed: 'Signalement rejeté',
};

export default function AdminAudit() {
  const { data, page, setPage, lastPage, total } = usePaginated('/api/admin/audit-logs', {});

  return (
    <div>
      <div style={{ ...S.card, padding: 0, overflowX: 'auto' }}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Admin</th><th style={S.th}>Action</th><th style={S.th}>Cible</th><th style={S.th}>Détails</th><th style={S.th}>Date</th>
          </tr></thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id}>
                <td style={{ ...S.td, fontWeight: 600 }}>{l.admin?.name || '—'}</td>
                <td style={S.td}><Tag color="#7c3aed">{ACTION_LABEL[l.action] || l.action}</Tag></td>
                <td style={S.td}>{l.target_type ? `${l.target_type} #${l.target_id}` : '—'}</td>
                <td style={{ ...S.td, color: '#64748b' }}>{l.details || '—'}</td>
                <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDateTime(l.created_at)}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#94a3b8' }} colSpan={5}>Aucune action enregistrée</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={page} lastPage={lastPage} total={total} onPage={setPage} />
    </div>
  );
}
