import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../services/announcementService'

const CATEGORY_META = {
  academic:   { label: 'Academic',   color: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  placements: { label: 'Placements', color: 'bg-green-900/40 text-green-300 border-green-700/40' },
  events:     { label: 'Events',     color: 'bg-purple-900/40 text-purple-300 border-purple-700/40' },
  general:    { label: 'General',    color: 'bg-gray-700/60 text-gray-300 border-gray-600/40' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function AnnouncementCard({ announcement, canDelete, onDelete }) {
  const meta = CATEGORY_META[announcement.category] || CATEGORY_META.general
  return (
    <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-gray-500 text-xs">{timeAgo(announcement.createdAt)}</span>
          </div>
          <h3 className="text-white font-semibold text-base mb-1.5 leading-snug">
            {announcement.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
            {announcement.body}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(announcement._id)}
            className="text-gray-600 hover:text-red-400 transition-colors text-xs shrink-0 mt-1"
            title="Delete announcement"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/40">
        {announcement.createdBy?.avatarUrl ? (
          <img
            src={announcement.createdBy.avatarUrl}
            alt={announcement.createdBy.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
            {announcement.createdBy?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span className="text-gray-500 text-xs">{announcement.createdBy?.name || 'Unknown'}</span>
      </div>
    </div>
  )
}

function CreateAnnouncementForm({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', body: '', category: 'general' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      onClose()
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to post announcement.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required.')
      return
    }
    mutation.mutate(form)
  }

  return (
    <div className="bg-gray-800 border border-indigo-500/40 rounded-xl p-5 mb-6">
      <h3 className="text-white font-semibold mb-4">New Announcement</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          maxLength={200}
          className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
        <textarea
          placeholder="Announcement body..."
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          maxLength={5000}
          rows={4}
          className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="general">General</option>
          <option value="academic">Academic</option>
          <option value="placements">Placements</option>
          <option value="events">Events</option>
        </select>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {mutation.isPending ? 'Posting...' : 'Post Announcement'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function AnnouncementsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const canPost = ['committee', 'campusAdmin', 'superAdmin'].includes(user?.role)

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-3xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Announcements</h1>
              <p className="text-gray-400 text-sm mt-1">Official updates from your campus</p>
            </div>
            {canPost && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + New Announcement
              </button>
            )}
          </div>

          {/* Create form */}
          {showForm && <CreateAnnouncementForm onClose={() => setShowForm(false)} />}

          {/* List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 animate-pulse">
                  <div className="h-3 bg-gray-700 rounded w-16 mb-3" />
                  <div className="h-5 bg-gray-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-full mb-1.5" />
                  <div className="h-3 bg-gray-700 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-4xl mb-3">📢</p>
              <p className="text-white font-semibold">No announcements yet</p>
              <p className="text-gray-400 text-sm mt-1">
                {canPost
                  ? 'Post the first announcement for your campus.'
                  : 'Check back later for updates from your campus.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <AnnouncementCard
                  key={a._id}
                  announcement={a}
                  canDelete={canPost}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AnnouncementsPage
