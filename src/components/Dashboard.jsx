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
    <span style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44`,
      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
      {s.text}
    </span>
  );
}

/* ─── styles ──────────────────────────────────────────────────── */
const S = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#f1f5f9' },
  sidebar: { width: 240, background: 'linear-gradient(180deg,#0d1e3a 0%,#08372a 100%)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
  logo: { fontSize: 20, fontWeight: 800, padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 24px', cursor: 'pointer', borderRadius: 0,
    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    borderLeft: active ? '3px solid #3b86f7' : '3px solid transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: active ? 600 : 400, transition: '0.2s' }),
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, color: '#0d1e3a' },
  card: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 },
  statCard: (color) => ({ background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    borderTop: `4px solid ${color}` }),
  statVal: { fontSize: 28, fontWeight: 800, color: '#0d1e3a', lineHeight: 1 },
  statLbl: { fontSize: 13, color: '#64748b', marginTop: 6 },
  btn: (variant='primary') => ({
    padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: variant === 'primary' ? '#2e5ee2' : variant === 'danger' ? '#ef4444' : variant === 'success' ? '#22c55e' : '#f1f5f9',
    color: variant === 'ghost' ? '#0d1e3a' : '#fff', transition: '0.15s',
  }),
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14,
    outline: 'none', background: '#f8fafc', marginBottom: 10, boxSizing: 'border-box' },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#64748b',
    borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '13px 14px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', verticalAlign: 'middle' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modalBox: { background: '#fff', borderRadius: 18, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' },
  alert: (type) => ({ padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500,
    background: type === 'error' ? '#fee2e2' : '#dcfce7', color: type === 'error' ? '#b91c1c' : '#15803d' }),
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

function ClientOverview({ demandes, offres }) {
  const total = demandes.length;
  const actives = demandes.filter(d => d.statut === 'ouverte' || d.statut === 'en_cours').length;
  const terminees = demandes.filter(d => d.statut === 'terminee').length;
  const pending = offres.filter(o => o.statut === 'en_attente').length;

  return (
    <>
      <div style={S.statGrid}>
        {[
          { label: 'Total demandes',    val: total,    color: '#2e5ee2' },
          { label: 'Demandes actives',  val: actives,  color: '#f59e0b' },
          { label: 'Missions terminées',val: terminees, color: '#22c55e' },
          { label: 'Offres en attente', val: pending,  color: '#6366f1' },
        ].map(s => (
          <div key={s.label} style={S.statCard(s.color)}>
            <div style={S.statVal}>{s.val}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <h3 style={{ marginBottom: 16, color: '#0d1e3a', fontSize: 16 }}>Dernières demandes</h3>
        {demandes.slice(0,5).map(d => (
          <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{d.city} · {fmtDate(d.date_souhaitee)}</div>
            </div>
            <Badge statut={d.statut} />
          </div>
        ))}
        {demandes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14 }}>Aucune demande pour l'instant.</p>}
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
        <h2 style={S.title}>Mes demandes</h2>
        <button style={S.btn()} onClick={() => setShowModal(true)}>+ Nouvelle demande</button>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Titre','Catégorie','Budget','Ville','Date souhaitée','Statut','Actions'].map(h =>
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
            <h3 style={{ marginBottom: 20, color: '#0d1e3a' }}>Nouvelle demande</h3>
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
      <h2 style={{ ...S.title, marginBottom: 20 }}>Offres reçues</h2>
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
      <h2 style={{ ...S.title, marginBottom: 20 }}>Laisser un avis</h2>
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
        {[
          { label: 'Offres soumises',  val: offres.length, color: '#2e5ee2' },
          { label: 'En attente',       val: pending,        color: '#f59e0b' },
          { label: 'Acceptées',        val: accepted,       color: '#22c55e' },
          { label: 'Note moyenne',     val: avgNote + ' ★', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={S.statCard(s.color)}>
            <div style={S.statVal}>{s.val}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={S.card}>
          <h3 style={{ marginBottom: 14, fontSize: 15, color: '#0d1e3a' }}>Disponibilité</h3>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%',
              background: profile?.availability ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontWeight: 600, color: profile?.availability ? '#22c55e' : '#ef4444' }}>
              {profile?.availability ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{ marginBottom: 14, fontSize: 15, color: '#0d1e3a' }}>Derniers avis</h3>
          {avis.slice(0,3).map(a => (
            <div key={a.id} style={{ borderBottom:'1px solid #f1f5f9', paddingBottom: 8, marginBottom: 8 }}>
              <StarRating value={a.note} />
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{a.commentaire}</p>
            </div>
          ))}
          {avis.length === 0 && <p style={{ color:'#94a3b8', fontSize: 14 }}>Aucun avis encore.</p>}
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
        <h2 style={S.title}>Parcourir les demandes</h2>
        <select style={{ ...S.input, width: 200, marginBottom: 0 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
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
            <h3 style={{ marginBottom: 4, color:'#0d1e3a' }}>Offre pour : {selected.title}</h3>
            <p style={{ fontSize: 13, color:'#64748b', marginBottom: 16 }}>Budget client : {fmt(selected.budget)}</p>
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

function MesOffres({ offres }) {
  return (
    <>
      <h2 style={{ ...S.title, marginBottom: 20 }}>Mes offres soumises</h2>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>{['Demande','Devis','Message','Statut'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {offres.map(o => (
              <tr key={o.id}>
                <td style={S.td}><span style={{ fontWeight:600 }}>{o.demande?.title || `Demande #${o.demande_id}`}</span></td>
                <td style={S.td}>{fmt(o.devis)}</td>
                <td style={{ ...S.td, maxWidth:260, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{o.message}</td>
                <td style={S.td}><Badge statut={o.statut} /></td>
              </tr>
            ))}
            {offres.length === 0 && <tr><td colSpan={4} style={{ ...S.td, textAlign:'center', color:'#94a3b8' }}>Aucune offre soumise.</td></tr>}
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
      <h2 style={{ ...S.title, marginBottom: 20 }}>Mon profil prestataire</h2>
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
      <h2 style={{ ...S.title, marginBottom: 20 }}>Mes évaluations</h2>
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

/* ════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═════════════════════════════════════════════════════════════════*/

const CLIENT_MENU = [
  { key:'overview',  icon:'⊞', label:'Tableau de bord' },
  { key:'demandes',  icon:'📋', label:'Mes demandes' },
  { key:'offres',    icon:'📩', label:'Offres reçues' },
  { key:'avis',      icon:'⭐', label:'Laisser un avis' },
];

const PRES_MENU = [
  { key:'overview',  icon:'⊞', label:'Tableau de bord' },
  { key:'browse',    icon:'🔍', label:'Parcourir les demandes' },
  { key:'mesoffres', icon:'📤', label:'Mes offres' },
  { key:'profil',    icon:'👤', label:'Mon profil' },
  { key:'evals',     icon:'⭐', label:'Mes évaluations' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = user();
  const [section, setSection] = useState('overview');

  // shared data
  const [demandes, setDemandes] = useState([]);
  const [offres,   setOffres]   = useState([]);
  const [avis,     setAvis]     = useState([]);
  const [profile,  setProfile]  = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    loadData();
  }, [loadData]);

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
    if (isClient) {
      if (section === 'overview') return <ClientOverview demandes={demandes} offres={offres} />;
      if (section === 'demandes') return <ClientDemandes demandes={demandes} categories={categories}
        onCreated={loadData} onDeleted={id => setDemandes(d => d.filter(x => x.id !== id))} />;
      if (section === 'offres')   return <ClientOffres demandes={demandes} onAccept={handleAcceptOffre} onRefuse={handleRefuseOffre} />;
      if (section === 'avis')     return <ClientAvis offres={demandes.flatMap(d => (d.offres||[]).map(o => ({...o, demande: d})))} />;
    } else {
      if (section === 'overview')  return <PresOverview offres={offres} avis={avis} profile={profile} />;
      if (section === 'browse')    return <BrowseDemandes categories={categories} />;
      if (section === 'mesoffres') return <MesOffres offres={offres} />;
      if (section === 'profil')    return <MonProfil profile={profile} categories={categories} onSaved={loadData} />;
      if (section === 'evals')     return <MesEvaluations avis={avis} />;
    }
  };

  return (
    <div style={S.layout}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logo}>Allo<b style={{ color:'#3b86f7', fontWeight:400 }}>Service</b></div>
        <div style={{ padding: '0 24px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser.name}</div>
          <div style={{ fontSize: 11, color:'rgba(255,255,255,0.5)', marginTop: 3, textTransform:'capitalize' }}>
            {isClient ? '👤 Client' : '🔧 Prestataire'}
          </div>
        </div>
        {menu.map(m => (
          <div key={m.key} style={S.navItem(section === m.key)} onClick={() => setSection(m.key)}>
            <span style={{ fontSize: 16 }}>{m.icon}</span>
            {m.label}
          </div>
        ))}
        <div style={{ marginTop:'auto', padding: '16px 24px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ ...S.navItem(false), padding: 0, color:'rgba(255,255,255,0.6)', cursor:'pointer' }} onClick={logout}>
            <span>🚪</span> Déconnexion
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>
        <div style={S.header}>
          <div style={S.title}>{menu.find(m => m.key === section)?.label}</div>
          <div style={{ fontSize: 13, color:'#64748b' }}>
            Bonjour, <strong>{currentUser.name}</strong>
          </div>
        </div>
        {renderSection()}
      </main>
    </div>
  );
}
