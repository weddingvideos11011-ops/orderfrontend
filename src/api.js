const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function getProducts({ category, featured, sort, signal } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (featured) params.set('featured', 'true')
  if (sort) params.set('sort', sort)
  const query = params.size ? `?${params}` : ''
  const response = await fetch(`${API_BASE}/products${query}`, { signal })
  if (!response.ok) throw new Error('Unable to load products')
  return response.json()
}

export async function getCategories({ signal } = {}) {
  const response = await fetch(`${API_BASE}/categories`, { signal })
  if (!response.ok) throw new Error('Unable to load product categories')
  return response.json()
}

export async function getCompanyInfo({ signal } = {}) {
  const response = await fetch(`${API_BASE}/company`, { signal })
  if (!response.ok) throw new Error('Unable to load company details')
  return response.json()
}

export async function getProduct(id, { signal } = {}) {
  const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, { signal })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Unable to load product')
  return data
}

export async function submitQuote(payload) {
  const response = await fetch(`${API_BASE}/quotes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Unable to submit quote')
  return data
}

export async function submitContact(payload) {
  const response = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Unable to send message')
  return data
}

export async function login(payload) {
  const response = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Unable to log in')
  return data
}
