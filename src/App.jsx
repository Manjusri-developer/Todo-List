import { useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { createTodo, deleteTodo, listTodos, updateTodo } from './lib/todos'

const FILTERS = ['all', 'active', 'done']

function formatDay() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [user, setUser] = useState(null)
  const [authMsg, setAuthMsg] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const rows = await listTodos(user?.id)
        if (!cancelled) setTodos(rows)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load todos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const visible = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'done') return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  const remaining = todos.filter((t) => !t.completed).length

  async function onAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const row = await createTodo({ title, userId: user?.id })
      if (priority !== 'medium') {
        const updated = await updateTodo(row.id, { priority })
        setTodos((prev) => [updated, ...prev])
      } else {
        setTodos((prev) => [row, ...prev])
      }
      setTitle('')
      setPriority('medium')
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggle(todo) {
    const next = { completed: !todo.completed }
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, ...next } : t)))
    try {
      await updateTodo(todo.id, next)
    } catch (err) {
      setError(err.message)
    }
  }

  async function saveEdit(id) {
    if (!draft.trim()) return
    try {
      const updated = await updateTodo(id, { title: draft.trim() })
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    try {
      await deleteTodo(id)
    } catch (err) {
      setError(err.message)
    }
  }

  async function sendMagicLink(e) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setAuthMsg('Add Supabase keys in .env to enable sign-in.')
      return
    }
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setAuthMsg(authError ? authError.message : 'Check your inbox for the magic link.')
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <div style={styles.shell}>
      <div style={styles.orb} />
      <header style={styles.header}>
        <div>
          <p style={styles.kicker}>{formatDay()}</p>
          <h1 style={styles.title}>
            Lumen <em>list</em>
          </h1>
        </div>
        <div style={styles.badge}>
          <strong>{remaining}</strong>
          <span>open</span>
        </div>
      </header>

      <section style={styles.authCard}>
        {user ? (
          <div style={styles.authRow}>
            <span>Signed in as {user.email}</span>
            <button type="button" style={styles.ghost} onClick={signOut}>
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} style={styles.authForm}>
            <input
              type="email"
              required
              placeholder="Email for a magic link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.secondary}>
              Sync with Supabase
            </button>
          </form>
        )}
        <p style={styles.hint}>
          {isSupabaseConfigured
            ? authMsg || 'Tasks persist in Supabase. Sign in to keep them private to your account.'
            : 'Running locally without keys — tasks stay in this browser until you add .env.'}
        </p>
      </section>

      <form onSubmit={onAdd} style={styles.composer}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          style={{ ...styles.input, flex: 1 }}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={styles.select}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" style={styles.primary}>
          Add
        </button>
      </form>

      <div style={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={f === filter ? styles.filterOn : styles.filter}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <ul style={styles.list}>
        {loading && <li style={styles.empty}>Loading your list…</li>}
        {!loading && visible.length === 0 && (
          <li style={styles.empty}>Nothing here. Capture the next small win.</li>
        )}
        {visible.map((todo) => (
          <li key={todo.id} style={styles.item}>
            <button type="button" onClick={() => toggle(todo)} style={styles.check} aria-label="toggle">
              <span style={todo.completed ? styles.dotOn : styles.dot} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editing === todo.id ? (
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo.id)
                    if (e.key === 'Escape') setEditing(null)
                  }}
                  style={styles.edit}
                />
              ) : (
                <p
                  style={{
                    ...styles.todoText,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.5 : 1,
                  }}
                >
                  {todo.title || todo.todo}
                </p>
              )}
              <small style={styles.meta}>
                <span style={styles.prio[todo.priority] || styles.prio.medium}>{todo.priority || 'medium'}</span>
                {todo.created_at &&
                  new Date(todo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
            <div style={styles.actions}>
              <button
                type="button"
                style={styles.icon}
                onClick={() => {
                  setEditing(todo.id)
                  setDraft(todo.title || todo.todo || '')
                }}
              >
                Edit
              </button>
              <button type="button" style={{ ...styles.icon, color: 'var(--danger)' }} onClick={() => remove(todo.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const styles = {
  shell: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '48px 20px 80px',
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    inset: '40px 10% auto',
    height: 220,
    filter: 'blur(80px)',
    background: 'linear-gradient(120deg, rgba(200,245,66,0.18), rgba(124,240,210,0.12))',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 28,
  },
  kicker: {
    margin: 0,
    color: 'var(--muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    margin: '8px 0 0',
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(42px, 8vw, 72px)',
    fontWeight: 400,
    lineHeight: 0.95,
  },
  badge: {
    display: 'grid',
    placeItems: 'center',
    minWidth: 72,
    padding: '10px 14px',
    borderRadius: 18,
    background: 'var(--accent)',
    color: '#111',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  authCard: {
    position: 'relative',
    zIndex: 1,
    padding: 16,
    borderRadius: 20,
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    backdropFilter: 'blur(16px)',
    marginBottom: 16,
  },
  authRow: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  authForm: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  hint: { margin: '10px 0 0', color: 'var(--muted)', fontSize: 13 },
  composer: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    padding: 10,
    borderRadius: 22,
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    boxShadow: 'var(--shadow)',
    marginBottom: 18,
  },
  input: {
    background: 'transparent',
    border: '1px solid var(--line)',
    color: 'var(--text)',
    borderRadius: 14,
    padding: '12px 14px',
    outline: 'none',
    minWidth: 180,
    flex: 1,
  },
  select: {
    background: '#121624',
    color: 'var(--text)',
    border: '1px solid var(--line)',
    borderRadius: 14,
    padding: '12px',
  },
  primary: {
    border: 0,
    borderRadius: 14,
    padding: '12px 18px',
    background: 'var(--accent)',
    color: '#111',
    fontWeight: 700,
  },
  secondary: {
    border: 0,
    borderRadius: 14,
    padding: '12px 16px',
    background: 'var(--accent-2)',
    color: '#08221c',
    fontWeight: 600,
  },
  ghost: {
    border: '1px solid var(--line)',
    background: 'transparent',
    color: 'var(--text)',
    borderRadius: 12,
    padding: '8px 12px',
  },
  filters: { display: 'flex', gap: 8, marginBottom: 14 },
  filter: {
    border: '1px solid var(--line)',
    background: 'transparent',
    color: 'var(--muted)',
    borderRadius: 999,
    padding: '6px 12px',
    textTransform: 'capitalize',
  },
  filterOn: {
    border: 0,
    background: 'var(--text)',
    color: '#111',
    borderRadius: 999,
    padding: '6px 12px',
    textTransform: 'capitalize',
    fontWeight: 600,
  },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 20,
    background: 'rgba(16,20,32,0.78)',
    border: '1px solid var(--line)',
  },
  check: { border: 0, background: 'transparent', padding: 0 },
  dot: {
    display: 'block',
    width: 22,
    height: 22,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.35)',
  },
  dotOn: {
    display: 'block',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'var(--accent)',
  },
  todoText: { margin: 0, fontSize: 16 },
  meta: { display: 'flex', gap: 10, color: 'var(--muted)', fontSize: 12, marginTop: 6 },
  prio: {
    low: { color: 'var(--low)', textTransform: 'uppercase', letterSpacing: 0.6 },
    medium: { color: 'var(--med)', textTransform: 'uppercase', letterSpacing: 0.6 },
    high: { color: 'var(--high)', textTransform: 'uppercase', letterSpacing: 0.6 },
  },
  actions: { display: 'flex', gap: 6 },
  icon: { border: 0, background: 'transparent', color: 'var(--muted)', fontSize: 12 },
  edit: {
    width: '100%',
    background: '#0c1018',
    border: '1px solid var(--accent)',
    color: 'var(--text)',
    borderRadius: 10,
    padding: '8px 10px',
  },
  empty: { color: 'var(--muted)', textAlign: 'center', padding: 28 },
  error: { color: 'var(--danger)', fontSize: 13 },
}
