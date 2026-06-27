import { useEffect, useState, useCallback } from 'react';
import api from '../../api';

export const ACCENT = '#7c3aed';

export const fmtMAD = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n || 0);
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');
export const initials = (name) => (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const BTN = {
  primary: { background: ACCENT, color: '#fff' },
  light:   { background: '#f1f5f9', color: '#334155' },
  danger:  { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  ghost:   { background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' },
};
export const btn = (variant = 'primary') => ({
  border: 'none', borderRadius: 9, padding: '7px 13px', fontSize: 12.5, fontWeight: 600,
  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font)', ...BTN[variant],
  ...(variant === 'primary'
    ? { backgroundImage: `linear-gradient(180deg, ${ACCENT}, ${BTN.primary.background})`, boxShadow: '0 6px 16px -6px rgba(124,58,237,0.55)' }
    : {}),
});

export const S = {
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, boxShadow: 'var(--sh-sm)' },
  h2: { fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: 0 },
  sub: { fontSize: 13, color: 'var(--muted)', marginTop: 2, marginBottom: 16 },
  input: { border: '1.5px solid var(--border)', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font)', background: 'var(--surface)', color: 'var(--text)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', color: 'var(--muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-2)', whiteSpace: 'nowrap', background: 'var(--surface-2)' },
  td: { padding: '11px 12px', borderBottom: '1px solid var(--border-2)', color: 'var(--text)', verticalAlign: 'middle' },
};

export const ROLE_COLOR = { client: '#2563eb', prestataire: '#0d9488', admin: '#7c3aed' };
export const STATUT_COLOR = { ouverte: '#22c55e', en_cours: '#f59e0b', terminee: '#6366f1', annulee: '#ef4444', en_attente: '#94a3b8', acceptee: '#22c55e', refusee: '#ef4444', negociation: '#f97316' };

export function Avatar({ user, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: ROLE_COLOR[user?.role] || ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size / 2.6, fontWeight: 600, overflow: 'hidden', flexShrink: 0 }}>
      {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(user?.name)}
    </div>
  );
}

export function Tag({ children, color = '#64748b' }) {
  return <span style={{ background: color + '18', color, border: `1px solid ${color}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>{children}</span>;
}

export function Stat({ label, value, color = ACCENT, icon }) {
  return (
    <div style={{ ...S.card, padding: 16, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>{icon && <span>{icon}</span>}{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 6 }}>{value}</div>
    </div>
  );
}

export function Bar({ data, color = ACCENT }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 96, fontSize: 12, color: '#64748b', textAlign: 'right', flexShrink: 0, textTransform: 'capitalize' }}>{d.label}</span>
          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 6, height: 18, overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: color, height: '100%', borderRadius: 6, minWidth: d.value ? 4 : 0 }} />
          </div>
          <span style={{ width: 34, fontSize: 12, fontWeight: 600, color: '#334155' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Pager({ page, lastPage, total, onPage }) {
  if (!lastPage || lastPage <= 1) return <div style={{ fontSize: 12, color: '#94a3b8', padding: '10px 2px' }}>{total} résultat{total > 1 ? 's' : ''}</div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 2px', fontSize: 13, color: '#64748b' }}>
      <button style={btn('light')} disabled={page <= 1} onClick={() => onPage(page - 1)}>← Préc.</button>
      <span>Page {page} / {lastPage} · {total} résultats</span>
      <button style={btn('light')} disabled={page >= lastPage} onClick={() => onPage(page + 1)}>Suiv. →</button>
    </div>
  );
}

// data fetch hook that transparently handles both paginated and plain-array responses
export function usePaginated(url, params = {}) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const body = (await api.get(url, { params: { ...params, page } })).data;
      if (Array.isArray(body)) { setData(body); setMeta({ last_page: 1, total: body.length }); }
      else { setData(body.data || []); setMeta({ last_page: body.last_page || 1, total: body.total || 0 }); }
    } catch { setData([]); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, page, key]);

  useEffect(() => { reload(); }, [reload]);

  return { data, page, setPage, lastPage: meta.last_page, total: meta.total, loading, reload };
}
