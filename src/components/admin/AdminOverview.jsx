import { useEffect, useState } from 'react';
import api from '../../api';
import { S, Stat, Bar, Avatar, Tag, fmtMAD, fmtDateTime } from './ui';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/api/admin/stats').then((r) => setStats(r.data)).catch(() => {}); }, []);

  if (!stats) return <div style={{ color: '#94a3b8' }}>Chargement…</div>;

  const t = stats.totals;
  const toBar = (obj) => Object.entries(obj || {}).map(([label, value]) => ({ label, value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        <Stat label="Utilisateurs" value={t.users} icon="◍" />
        <Stat label="Clients" value={t.clients} color="#2563eb" icon="◎" />
        <Stat label="Prestataires" value={t.prestataires} color="#0d9488" icon="◉" />
        <Stat label="Demandes" value={t.demandes} color="#f59e0b" icon="≡" />
        <Stat label="Offres" value={t.offres} color="#6366f1" icon="✉" />
        <Stat label="Avis" value={t.avis} color="#eab308" icon="★" />
        <Stat label="Revenu (accepté)" value={fmtMAD(stats.revenue)} color="#16a34a" icon="₪" />
        <Stat label="Messages" value={t.messages} color="#7c3aed" icon="☷" />
        <Stat label="Suspendus" value={t.suspended} color="#ef4444" icon="⊘" />
        <Stat label="Vérifiés" value={t.verified_prestataires} color="#0ea5e9" icon="✓" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div style={S.card}>
          <h3 style={{ ...S.h2, fontSize: 14, marginBottom: 12 }}>Demandes par statut</h3>
          <Bar data={toBar(stats.demandes_by_statut)} color="#f59e0b" />
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h2, fontSize: 14, marginBottom: 12 }}>Offres par statut</h3>
          <Bar data={toBar(stats.offres_by_statut)} color="#6366f1" />
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h2, fontSize: 14, marginBottom: 12 }}>Inscriptions (6 mois)</h3>
          <Bar data={(stats.users_monthly || []).map((m) => ({ label: m.month, value: m.count }))} />
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h2, fontSize: 14, marginBottom: 12 }}>Demandes (6 mois)</h3>
          <Bar data={(stats.demandes_monthly || []).map((m) => ({ label: m.month, value: m.count }))} color="#f59e0b" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <div style={S.card}>
          <h3 style={{ ...S.h2, fontSize: 14, marginBottom: 4 }}>Top prestataires</h3>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Acceptation globale : {stats.acceptance_rate}% · {stats.signups_7d} inscrits / 7j</div>
          {(stats.top_prestataires || []).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f4f6fa' }}>
              <Avatar user={{ name: p.name, avatar: p.avatar, role: 'prestataire' }} size={30} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
              {p.verified && <Tag color="#0ea5e9">✓ Vérifié</Tag>}
              <span style={{ fontSize: 13, fontWeight: 700, color: '#eab308' }}>★ {p.rating ? Number(p.rating).toFixed(1) : '—'}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={{ ...S.h2, fontSize: 14, marginBottom: 10 }}>Activité récente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(stats.recent_activity || []).map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: '#475569' }}>
                <span style={{ color: '#cbd5e1', flexShrink: 0, width: 92 }}>{fmtDateTime(a.date)}</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
