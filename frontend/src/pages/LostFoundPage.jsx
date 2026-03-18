import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import {
  getLostFoundItems,
  createLostFoundItem,
  resolveLostFoundItem,
  deleteLostFoundItem,
} from '../services/lostFoundService'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function PostForm({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', location: '' })
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createLostFoundItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-found'] })
      onClose()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    const fd = new FormData()
    fd.append('type', form.type)
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('location', form.location)
    if (image) fd.append('image', image)
    mutation.mutate(fd)
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="bg-gray-800 border border-indigo-500/40 rounded-xl p-5 mb-5">
      <h3 className="text-white font-semibold mb-4">Post Item</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {['lost', 'found'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                form.type === t ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {t === 'lost' ? '😞 Lost' : '😊 Found'}
            </button>
          ))}
        </div>
        <input value={form.title} onChange={set('title')} placeholder="What did you lose/find? *" className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        <textarea value={form.description} onChange={set('description')} placeholder="Description (color, brand, distinctive features...)" rows={2} className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
        <input value={form.location} onChange={set('location')} placeholder="Location (e.g., Library 2nd floor, Canteen)" className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        <div>
          <label className="text-gray-400 text-xs mb-1.5 block">Photo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-gray-400 text-sm" />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{mutation.isPending ? 'Posting...' : 'Post'}</button>
          <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}

function LostFoundPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('lost')
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('open')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['lost-found', tab, statusFilter],
    queryFn: () => getLostFoundItems({ type: tab, status: statusFilter }),
    placeholderData: (prev) => prev,
  })

  const resolveMutation = useMutation({
    mutationFn: resolveLostFoundItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lost-found'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLostFoundItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lost-found'] }),
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
              <p className="text-gray-400 text-sm mt-1">Help your campus find what's missing</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Post Item
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-800 border border-gray-700/60 rounded-lg mb-4 w-fit">
            {['lost', 'found'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setShowForm(false) }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {t === 'lost' ? '😞 Lost Items' : '😊 Found Items'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mb-5">
            {['open', 'resolved', ''].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  statusFilter === s
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                }`}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {showForm && <PostForm onClose={() => setShowForm(false)} />}

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse h-24" />)}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-3xl mb-2">{tab === 'lost' ? '😞' : '😊'}</p>
              <p className="text-white font-semibold">No {tab} items</p>
              <p className="text-gray-400 text-sm mt-1">
                {tab === 'lost' ? 'Nothing reported lost.' : 'Nothing found and posted yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className={`bg-gray-800 border rounded-xl p-4 transition-all ${item.status === 'resolved' ? 'border-gray-700/30 opacity-60' : 'border-gray-700/60 hover:border-gray-600'}`}>
                  <div className="flex gap-4">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold text-sm ${item.status === 'resolved' ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.title}
                          </h3>
                          {item.status === 'resolved' && (
                            <span className="text-xs text-green-400 font-medium">✓ Resolved</span>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {item.postedBy?._id === user?._id && item.status === 'open' && (
                            <button
                              onClick={() => resolveMutation.mutate(item._id)}
                              className="text-xs bg-green-900/40 text-green-300 border border-green-700/40 px-2 py-1 rounded-lg hover:bg-green-800/40 transition-colors"
                            >
                              ✓ Resolved
                            </button>
                          )}
                          {(item.postedBy?._id === user?._id || ['admin', 'campusAdmin'].includes(user?.role)) && (
                            <button onClick={() => deleteMutation.mutate(item._id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
                          )}
                        </div>
                      </div>
                      {item.description && <p className="text-gray-400 text-xs mt-1">{item.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        {item.location && <span>📍 {item.location}</span>}
                        <span>{timeAgo(item.createdAt)}</span>
                        <Link to={`/profile/${item.postedBy?._id}`} className="hover:text-indigo-300 transition-colors">
                          by {item.postedBy?.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default LostFoundPage
