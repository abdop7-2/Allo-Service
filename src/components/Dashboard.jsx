import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/* ─── helpers ─────────────────────────────────────────────────── */
const user = () => JSON.parse(localStorage.getItem('user') || 'null');
const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR');

const STATUT_LABEL = {
  ouverte:    { text: 'Ouverte',    color: '#22c55e' },
  en_cours:   { text: 'En cours',   color: '#f59e0b' },
  terminee:   { text: 'Terminée',   color: '#6366f1' },
  annulee:    { text: 'Annulée',    color: '#ef4444' },
  en_attente: { text: 'En attente', color: '#94a3b8' },
  acceptee:   { text: 'Acceptée',   color: '#22c55e' },
  refusee:    { text: 'Refusée',    color: '#ef4444' },
};

function Badge({ statut }) {
  const s = STATUT_LABEL[statut] || { text: statut, color: '#94a3b8' };
  return (
    <span style={{
      background: s.color + '18', color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: 6, padding: '3px 9px',
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {s.text}
    </span>
  );
}

/* ─── styles ──────────────────────────────────────────────────── */
const S = {
  layout: {
    display: 'flex', minHeight: '100vh',
    fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
    background: '#f7f8fc',
  },
  sidebar: {
    width: 256, background: '#0f172a', color: '#fff',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.04)',
  },
  logoWrap: {
    padding: '28px 24px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logoText: {
    fontSize: 19, fontWeight: 800, letterSpacing: '-0.4px',
    color: '#fff',
  },
  logoAccent: { color: '#4f8ef7' },
  logoSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '0.04em' },
  userChip: {
    margin: '14px 16px 6px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10, padding: '10px 14px',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: (color) => ({
    width: 34, height: 34, borderRadius: 10,
    background: color, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 14, fontWeight: 700,
    color: '#fff', flexShrink: 0,
  }),
  navSection: { padding: '18px 12px 6px 16px', fontSize: 10, fontWeight: 700,
    color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', margin: '1px 8px',
    cursor: 'pointer', borderRadius: 8,
    background: active ? 'rgba(79,142,247,0.15)' : 'transparent',
    color: active ? '#4f8ef7' : 'rgba(255,255,255,0.6)',
    fontSize: 13.5, fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
    letterSpacing: '-0.1px',
  }),
  navIcon: { fontSize: 15, width: 20, textAlign: 'center', flexShrink: 0 },
  main: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  topbar: {
    padding: '18px 32px',
    background: '#fff',
    borderBottom: '1px solid #eef0f6',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 10,
  },
  pageTitle: { fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' },
  content: { padding: '28px 32px', flex: 1 },
  card: {
    background: '#fff', borderRadius: 12, padding: '20px 22px',
    border: '1px solid #eef0f6',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
  },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 24 },
  statCard: (color) => ({
    background: '#fff', borderRadius: 12, padding: '18px 20px',
    border: '1px solid #eef0f6',
    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    position: 'relative', overflow: 'hidden',
  }),
  statAccent: (color) => ({
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    background: color, borderRadius: '12px 12px 0 0',
  }),
  statVal: { fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px' },
  statLbl: { fontSize: 12, color: '#94a3b8', marginTop: 5, fontWeight: 500 },
  statIcon: (color) => ({
    width: 36, height: 36, borderRadius: 9, background: color + '15',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, marginBottom: 12,
  }),
  btn: (variant = 'primary') => ({
    padding: variant === 'sm' ? '6px 13px' : '9px 17px',
    borderRadius: 7, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: variant === 'sm' ? 12 : 13,
    letterSpacing: '-0.1px',
    background: variant === 'primary' ? '#2563eb'
      : variant === 'danger'  ? '#fee2e2'
      : variant === 'success' ? '#dcfce7'
      : variant === 'ghost'   ? '#f1f5f9'
      : '#f1f5f9',
    color: variant === 'primary' ? '#fff'
      : variant === 'danger'  ? '#dc2626'
      : variant === 'success' ? '#16a34a'
      : '#374151',
    transition: 'all 0.15s',
  }),
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    border: '1.5px solid #e2e8f0', fontSize: 13.5,
    outline: 'none', background: '#fff', marginBottom: 12,
    boxSizing: 'border-box', color: '#0f172a',
    transition: 'border-color 0.15s',
  },
  label: { fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: '0.02em' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 },
  th: {
    textAlign: 'left', padding: '11px 16px', fontSize: 11,
    fontWeight: 700, color: '#94a3b8',
    borderBottom: '1px solid #f1f5f9',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    background: '#fafbfd',
  },
  td: { padding: '13px 16px', borderBottom: '1px solid #f8fafc', color: '#1e293b', verticalAlign: 'middle' },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  modalBox: {
    background: '#fff', borderRadius: 16, padding: '28px 30px',
    width: '100%', maxWidth: 490, maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
  },
  alert: (type) => ({
    padding: '11px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13,
    fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
    background: type === 'error' ? '#fef2f2' : '#f0fdf4',
    color: type === 'error' ? '#dc2626' : '#16a34a',
    border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`,
  }),
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 18,
  },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' },
  emptyState: {
    textAlign: 'center', padding: '48px 24px', color: '#94a3b8', fontSize: 13.5,
  },
};

/* ════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
═════════════════════════════════════════════════════════════════*/

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange && onChange(n)}
          style={{ fontSize: 24, cursor: onChange ? 'pointer' : 'default',
            color: n <= value ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CLIENT SECTIONS
═════════════════════════════════════════════════════════════════*/

function StatCard({ label, val, color, icon }) {
  return (
    <div style={S.statCard(color)}>
      <div style={S.statAccent(color)} />
      <div style={S.statIcon(color)}>{icon}</div>
      <div style={S.statVal}>{val}</div>
      <div style={S.statLbl}>{label}</div>
    </div>
  );
}

function ClientOverview({ demandes, offres }) {
  const total    = demandes.length;
  const actives  = demandes.filter(d => ['ouverte','en_cours'].includes(d.statut)).length;
  const terminees = demandes.filter(d => d.statut === 'terminee').length;
  const pending  = offres.filter(o => o.statut === 'en_attente').length;

  return (
    <>
      <div style={S.statGrid}>
        <StatCard label="Total demandes"     val={total}     color="#2563eb" icon="📋" />
        <StatCard label="En cours"           val={actives}   color="#f59e0b" icon="⚡" />
        <StatCard label="Terminées"          val={terminees} color="#10b981" icon="✓" />
        <StatCard label="Offres reçues"      val={pending}   color="#8b5cf6" icon="📩" />
      </div>
      <div style={S.card}>
        <div style={{ ...S.sectionHeader, marginBottom: 14 }}>
          <span style={S.sectionTitle}>Activité récente</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{demandes.length} demande{demandes.length !== 1 ? 's' : ''}</span>
        </div>
        {demandes.length === 0 && <div style={S.emptyState}>Aucune demande pour l'instant.</div>}
        {demandes.slice(0,6).map((d, i) => (
          <div key={d.id} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding: '11px 0',
            borderBottom: i < Math.min(demandes.length,6)-1 ? '1px solid #f8fafc' : 'none',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%',
                background: STATUT_LABEL[d.statut]?.color || '#94a3b8', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{d.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {d.city && `${d.city} · `}{fmtDate(d.date_souhaitee)}
                </div>
              </div>
            </div>
            <Badge statut={d.statut} />
          </div>
        ))}
      </div>
    </>
  );
}

function ClientDemandes({ demandes, categories, onCreated, onDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title:'', description:'', category_id:'', budget:'', city:'', date_souhaitee:'' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/api/demandes', form);
      setShowModal(false);
      setForm({ title:'', description:'', category_id:'', budget:'', city:'', date_souhaitee:'' });
      onCreated();
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la création.');
    } finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try { await api.delete(`/api/demandes/${id}`); onDeleted(id); }
    catch { alert('Impossible de supprimer.'); }
  };

  return (
    <>
      <div style={S.sectionHeader}>
        <span style={S.sectionTitle}>Mes demandes <span style={{ color:'#94a3b8', fontWeight:400 }}>({demandes.length})</span></span>
        <button style={S.btn()} onClick={() => setShowModal(true)}>+ Nouvelle demande</button>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Titre','Catégorie','Budget','Ville','Date souhaitée','Statut',''].map(h =>
                <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {demandes.map(d => (
              <tr key={d.id}>
                <td style={S.td}><span style={{ fontWeight: 600 }}>{d.title}</span></td>
                <td style={S.td}>{d.category?.nom || '—'}</td>
                <td style={S.td}>{fmt(d.budget)}</td>
                <td style={S.td}>{d.city}</td>
                <td style={S.td}>{fmtDate(d.date_souhaitee)}</td>
                <td style={S.td}><Badge statut={d.statut} /></td>
                <td style={S.td}>
                  {d.statut === 'ouverte' &&
                    <button style={{ ...S.btn('danger'), padding: '5px 12px', fontSize: 12 }} onClick={() => del(d.id)}>
                      Supprimer
                    </button>}
                </td>
              </tr>
            ))}
            {demandes.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#94a3b8' }}>Aucune demande.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modalBox}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nouvelle demande</h3>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', fontSize:20,
                color:'#94a3b8', cursor:'pointer', lineHeight:1 }}>×</button>
            </div>
            {error && <div style={S.alert('error')}>{error}</div>}
            <label style={S.label}>Titre *</label>
            <input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Fuite d'eau cuisine" />
            <label style={S.label}>Description *</label>
            <textarea style={{ ...S.input, minHeight: 80, resize:'vertical' }} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Décrivez votre problème..." />
            <label style={S.label}>Catégorie *</label>
            <select style={S.input} value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">-- Choisir --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <label style={S.label}>Budget (DA) *</label>
            <input style={S.input} type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="Ex: 5000" />
            <label style={S.label}>Ville</label>
            <input style={S.input} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ex: Alger" />
            <label style={S.label}>Date souhaitée *</label>
            <input style={S.input} type="date" value={form.date_souhaitee} onChange={e => set('date_souhaitee', e.target.value)} />
            <div style={{ display:'flex', gap: 10, marginTop: 8 }}>
              <button style={S.btn()} onClick={submit} disabled={loading}>{loading ? 'Envoi...' : 'Publier'}</button>
              <button style={S.btn('ghost')} onClick={() => setShowModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ClientOffres({ demandes, onAccept, onRefuse }) {
  const allOffres = demandes.flatMap(d => (d.offres || []).map(o => ({ ...o, demande: d })));

  return (
    <>
      <div style={{ ...S.sectionHeader, marginBottom: 18 }}>
        <span style={S.sectionTitle}>Offres reçues</span>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>{['Demande','Prestataire','Devis','Message','Statut','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {allOffres.map(o => (
              <tr key={o.id}>
                <td style={S.td}><span style={{ fontWeight: 600 }}>{o.demande.title}</span></td>
                <td style={S.td}>{o.prestataire?.name || '—'}</td>
                <td style={S.td}>{fmt(o.devis)}</td>
                <td style={{ ...S.td, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.message}</td>
                <td style={S.td}><Badge statut={o.statut} /></td>
                <td style={S.td}>
                  {o.statut === 'en_attente' && (
                    <div style={{ display:'flex', gap: 6 }}>
                      <button style={{ ...S.btn('success'), padding: '5px 12px', fontSize: 12 }} onClick={() => onAccept(o.id)}>Accepter</button>
                      <button style={{ ...S.btn('danger'),  padding: '5px 12px', fontSize: 12 }} onClick={() => onRefuse(o.id)}>Refuser</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {allOffres.length === 0 && <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', color:'#94a3b8' }}>Aucune offre reçue.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ClientAvis({ offres }) {
  const [form, setForm] = useState({ offre_id: '', note: 5, commentaire: '' });
  const [done, setDone] = useState([]);
  const [error, setError] = useState('');
  const eligible = offres.filter(o => o.statut === 'acceptee' && !done.includes(o.id));

  const submit = async () => {
    setError('');
    try {
      await api.post('/api/avis', form);
      setDone(d => [...d, Number(form.offre_id)]);
      setForm({ offre_id: '', note: 5, commentaire: '' });
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur.');
    }
  };

  return (
    <>
      <div style={{ ...S.sectionHeader, marginBottom: 18 }}>
        <span style={S.sectionTitle}>Laisser un avis</span>
      </div>
      <div style={S.card}>
        {error && <div style={S.alert('error')}>{error}</div>}
        {eligible.length === 0
          ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucune mission terminée à évaluer pour l'instant.</p>
          : <>
              <label style={S.label}>Mission *</label>
              <select style={S.input} value={form.offre_id} onChange={e => setForm(f => ({ ...f, offre_id: e.target.value }))}>
                <option value="">-- Choisir une mission --</option>
                {eligible.map(o => <option key={o.id} value={o.id}>{o.demande?.title || `Offre #${o.id}`}</option>)}
              </select>
              <label style={S.label}>Note</label>
              <StarRating value={form.note} onChange={n => setForm(f => ({ ...f, note: n }))} />
              <label style={S.label}>Commentaire</label>
              <textarea style={{ ...S.input, minHeight: 80, resize:'vertical' }} value={form.commentaire}
                onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} placeholder="Votre avis..." />
              <button style={S.btn()} onClick={submit}>Soumettre l'avis</button>
            </>
        }
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   PRESTATAIRE SECTIONS
═════════════════════════════════════════════════════════════════*/

function PresOverview({ offres, avis, profile }) {
  const pending  = offres.filter(o => o.statut === 'en_attente').length;
  const accepted = offres.filter(o => o.statut === 'acceptee').length;
  const avgNote  = avis.length ? (avis.reduce((s,a) => s + a.note, 0) / avis.length).toFixed(1) : '—';

  return (
    <>
      <div style={S.statGrid}>
        <StatCard label="Offres soumises" val={offres.length} color="#2563eb" icon="📤" />
        <StatCard label="En attente"      val={pending}       color="#f59e0b" icon="⏳" />
        <StatCard label="Acceptées"       val={accepted}      color="#10b981" icon="✓" />
        <StatCard label="Note moyenne"    val={avgNote === '—' ? '—' : avgNote + ' ★'} color="#f59e0b" icon="★" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={S.card}>
          <div style={S.sectionTitle}>Disponibilité</div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: profile?.availability ? '#10b981' : '#ef4444',
              boxShadow: `0 0 0 3px ${profile?.availability ? '#d1fae5' : '#fee2e2'}` }} />
            <span style={{ fontWeight: 600, fontSize: 14,
              color: profile?.availability ? '#10b981' : '#ef4444' }}>
              {profile?.availability ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
          {profile?.bio && (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 12, lineHeight: 1.5 }}>
              {profile.bio.slice(0, 120)}{profile.bio.length > 120 ? '...' : ''}
            </p>
          )}
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle}>Derniers avis</div>
          {avis.length === 0 && <div style={{ ...S.emptyState, padding: '20px 0' }}>Aucun avis encore.</div>}
          {avis.slice(0,3).map((a, i) => (
            <div key={a.id} style={{
              paddingBottom: 10, marginTop: 12,
              borderBottom: i < Math.min(avis.length,3)-1 ? '1px solid #f8fafc' : 'none',
            }}>
              <StarRating value={a.note} />
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0', lineHeight: 1.45 }}>
                {a.commentaire || <em>Sans commentaire</em>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function BrowseDemandes({ categories }) {
  const [demandes, setDemandes] = useState([]);
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [offreForm, setOffreForm] = useState({ devis: '', message: '' });
  const [sent, setSent] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/demandes');
      setDemandes((res.data.data || res.data).filter(d => d.statut === 'ouverte'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = catFilter ? demandes.filter(d => d.category_id === Number(catFilter)) : demandes;

  const submitOffre = async () => {
    setError('');
    try {
      await api.post('/api/offres', { demande_id: selected.id, ...offreForm });
      setSent(s => [...s, selected.id]);
      setSelected(null);
      setOffreForm({ devis: '', message: '' });
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de l\'envoi.');
    }
  };

  return (
    <>
      <div style={S.sectionHeader}>
        <span style={S.sectionTitle}>Parcourir les demandes <span style={{ color:'#94a3b8', fontWeight:400 }}>({filtered.length})</span></span>
        <select style={{ ...S.input, width: 190, marginBottom: 0 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>
      {loading && <p style={{ color:'#64748b' }}>Chargement...</p>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {filtered.map(d => (
          <div key={d.id} style={{ ...S.card, display:'flex', flexDirection:'column', gap: 8 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{d.title}</span>
              <Badge statut={d.statut} />
            </div>
            <span style={{ fontSize: 12, color:'#64748b' }}>{d.category?.nom} · {d.city}</span>
            <p style={{ fontSize: 13, color:'#475569', lineHeight: 1.5, margin: 0,
              display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{d.description}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight: 700, color:'#2e5ee2' }}>{fmt(d.budget)}</span>
              <span style={{ fontSize: 12, color:'#94a3b8' }}>{fmtDate(d.date_souhaitee)}</span>
            </div>
            <button
              style={{ ...S.btn(sent.includes(d.id) ? 'ghost' : 'primary'), marginTop: 4 }}
              disabled={sent.includes(d.id)}
              onClick={() => { setSelected(d); setError(''); }}
            >
              {sent.includes(d.id) ? 'Offre envoyée ✓' : 'Soumettre une offre'}
            </button>
          </div>
        ))}
        {!loading && filtered.length === 0 && <p style={{ color:'#94a3b8', fontSize: 14 }}>Aucune demande disponible.</p>}
      </div>

      {selected && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={S.modalBox}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color:'#0f172a', margin:'0 0 4px' }}>Soumettre une offre</h3>
                <p style={{ fontSize: 13, color:'#64748b', margin: 0 }}>{selected.title} · Budget : {fmt(selected.budget)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:20,
                color:'#94a3b8', cursor:'pointer', lineHeight:1, marginLeft:12 }}>×</button>
            </div>
            {error && <div style={S.alert('error')}>{error}</div>}
            <label style={S.label}>Votre devis (DA) *</label>
            <input style={S.input} type="number" value={offreForm.devis} onChange={e => setOffreForm(f => ({...f, devis:e.target.value}))} placeholder="Ex: 4500" />
            <label style={S.label}>Message *</label>
            <textarea style={{ ...S.input, minHeight: 90, resize:'vertical' }} value={offreForm.message}
              onChange={e => setOffreForm(f => ({...f, message:e.target.value}))} placeholder="Présentez votre offre..." />
            <div style={{ display:'flex', gap: 10, marginTop: 8 }}>
              <button style={S.btn()} onClick={submitOffre}>Envoyer l'offre</button>
              <button style={S.btn('ghost')} onClick={() => setSelected(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MesOffres({ offres, onDeleted }) {
  const del = async (id) => {
    if (!window.confirm('Retirer cette offre ?')) return;
    try {
      await api.delete(`/api/offres/${id}`);
      onDeleted && onDeleted(id);
    } catch (e) {
      alert(e.response?.data?.message || 'Impossible de retirer l\'offre.');
    }
  };

  return (
    <>
      <div style={{ ...S.sectionHeader, marginBottom: 18 }}>
        <span style={S.sectionTitle}>Mes offres <span style={{ color:'#94a3b8', fontWeight:400 }}>({offres.length})</span></span>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>{['Demande','Devis','Message','Statut','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {offres.map(o => (
              <tr key={o.id}>
                <td style={S.td}><span style={{ fontWeight:600 }}>{o.demande?.title || `Demande #${o.demande_id}`}</span></td>
                <td style={S.td}>{fmt(o.devis)}</td>
                <td style={{ ...S.td, maxWidth:220, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{o.message}</td>
                <td style={S.td}><Badge statut={o.statut} /></td>
                <td style={S.td}>
                  {o.statut === 'en_attente' && (
                    <button style={{ ...S.btn('danger'), padding:'5px 12px', fontSize:12 }} onClick={() => del(o.id)}>
                      Retirer
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {offres.length === 0 && <tr><td colSpan={5} style={{ ...S.td, textAlign:'center', color:'#94a3b8' }}>Aucune offre soumise.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MonProfil({ profile, categories, onSaved }) {
  const [form, setForm] = useState({ category_id: profile?.category_id || '', bio: profile?.bio || '', availability: profile?.availability ?? true });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const save = async () => {
    setError(''); setSaved(false);
    try {
      await api.post('/api/prestataires/profile', form);
      setSaved(true); onSaved && onSaved();
    } catch (e) { setError(e.response?.data?.message || 'Erreur.'); }
  };

  return (
    <>
      <div style={{ ...S.sectionHeader, marginBottom: 18 }}>
        <span style={S.sectionTitle}>Mon profil prestataire</span>
      </div>
      <div style={{ ...S.card, maxWidth: 520 }}>
        {error  && <div style={S.alert('error')}>{error}</div>}
        {saved  && <div style={S.alert('success')}>Profil mis à jour avec succès.</div>}
        <label style={S.label}>Catégorie de service *</label>
        <select style={S.input} value={form.category_id} onChange={e => set('category_id', e.target.value)}>
          <option value="">-- Choisir --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <label style={S.label}>Bio</label>
        <textarea style={{ ...S.input, minHeight: 100, resize:'vertical' }} value={form.bio}
          onChange={e => set('bio', e.target.value)} placeholder="Décrivez vos compétences et expériences..." />
        <label style={S.label}>Disponibilité</label>
        <div style={{ display:'flex', gap: 12, marginBottom: 16 }}>
          {[true, false].map(v => (
            <label key={String(v)} style={{ display:'flex', alignItems:'center', gap: 6, cursor:'pointer', fontSize: 14 }}>
              <input type="radio" checked={form.availability === v} onChange={() => set('availability', v)} />
              {v ? 'Disponible' : 'Indisponible'}
            </label>
          ))}
        </div>
        <button style={S.btn()} onClick={save}>Enregistrer</button>
      </div>
    </>
  );
}

function MesEvaluations({ avis }) {
  const avg = avis.length ? (avis.reduce((s,a) => s + a.note, 0) / avis.length).toFixed(1) : null;
  return (
    <>
      <div style={{ ...S.sectionHeader, marginBottom: 18 }}>
        <span style={S.sectionTitle}>Mes évaluations</span>
      </div>
      {avg && (
        <div style={{ ...S.card, marginBottom: 16, display:'inline-flex', gap: 12, alignItems:'center' }}>
          <span style={{ fontSize: 36, fontWeight: 800, color:'#f59e0b' }}>{avg}</span>
          <div>
            <StarRating value={Math.round(avg)} />
            <span style={{ fontSize: 13, color:'#64748b' }}>{avis.length} avis</span>
          </div>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
        {avis.map(a => (
          <div key={a.id} style={S.card}>
            <StarRating value={a.note} />
            <p style={{ margin: '6px 0 4px', fontSize: 14, color:'#1e293b' }}>{a.commentaire || <em style={{color:'#94a3b8'}}>Pas de commentaire</em>}</p>
            <span style={{ fontSize: 12, color:'#94a3b8' }}>{fmtDate(a.created_at)}</span>
          </div>
        ))}
        {avis.length === 0 && <p style={{ color:'#94a3b8', fontSize: 14 }}>Aucune évaluation pour l'instant.</p>}
      </div>
    </>
  );
}

function MonCompte() {
  const [profileForm, setProfileForm] = useState(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return { name: u.name || '', phone: u.phone || '' };
  });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  const saveProfile = async () => {
    setProfileMsg(null);
    try {
      const res = await api.put('/api/user/profile', profileForm);
      const updated = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...res.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setProfileMsg({ type: 'success', text: 'Profil mis à jour.' });
    } catch (e) {
      setProfileMsg({ type: 'error', text: e.response?.data?.message || 'Erreur.' });
    }
  };

  const savePassword = async () => {
    setPwMsg(null);
    try {
      await api.put('/api/user/password', pwForm);
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setPwMsg({ type: 'success', text: 'Mot de passe mis à jour.' });
    } catch (e) {
      const errors = e.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat().join(' ') : (e.response?.data?.message || 'Erreur.');
      setPwMsg({ type: 'error', text: msg });
    }
  };

  return (
    <>
      <h2 style={{ ...S.title, marginBottom: 24 }}>Mon compte</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:800 }}>
        <div style={S.card}>
          <h3 style={{ marginBottom:16, fontSize:15, color:'#0d1e3a' }}>Informations personnelles</h3>
          {profileMsg && <div style={S.alert(profileMsg.type)}>{profileMsg.text}</div>}
          <label style={S.label}>Nom complet</label>
          <input style={S.input} value={profileForm.name}
            onChange={e => setProfileForm(f => ({...f, name:e.target.value}))} placeholder="Votre nom" />
          <label style={S.label}>Téléphone</label>
          <input style={S.input} value={profileForm.phone}
            onChange={e => setProfileForm(f => ({...f, phone:e.target.value}))} placeholder="+213..." />
          <button style={S.btn()} onClick={saveProfile}>Enregistrer</button>
        </div>

        <div style={S.card}>
          <h3 style={{ marginBottom:16, fontSize:15, color:'#0d1e3a' }}>Changer le mot de passe</h3>
          {pwMsg && <div style={S.alert(pwMsg.type)}>{pwMsg.text}</div>}
          <label style={S.label}>Mot de passe actuel</label>
          <input style={S.input} type="password" value={pwForm.current_password}
            onChange={e => setPwForm(f => ({...f, current_password:e.target.value}))} placeholder="••••••••" />
          <label style={S.label}>Nouveau mot de passe</label>
          <input style={S.input} type="password" value={pwForm.new_password}
            onChange={e => setPwForm(f => ({...f, new_password:e.target.value}))} placeholder="Min. 8 caractères" />
          <label style={S.label}>Confirmer le nouveau mot de passe</label>
          <input style={S.input} type="password" value={pwForm.new_password_confirmation}
            onChange={e => setPwForm(f => ({...f, new_password_confirmation:e.target.value}))} placeholder="••••••••" />
          <button style={S.btn()} onClick={savePassword}>Mettre à jour</button>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
═════════════════════════════════════════════════════════════════*/

function NotificationsPanel({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications')
      .then(r => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const TYPE_ICON = {
    new_offre:    '📩',
    offre_acceptee: '✅',
    offre_refusee:  '❌',
    new_demande:  '📋',
  };

  return (
    <div style={{ position:'absolute', top:56, right:0, width:360, background:'#fff', borderRadius:14,
      boxShadow:'0 8px 30px rgba(0,0,0,0.15)', zIndex:200, overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontWeight:700, fontSize:14, color:'#0d1e3a' }}>Notifications</span>
        <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#94a3b8' }} onClick={onClose}>×</button>
      </div>
      <div style={{ maxHeight:380, overflowY:'auto' }}>
        {loading && <p style={{ padding:20, color:'#94a3b8', fontSize:13 }}>Chargement...</p>}
        {!loading && items.length === 0 && <p style={{ padding:20, color:'#94a3b8', fontSize:13 }}>Aucune notification.</p>}
        {items.map((n, i) => (
          <div key={i} style={{ padding:'14px 20px', borderBottom:'1px solid #f8fafc', display:'flex', gap:12, alignItems:'flex-start' }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{TYPE_ICON[n.type] || '🔔'}</span>
            <div>
              <p style={{ margin:0, fontSize:13, color:'#1e293b', lineHeight:1.4 }}>{n.message}</p>
              <span style={{ fontSize:11, color:'#94a3b8' }}>{new Date(n.date).toLocaleString('fr-FR')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═════════════════════════════════════════════════════════════════*/

const CLIENT_MENU = [
  { key:'overview',  icon:'▦',  label:'Tableau de bord' },
  { key:'demandes',  icon:'≡',  label:'Mes demandes' },
  { key:'offres',    icon:'✉',  label:'Offres reçues' },
  { key:'avis',      icon:'★',  label:'Laisser un avis' },
  { key:'compte',    icon:'◎',  label:'Mon compte' },
];

const PRES_MENU = [
  { key:'overview',  icon:'▦',  label:'Tableau de bord' },
  { key:'browse',    icon:'⊕',  label:'Parcourir les demandes' },
  { key:'mesoffres', icon:'↑',  label:'Mes offres' },
  { key:'profil',    icon:'◉',  label:'Mon profil' },
  { key:'evals',     icon:'★',  label:'Mes évaluations' },
  { key:'compte',    icon:'◎',  label:'Mon compte' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => user()); // stable reference — read once on mount
  const [section, setSection] = useState('overview');
  const [showNotif, setShowNotif] = useState(false);

  // shared data
  const [demandes, setDemandes] = useState([]);
  const [offres,   setOffres]   = useState([]);
  const [avis,     setAvis]     = useState([]);
  const [profile,  setProfile]  = useState(null);
  const [categories, setCategories] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [catRes] = await Promise.all([
        api.get('/api/categories').catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data?.data || catRes.data || []);

      if (currentUser?.role === 'client') {
        const demandesRes = await api.get('/api/demandes');
        const raw = demandesRes.data?.data || demandesRes.data || [];
        // for each demande fetch its offres
        const withOffres = await Promise.all(raw.map(async d => {
          try {
            const oRes = await api.get(`/api/demandes/${d.id}/offres`);
            return { ...d, offres: oRes.data?.data || oRes.data || [] };
          } catch { return { ...d, offres: [] }; }
        }));
        setDemandes(withOffres);
        setOffres(withOffres.flatMap(d => d.offres));
      }

      if (currentUser?.role === 'prestataire') {
        const [presRes, avisRes, offresRes] = await Promise.all([
          api.get(`/api/prestataires/${currentUser.id}`).catch(() => ({ data: null })),
          api.get(`/api/prestataires/${currentUser.id}/avis`).catch(() => ({ data: [] })),
          api.get('/api/offres/mes-offres').catch(() => ({ data: [] })),
        ]);
        setProfile(presRes.data);
        setAvis(avisRes.data?.data || avisRes.data || []);
        setOffres(offresRes.data?.data || offresRes.data || []);
      }
    } catch (e) {
      if (e.response?.status === 401) { localStorage.clear(); navigate('/login'); }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    loadData();
  }, [loadData]);

  const logout = () => {
    api.post('/api/logout').finally(() => { localStorage.clear(); navigate('/login'); });
  };

  const handleAcceptOffre = async (id) => {
    await api.put(`/api/offres/${id}/statut`, { statut: 'acceptee' });
    loadData();
  };
  const handleRefuseOffre = async (id) => {
    await api.put(`/api/offres/${id}/statut`, { statut: 'refusee' });
    loadData();
  };

  if (!currentUser) return null;

  const isClient = currentUser.role === 'client';
  const menu = isClient ? CLIENT_MENU : PRES_MENU;

  const renderSection = () => {
    if (section === 'compte') return <MonCompte />;
    if (isClient) {
      if (section === 'overview') return <ClientOverview demandes={demandes} offres={offres} />;
      if (section === 'demandes') return <ClientDemandes demandes={demandes} categories={categories}
        onCreated={loadData} onDeleted={id => setDemandes(d => d.filter(x => x.id !== id))} />;
      if (section === 'offres')   return <ClientOffres demandes={demandes} onAccept={handleAcceptOffre} onRefuse={handleRefuseOffre} />;
      if (section === 'avis')     return <ClientAvis offres={demandes.flatMap(d => (d.offres||[]).map(o => ({...o, demande: d})))} />;
    } else {
      if (section === 'overview')  return <PresOverview offres={offres} avis={avis} profile={profile} />;
      if (section === 'browse')    return <BrowseDemandes categories={categories} />;
      if (section === 'mesoffres') return <MesOffres offres={offres} onDeleted={id => { setOffres(o => o.filter(x => x.id !== id)); }} />;
      if (section === 'profil')    return <MonProfil profile={profile} categories={categories} onSaved={loadData} />;
      if (section === 'evals')     return <MesEvaluations avis={avis} />;
    }
  };

  const initials = currentUser.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
  const avatarColor = isClient ? '#2563eb' : '#0d9488';
  const currentLabel = menu.find(m => m.key === section)?.label || 'Mon compte';

  return (
    <div style={S.layout}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.logoWrap}>
          <div style={S.logoText}>
            Allo<span style={S.logoAccent}>Service</span>
          </div>
          <div style={S.logoSub}>{isClient ? 'Espace client' : 'Espace prestataire'}</div>
        </div>

        <div style={S.userChip}>
          <div style={S.avatar(avatarColor)}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {isClient ? 'Client' : 'Prestataire'}
            </div>
          </div>
        </div>

        <div style={S.navSection}>Navigation</div>
        {menu.map(m => (
          <div key={m.key} style={S.navItem(section === m.key)} onClick={() => setSection(m.key)}>
            <span style={S.navIcon}>{m.icon}</span>
            {m.label}
          </div>
        ))}

        <div style={{ marginTop:'auto', borderTop:'1px solid rgba(255,255,255,0.06)', padding: '12px 8px' }}>
          <div style={{ ...S.navItem(false), color:'rgba(255,255,255,0.45)' }} onClick={logout}>
            <span style={S.navIcon}>←</span> Déconnexion
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div>
            <div style={S.pageTitle}>{currentLabel}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, position:'relative' }}>
            <button onClick={() => setShowNotif(v => !v)} style={{
              background: showNotif ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${showNotif ? '#bfdbfe' : '#e2e8f0'}`,
              borderRadius: 8, width: 36, height: 36, cursor:'pointer',
              fontSize: 15, display:'flex', alignItems:'center', justifyContent:'center',
              transition: 'all 0.15s',
            }}>🔔</button>
            {showNotif && <NotificationsPanel onClose={() => setShowNotif(false)} />}
            <div style={{
              height: 36, display:'flex', alignItems:'center', gap: 8,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '0 12px', fontSize: 13, color: '#374151',
            }}>
              <div style={{ ...S.avatar(avatarColor), width: 22, height: 22, fontSize: 10, borderRadius: 6 }}>{initials}</div>
              <span style={{ fontWeight: 500 }}>{currentUser.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={S.content}>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
