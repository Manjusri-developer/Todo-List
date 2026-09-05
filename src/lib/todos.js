import { isSupabaseConfigured, supabase } from './supabase'

const LOCAL_KEY = 'lumen_todos_v2'

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []
  } catch {
    return []
  }
}

function writeLocal(todos) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(todos))
}

export async function listTodos(userId) {
  if (isSupabaseConfigured) {
    let query = supabase.from('todos').select('*').order('created_at', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) throw error
    return data || []
  }
  return readLocal()
}

export async function createTodo({ title, userId }) {
  const row = {
    title: title.trim(),
    completed: false,
    priority: 'medium',
  }

  if (isSupabaseConfigured) {
    const payload = userId ? { ...row, user_id: userId } : row
    const { data, error } = await supabase.from('todos').insert(payload).select().single()
    if (error) throw error
    return data
  }

  const local = {
    id: uid(),
    ...row,
    created_at: new Date().toISOString(),
  }
  const next = [local, ...readLocal()]
  writeLocal(next)
  return local
}

export async function updateTodo(id, patch) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('todos').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const next = readLocal().map((t) => (t.id === id ? { ...t, ...patch } : t))
  writeLocal(next)
  return next.find((t) => t.id === id)
}

export async function deleteTodo(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) throw error
    return id
  }
  writeLocal(readLocal().filter((t) => t.id !== id))
  return id
}
