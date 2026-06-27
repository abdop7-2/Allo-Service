import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../api';
import ReportButton from './ReportButton';

/* ── helpers ──────────────────────────────────────────────── */
const ME = () => JSON.parse(localStorage.getItem('user') || '{}');
const fileBase = () => (api.defaults.baseURL || '').replace(/\/$/, '');
const attUrl = (att) => `${fileBase()}/api/files/${att.path}`;
const initials = (name) => (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
const timeShort = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dayLabel = (d) => {
  const dt = new Date(d), now = new Date();
  if (dt.toDateString() === now.toDateString()) return timeShort(d);
  if ((now - dt) / 86400000 < 7) return dt.toLocaleDateString('fr-FR', { weekday: 'short' });
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};
const isImage = (mime) => (mime || '').startsWith('image/');
const human = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(b / 1024)) + ' Ko');

const ROLE_LABEL = { client: 'Client', prestataire: 'Prestataire', admin: 'Admin' };

export default function Messages({ accent = '#0d9488', startWith = null }) {
  const me = ME();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const scrollRef = useRef(null);
  const fileInput = useRef(null);

  const loadConversations = useCallback(async () => {
    try { setConversations((await api.get('/api/conversations')).data || []); } catch {}
  }, []);

  const openConversation = useCallback(async (conv) => {
    setActiveId(conv.id);
    setActive(conv);
    try {
      setMessages((await api.get(`/api/conversations/${conv.id}/messages`)).data || []);
      setConversations((cs) => cs.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)));
    } catch {}
  }, []);

  const startWithUser = useCallback(async (u) => {
    try {
      const conv = (await api.post('/api/conversations', { recipient_id: u.id })).data;
      await loadConversations();
      openConversation(conv);
      setShowNew(false); setQuery(''); setResults([]);
    } catch {}
  }, [loadConversations, openConversation]);

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, 6000);
    return () => clearInterval(t);
  }, [loadConversations]);

  useEffect(() => {
    if (startWith && startWith.id) startWithUser(startWith);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startWith && startWith.id]);

  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(async () => {
      try { setMessages((await api.get(`/api/conversations/${activeId}/messages`)).data || []); } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, activeId]);

  useEffect(() => {
    if (!showNew) return;
    const t = setTimeout(async () => {
      try { setResults((await api.get('/api/users/search', { params: { q: query } })).data || []); } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [query, showNew]);

  const send = async (e) => {
    e?.preventDefault();
    if (!activeId || (!text.trim() && files.length === 0)) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append('body', text.trim());
      files.forEach((f) => fd.append('attachments[]', f));
      await api.post(`/api/conversations/${activeId}/messages`, fd);
      setText(''); setFiles([]);
      setMessages((await api.get(`/api/conversations/${activeId}/messages`)).data || []);
      loadConversations();
    } catch {} finally { setSending(false); }
  };

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []).slice(0, 5);
    setFiles((f) => [...f, ...picked].slice(0, 5));
    e.target.value = '';
  };

  /* ── styles ── */
  const S = {
    wrap: { display: 'flex', height: 'calc(100vh - 150px)', minHeight: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--sh-sm)' },
    list: { width: 320, borderRight: '1px solid var(--border-2)', display: 'flex', flexDirection: 'column', minWidth: 0 },
    listHead: { padding: '14px 16px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    newBtn: { background: accent, backgroundImage: `linear-gradient(180deg, ${accent}dd, ${accent})`, color: '#fff', border: 'none', borderRadius: 9, padding: '7px 13px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', boxShadow: `0 6px 14px -6px ${accent}99` },
    item: (on) => ({ display: 'flex', gap: 10, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-2)', background: on ? 'var(--surface-2)' : 'transparent', alignItems: 'center', transition: 'background .14s' }),
    avatar: (c) => ({ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, overflow: 'hidden' }),
    thread: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
    threadHead: { padding: '12px 18px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', gap: 10 },
    body: { flex: 1, overflowY: 'auto', padding: 18, background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 8 },
    composer: { borderTop: '1px solid var(--border-2)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
    bubble: (mine) => ({ maxWidth: '72%', alignSelf: mine ? 'flex-end' : 'flex-start', background: mine ? accent : 'var(--surface)', color: mine ? '#fff' : 'var(--text)', border: mine ? 'none' : '1px solid var(--border)', borderRadius: 14, padding: '9px 13px', fontSize: 13.5, lineHeight: 1.45, boxShadow: 'var(--sh-xs)', wordBreak: 'break-word' }),
    meta: (mine) => ({ fontSize: 10.5, color: mine ? 'rgba(255,255,255,0.75)' : 'var(--muted)', marginTop: 3, textAlign: 'right' }),
    input: { flex: 1, border: '1.5px solid var(--border)', borderRadius: 11, padding: '10px 13px', fontSize: 13.5, outline: 'none', resize: 'none', fontFamily: 'var(--font)', color: 'var(--text)' },
    empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 30 },
  };

  const avatarNode = (u, size) => (
    <div style={{ ...S.avatar(accent), width: size, height: size, fontSize: size / 2.6 }}>
      {u?.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(u?.name)}
    </div>
  );

  return (
    <div style={S.wrap}>
      {/* conversation list */}
      <div style={S.list}>
        <div style={S.listHead}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Messagerie</div>
          <button style={S.newBtn} onClick={() => setShowNew((v) => !v)}>＋ Nouveau</button>
        </div>

        {showNew && (
          <div style={{ padding: 10, borderBottom: '1px solid #eef2f7', background: '#fafbfd' }}>
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un utilisateur…"
              style={{ ...S.input, width: '100%' }} />
            <div style={{ maxHeight: 220, overflowY: 'auto', marginTop: 6 }}>
              {results.map((u) => (
                <div key={u.id} onClick={() => startWithUser(u)}
                  style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '8px 6px', cursor: 'pointer', borderRadius: 8 }}>
                  {avatarNode(u, 32)}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{ROLE_LABEL[u.role] || u.role}</div>
                  </div>
                </div>
              ))}
              {query && results.length === 0 && <div style={{ fontSize: 12, color: '#94a3b8', padding: 8 }}>Aucun utilisateur</div>}
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && <div style={{ padding: 24, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Aucune conversation</div>}
          {conversations.map((c) => (
            <div key={c.id} style={S.item(c.id === activeId)} onClick={() => openConversation(c)}>
              {avatarNode(c.other, 40)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.other?.name || 'Utilisateur'}</span>
                  {c.last_message_at && <span style={{ fontSize: 10.5, color: '#94a3b8', flexShrink: 0 }}>{dayLabel(c.last_message_at)}</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.last_message ? (c.last_message.has_attachment && !c.last_message.body ? '📎 Pièce jointe' : c.last_message.body) : 'Démarrez la conversation'}
                  </span>
                  {c.unread > 0 && <span style={{ background: accent, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '0 7px', minWidth: 18, textAlign: 'center', flexShrink: 0 }}>{c.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* thread */}
      <div style={S.thread}>
        {!activeId ? (
          <div style={S.empty}>Sélectionnez une conversation ou démarrez-en une nouvelle pour commencer à discuter.</div>
        ) : (
          <>
            <div style={S.threadHead}>
              {avatarNode(active?.other, 38)}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{active?.other?.name || 'Utilisateur'}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{ROLE_LABEL[active?.other?.role] || active?.other?.role}</div>
              </div>
              {active?.other?.id && <div style={{ marginLeft: 'auto' }}><ReportButton type="user" id={active.other.id} label="" /></div>}
            </div>

            <div style={S.body} ref={scrollRef}>
              {messages.map((m) => {
                const mine = m.sender_id === me.id;
                return (
                  <div key={m.id} style={S.bubble(mine)}>
                    {m.body && <div>{m.body}</div>}
                    {(m.attachments || []).map((a) => (
                      <div key={a.id} style={{ marginTop: m.body ? 6 : 0 }}>
                        {isImage(a.mime_type) ? (
                          <a href={attUrl(a)} target="_blank" rel="noreferrer">
                            <img src={attUrl(a)} alt={a.original_name} style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, display: 'block' }} />
                          </a>
                        ) : (
                          <a href={attUrl(a)} target="_blank" rel="noreferrer"
                            style={{ display: 'flex', gap: 8, alignItems: 'center', textDecoration: 'none', color: mine ? '#fff' : accent, fontSize: 13, padding: '6px 8px', background: mine ? 'rgba(255,255,255,0.15)' : '#f1f5f9', borderRadius: 8 }}>
                            📄 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{a.original_name}</span>
                            <span style={{ opacity: 0.7, fontSize: 11 }}>{human(a.size)}</span>
                          </a>
                        )}
                      </div>
                    ))}
                    <div style={S.meta(mine)}>{timeShort(m.created_at)}</div>
                  </div>
                );
              })}
            </div>

            <form style={S.composer} onSubmit={send}>
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {files.map((f, i) => (
                    <span key={i} style={{ fontSize: 12, background: '#eef2f7', borderRadius: 8, padding: '4px 8px', display: 'flex', gap: 6, alignItems: 'center' }}>
                      {f.name.length > 22 ? f.name.slice(0, 22) + '…' : f.name}
                      <span style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700 }} onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))}>×</span>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <button type="button" onClick={() => fileInput.current?.click()} title="Joindre un fichier"
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', fontSize: 17, flexShrink: 0 }}>📎</button>
                <input ref={fileInput} type="file" multiple hidden onChange={addFiles}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt" />
                <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }}
                  placeholder="Écrivez un message…" style={S.input} />
                <button type="submit" disabled={sending || (!text.trim() && files.length === 0)}
                  style={{ background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0 18px', height: 40, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', flexShrink: 0, opacity: sending ? 0.6 : 1 }}>
                  {sending ? '…' : 'Envoyer'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
