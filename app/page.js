'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '📊 Audit complet', prompt: 'Lance un audit complet de mes campagnes Google Shopping : analyse les métriques, identifie les problèmes Merchant Center, et donne-moi un plan d\'action prioritaire.' },
  { label: '🔝 Top produits', prompt: 'Quels sont mes meilleurs produits en termes de ROAS sur les 30 derniers jours ? Dois-je augmenter leurs enchères ?' },
  { label: '💸 Produits perdants', prompt: 'Identifie les produits qui coûtent de l\'argent sans convertir et propose des actions concrètes.' },
  { label: '⚠️ Erreurs Merchant', prompt: 'Audite mon Merchant Center et liste toutes les erreurs avec les corrections à faire dans WooCommerce.' },
  { label: '📈 Créer campagne', prompt: 'Analyse mes campagnes existantes et propose la création d\'une nouvelle campagne pour couvrir les opportunités manquées.' },
  { label: '📋 Rapport hebdo', prompt: 'Génère un rapport de performance des 30 derniers jours avec les KPIs clés et les recommandations pour la semaine prochaine.' },
]

// ─── Utility ─────────────────────────────────────────────────────────────────
const fmt = (n, dec = 0) => Number(n || 0).toFixed(dec)
const fmtEur = (n) => `${fmt(n, 0)}€`
const fmtPct = (n) => `${fmt(n, 1)}%`

// ─── Sub-components ──────────────────────────────────────────────────────────
function Kpi({ label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--t1)', letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Badge({ label, color = '#7c3aed', bg = '#ede9fe' }) {
  return <span style={{ background: bg, color, fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
}

function ToolPill({ name }) {
  const colors = {
    get_campaign_metrics: ['#dbeafe', '#1d4ed8'],
    get_product_performance: ['#dcfce7', '#15803d'],
    audit_merchant_center: ['#fff7ed', '#c2410c'],
    adjust_bid: ['#fef9c3', '#854d0e'],
    pause_products: ['#fee2e2', '#991b1b'],
    create_campaign: ['#f0fdf4', '#166534'],
    optimize_product_titles: ['#fdf4ff', '#7e22ce'],
    generate_report: ['#f0f9ff', '#0369a1'],
  }
  const [bg, col] = colors[name] || ['#f3f4f6', '#374151']
  return <span style={{ background: bg, color: col, fontSize: 11, padding: '2px 8px', borderRadius: 12, display: 'inline-block', margin: '2px 3px', fontFamily: 'monospace' }}>⚙ {name}</span>
}

function Spinner() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#7c3aed',
          animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s`, display: 'inline-block'
        }} />
      ))}
    </span>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 14, gap: 8, alignItems: 'flex-start' }}>
      {!isUser && (
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>M</div>
      )}
      <div style={{ maxWidth: '78%' }}>
        {msg.tools?.length > 0 && (
          <div style={{ marginBottom: 6 }}>{msg.tools.map((t, i) => <ToolPill key={i} name={t} />)}</div>
        )}
        <div style={{
          background: isUser ? '#7c3aed' : 'white',
          color: isUser ? 'white' : '#1a1a2e',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '10px 14px', fontSize: 13.5, lineHeight: 1.65,
          border: isUser ? 'none' : '1px solid #f0eeff',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          boxShadow: isUser ? '0 2px 12px rgba(124,58,237,.2)' : '0 1px 3px rgba(0,0,0,.06)'
        }}>
          {msg.loading ? <Spinner /> : msg.content}
        </div>
      </div>
    </div>
  )
}

function CampaignRow({ c }) {
  const roasColor = c.roas >= 10 ? '#15803d' : c.roas >= 4 ? '#92400e' : c.status === 'PAUSED' ? '#9ca3af' : '#dc2626'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f3ff' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>
          {(c.impressions || 0).toLocaleString()} imp · {(c.clicks || 0).toLocaleString()} clics · CTR {fmtPct(c.ctr)} · CPC moy. {fmtEur(c.avg_cpc_eur)}
        </div>
        <div style={{ marginTop: 5, height: 4, background: '#f0eeff', borderRadius: 2, width: 180, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min((c.roas / 25) * 100, 100)}%`, background: roasColor, borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', marginLeft: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: roasColor }}>
          {c.status === 'PAUSED' ? '⏸ Pausée' : `×${fmt(c.roas, 1)}`}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtEur(c.cost_eur)} · {fmtEur(c.conversion_value)}</div>
      </div>
    </div>
  )
}

function ProductRow({ p }) {
  const statusColors = { top: ['#dcfce7', '#15803d', '🔝'], good: ['#dbeafe', '#1d4ed8', '✓'], average: ['#fff7ed', '#c2410c', '~'], loss: ['#fee2e2', '#991b1b', '✗'] }
  const [bg, col, icon] = statusColors[p.status] || ['#f3f4f6', '#6b7280', '?']
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9f7ff', gap: 8 }}>
      <span style={{ background: bg, color: col, fontSize: 11, padding: '2px 6px', borderRadius: 6, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, fontSize: 12 }}>
        <div style={{ fontWeight: 500, color: '#1a1a2e', marginBottom: 1 }}>{p.title}</div>
        <div style={{ color: '#9ca3af', fontSize: 11 }}>{p.brand} · {p.category} · {p.impressions?.toLocaleString()} imp</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, color: col, fontSize: 13 }}>×{fmt(p.roas, 1)}</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtEur(p.cost_eur)}</div>
      </div>
    </div>
  )
}

function ActionCard({ action, onApprove, onReject }) {
  const types = {
    adjust_bid: { label: 'Enchère', bg: '#eff6ff', border: '#bfdbfe', badge: '#1d4ed8' },
    pause_products: { label: 'Pause', bg: '#fff7ed', border: '#fed7aa', badge: '#c2410c' },
    create_campaign: { label: 'Campagne', bg: '#f0fdf4', border: '#bbf7d0', badge: '#15803d' },
  }
  const t = types[action.type] || { label: action.type, bg: '#f8f7ff', border: '#e0deff', badge: '#7c3aed' }
  const [done, setDone] = useState(false)

  if (done) return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 8, fontSize: 13, color: '#15803d' }}>
      ✓ Action traitée
    </div>
  )

  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Badge label={t.label} color={t.badge} bg={t.bg} />
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(action.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style={{ fontSize: 12, marginBottom: 8 }}>
        {Object.entries(action.params || {}).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 3 }}>
            <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{k}: </span>
            <span style={{ color: '#1a1a2e' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { onApprove(action.id); setDone(true) }}
          style={{ background: '#15803d', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          ✓ Approuver
        </button>
        <button onClick={() => { onReject(action.id); setDone(true) }}
          style={{ background: 'white', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
          ✗ Refuser
        </button>
      </div>
    </div>
  )
}

function IssueRow({ issue }) {
  const col = issue.severity === 'ERROR' ? '#dc2626' : '#c2410c'
  const bg = issue.severity === 'ERROR' ? '#fee2e2' : '#fff7ed'
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #f9f7ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ background: bg, color: col, fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{issue.severity}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{issue.title}</span>
      </div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>⚠ {issue.issue}</div>
      <div style={{ fontSize: 11, color: '#15803d' }}>→ {issue.fix}</div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MaxAgent() {
  const [tab, setTab] = useState('chat')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [pendingActions, setPendingActions] = useState([])
  const historyRef = useRef([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (tab === 'dashboard' || tab === 'actions' || tab === 'merchant') fetchDashboard()
  }, [tab])

  const fetchDashboard = async () => {
    try {
      const r = await fetch('/api/dashboard')
      const data = await r.json()
      setDashboard(data)
      setPendingActions(data.pending_actions || [])
    } catch (e) { console.error(e) }
  }

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: userText }
    historyRef.current = [...historyRef.current, userMsg]

    const agentMsg = { role: 'assistant', content: '', tools: [], loading: true }
    setMessages(prev => [...prev, userMsg, agentMsg])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const resp = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyRef.current }),
        signal: controller.signal
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalContent = ''
      let usedTools = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'text') {
              finalContent += evt.content
              setMessages(prev => {
                const msgs = [...prev]
                const last = msgs[msgs.length - 1]
                if (last?.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, content: finalContent, tools: usedTools, loading: false }
                }
                return msgs
              })
            } else if (evt.type === 'tool_start') {
              if (!usedTools.includes(evt.tool)) usedTools = [...usedTools, evt.tool]
              setMessages(prev => {
                const msgs = [...prev]
                const last = msgs[msgs.length - 1]
                if (last?.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, tools: usedTools, loading: true }
                }
                return msgs
              })
            } else if (evt.type === 'done') {
              historyRef.current = [...historyRef.current, { role: 'assistant', content: finalContent }]
              setMessages(prev => {
                const msgs = [...prev]
                const last = msgs[msgs.length - 1]
                if (last?.role === 'assistant') {
                  msgs[msgs.length - 1] = { ...last, loading: false }
                }
                return msgs
              })
              fetchDashboard()
            } else if (evt.type === 'error') {
              setMessages(prev => {
                const msgs = [...prev]
                msgs[msgs.length - 1] = { role: 'assistant', content: '⚠️ Erreur: ' + evt.message, tools: [], loading: false }
                return msgs
              })
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const msgs = [...prev]
          msgs[msgs.length - 1] = { role: 'assistant', content: '⚠️ Connexion perdue. Vérifiez votre clé API Anthropic dans .env.local', tools: [], loading: false }
          return msgs
        })
      }
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, loading])

  const approveAction = async (id) => {
    await fetch(`/api/actions?id=${id}&action=approve`, { method: 'POST' })
    fetchDashboard()
  }
  const rejectAction = async (id) => {
    await fetch(`/api/actions?id=${id}&action=reject`, { method: 'POST' })
    fetchDashboard()
  }

  const pendingCount = pendingActions.length
  const TABS = [
    { id: 'chat', label: '💬 Agent MAX' },
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'actions', label: `✅ Actions${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'merchant', label: '⚠️ Merchant Center' },
  ]

  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', background: '#f8f7ff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        * { box-sizing: border-box; }
        :root { --bg1: white; --bg2: #f5f3ff; --t1: #1a1a2e; --t2: #6b7280; --t3: #9ca3af; }
        @media (prefers-color-scheme: dark) {
          :root { --bg1: #1a1a2e; --bg2: #252538; --t1: #f0f0f8; --t2: #9ca3af; --t3: #6b7280; }
        }
        textarea:focus { outline: none; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'var(--bg1)', borderBottom: '1px solid #f0eeff', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>M</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 16 }}>MAX Agent</div>
            <div style={{ fontSize: 11, color: '#7c3aed' }}>Expert Google Shopping Autonome</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {dashboard && <Badge label={`ROAS ×${fmt(dashboard.summary?.global_roas, 1)}`} color="#15803d" bg="#dcfce7" />}
          <Badge label={dashboard?.mode === 'demo' ? '🎮 DEMO' : '🟢 LIVE'} color={dashboard?.mode === 'demo' ? '#5b21b6' : '#15803d'} bg={dashboard?.mode === 'demo' ? '#ede9fe' : '#dcfce7'} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--bg1)', borderBottom: '1px solid #f0eeff', padding: '0 16px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none', padding: '11px 16px', fontSize: 13,
            fontWeight: tab === t.id ? 700 : 400,
            color: tab === t.id ? '#7c3aed' : 'var(--t2)',
            borderBottom: tab === t.id ? '2px solid #7c3aed' : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: CHAT ── */}
      {tab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 820, width: '100%', margin: '0 auto' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 40 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white' }}>M</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)', margin: '0 0 8px', letterSpacing: -0.5 }}>MAX est prêt à optimiser vos campagnes</h1>
                <p style={{ color: 'var(--t2)', fontSize: 14, margin: '0 0 28px' }}>Analyse · Optimise · Crée · Rapporte — en autonomie complète</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
                  {QUICK_PROMPTS.map(q => (
                    <button key={q.label} onClick={() => sendMessage(q.prompt)}
                      style={{ background: 'var(--bg1)', border: '1px solid #e8e5ff', borderRadius: 20, padding: '8px 16px', fontSize: 13, color: '#4c1d95', cursor: 'pointer' }}>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions bar */}
          {messages.length > 0 && (
            <div style={{ padding: '6px 16px', background: 'var(--bg1)', borderTop: '1px solid #f0eeff', display: 'flex', gap: 6, overflowX: 'auto' }}>
              {QUICK_PROMPTS.map(q => (
                <button key={q.label} onClick={() => sendMessage(q.prompt)} disabled={loading}
                  style={{ background: '#f5f3ff', border: '1px solid #e8e5ff', borderRadius: 16, padding: '4px 12px', fontSize: 12, color: '#7c3aed', cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1 }}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px 16px', background: 'var(--bg1)', borderTop: messages.length === 0 ? 'none' : '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#f8f7ff', borderRadius: 14, border: '1.5px solid #e0deff', padding: '8px 8px 8px 14px' }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                disabled={loading} placeholder="Demande à MAX d'analyser, optimiser ou agir sur tes campagnes…"
                rows={1} style={{ flex: 1, border: 'none', background: 'transparent', resize: 'none', fontSize: 14, color: 'var(--t1)', fontFamily: 'inherit', maxHeight: 120, overflowY: 'auto' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }} />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                style={{ width: 36, height: 36, borderRadius: 10, background: loading || !input.trim() ? '#e0deff' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: DASHBOARD ── */}
      {tab === 'dashboard' && (
        <div style={{ padding: 20, maxWidth: 920, margin: '0 auto', width: '100%' }}>
          {!dashboard ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--t2)' }}>Chargement…</div> : (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <Kpi label="Coût total (30j)" value={fmtEur(dashboard.summary.total_cost_eur)} />
                <Kpi label="Revenus générés" value={fmtEur(dashboard.summary.total_revenue)} color="#15803d" />
                <Kpi label="ROAS global" value={`×${fmt(dashboard.summary.global_roas, 1)}`} color={dashboard.summary.global_roas >= 3 ? '#15803d' : '#dc2626'} />
                <Kpi label="Conversions" value={dashboard.summary.total_conversions} />
                <Kpi label="Campagnes actives" value={dashboard.summary.active_campaigns} />
                <Kpi label="Erreurs GMC" value={dashboard.summary.merchant_errors} color={dashboard.summary.merchant_errors > 0 ? '#dc2626' : '#15803d'} />
              </div>
              <div style={{ background: 'var(--bg1)', borderRadius: 12, border: '1px solid #f0eeff', padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Campagnes</div>
                {dashboard.campaigns.map((c, i) => <CampaignRow key={i} c={c} />)}
              </div>
              {dashboard.guardrails && (
                <div style={{ marginTop: 14, background: '#ede9fe', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#4c1d95' }}>
                  <strong>Garde-fous actifs :</strong> Budget max {fmtEur(dashboard.guardrails.max_daily_budget_eur)}/j · ROAS min ×{dashboard.guardrails.min_roas} · Approbation humaine {dashboard.guardrails.require_approval ? 'activée' : 'désactivée'} · Mode {dashboard.guardrails.sandbox ? 'DEMO' : 'PRODUCTION'}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: ACTIONS ── */}
      {tab === 'actions' && (
        <div style={{ padding: 20, maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Actions en attente</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16 }}>MAX a proposé ces actions. Approuvez ou refusez chacune.</div>
          {pendingActions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg1)', borderRadius: 12, border: '1px solid #f0eeff', color: 'var(--t2)', fontSize: 14 }}>
              Aucune action en attente — demandez à MAX d'analyser vos campagnes
            </div>
          ) : (
            pendingActions.map(a => <ActionCard key={a.id} action={a} onApprove={approveAction} onReject={rejectAction} />)
          )}
        </div>
      )}

      {/* ── TAB: MERCHANT CENTER ── */}
      {tab === 'merchant' && (
        <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', width: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Merchant Center — Erreurs & avertissements</div>
          {!dashboard ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--t2)' }}>Chargement…</div> : (
            <>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <Kpi label="Produits actifs" value={dashboard.summary.active_products} color="#15803d" />
                <Kpi label="Produits refusés" value={dashboard.summary.disapproved_products} color="#dc2626" />
                <Kpi label="Erreurs critiques" value={dashboard.summary.merchant_errors} color="#dc2626" />
                <Kpi label="Avertissements" value={dashboard.summary.merchant_warnings} color="#c2410c" />
              </div>
              <div style={{ background: 'var(--bg1)', borderRadius: 12, border: '1px solid #f0eeff', padding: '16px 20px' }}>
                {(dashboard.merchant_issues || []).map((issue, i) => <IssueRow key={i} issue={issue} />)}
              </div>
              <div style={{ marginTop: 14, background: '#fff7ed', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
                💡 Dis à MAX "Corrige les erreurs Merchant Center" et il t'indiquera exactement quoi modifier dans WooCommerce.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
