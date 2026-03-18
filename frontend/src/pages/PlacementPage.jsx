import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import {
  getInterviewExps, createInterviewExp, deleteInterviewExp, upvoteInterviewExp,
  getOpportunities, createOpportunity, deleteOpportunity,
} from '../services/placementService'

const DIFFICULTY_COLOR = {
  easy: 'bg-green-900/40 text-green-300 border-green-700/40',
  medium: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  hard: 'bg-red-900/40 text-red-300 border-red-700/40',
}

const OUTCOME_COLOR = {
  selected: 'bg-green-900/40 text-green-300',
  rejected: 'bg-red-900/40 text-red-300',
  pending: 'bg-gray-700/60 text-gray-400',
}

const OPP_TYPE_LABEL = {
  on_campus: 'On Campus',
  off_campus: 'Off Campus',
  internship: 'Internship',
  freelance: 'Freelance',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── Interview Experience Form ────────────────────────────────────────────────

function ExpForm({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    company: '', role: '', difficulty: 'medium', outcome: 'pending',
    year: new Date().getFullYear(), experience: '', tips: '',
  })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createInterviewExp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement-interviews'] })
      onClose()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed.'),
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="bg-gray-800 border border-indigo-500/40 rounded-xl p-5 mb-5">
      <h3 className="text-white font-semibold mb-4">Share Interview Experience</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.company || !form.role || !form.experience) { setError('Company, role and experience are required.'); return } mutation.mutate(form) }} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input value={form.company} onChange={set('company')} placeholder="Company *" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          <input value={form.role} onChange={set('role')} placeholder="Role *" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select value={form.difficulty} onChange={set('difficulty')} className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={form.outcome} onChange={set('outcome')} className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
          <input type="number" value={form.year} onChange={set('year')} placeholder="Year" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <textarea value={form.experience} onChange={set('experience')} placeholder="Describe your experience, questions asked, rounds etc. *" rows={4} className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
        <textarea value={form.tips} onChange={set('tips')} placeholder="Tips for future candidates (optional)" rows={2} className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{mutation.isPending ? 'Posting...' : 'Share'}</button>
          <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}

// ─── Opportunity Form ─────────────────────────────────────────────────────────

function OppForm({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ company: '', role: '', type: 'off_campus', description: '', applyLink: '', deadline: '' })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement-opportunities'] })
      onClose()
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed.'),
  })

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="bg-gray-800 border border-indigo-500/40 rounded-xl p-5 mb-5">
      <h3 className="text-white font-semibold mb-4">Post Opportunity</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (!form.company || !form.role) { setError('Company and role are required.'); return } mutation.mutate(form) }} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input value={form.company} onChange={set('company')} placeholder="Company *" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          <input value={form.role} onChange={set('role')} placeholder="Role *" className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.type} onChange={set('type')} className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
            <option value="on_campus">On Campus</option>
            <option value="off_campus">Off Campus</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </select>
          <input type="date" value={form.deadline} onChange={set('deadline')} className="bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <textarea value={form.description} onChange={set('description')} placeholder="Description (optional)" rows={2} className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none" />
        <input value={form.applyLink} onChange={set('applyLink')} placeholder="Apply link (optional)" className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{mutation.isPending ? 'Posting...' : 'Post'}</button>
          <button type="button" onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}

function PlacementPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('interviews')
  const [showForm, setShowForm] = useState(false)
  const [companyFilter, setCompanyFilter] = useState('')

  const { data: experiences = [], isLoading: loadingExp } = useQuery({
    queryKey: ['placement-interviews', companyFilter],
    queryFn: () => getInterviewExps({ company: companyFilter || undefined }),
    placeholderData: (prev) => prev,
  })

  const { data: opportunities = [], isLoading: loadingOpp } = useQuery({
    queryKey: ['placement-opportunities', companyFilter],
    queryFn: () => getOpportunities({ company: companyFilter || undefined }),
    placeholderData: (prev) => prev,
  })

  const deleteExpMutation = useMutation({
    mutationFn: deleteInterviewExp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placement-interviews'] }),
  })

  const deleteOppMutation = useMutation({
    mutationFn: deleteOpportunity,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placement-opportunities'] }),
  })

  const upvoteMutation = useMutation({
    mutationFn: upvoteInterviewExp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placement-interviews'] }),
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Placement Prep Hub</h1>
              <p className="text-gray-400 text-sm mt-1">Interview experiences & opportunities shared by your campus</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Share
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-800 border border-gray-700/60 rounded-lg mb-5 w-fit">
            {['interviews', 'opportunities'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setShowForm(false) }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {t === 'interviews' ? '🎤 Interview Exp' : '💼 Opportunities'}
              </button>
            ))}
          </div>

          {/* Form */}
          {showForm && (
            tab === 'interviews'
              ? <ExpForm onClose={() => setShowForm(false)} />
              : <OppForm onClose={() => setShowForm(false)} />
          )}

          {/* Filter */}
          <input
            type="text"
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 mb-5"
          />

          {/* Interview Experiences */}
          {tab === 'interviews' && (
            <div>
              {loadingExp ? (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-5 animate-pulse h-32" />)}</div>
              ) : experiences.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
                  <p className="text-3xl mb-2">🎤</p>
                  <p className="text-white font-semibold">No experiences yet</p>
                  <p className="text-gray-400 text-sm mt-1">Share your interview experience to help others!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp._id} className="bg-gray-800 border border-gray-700/60 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold">{exp.company}</span>
                            <span className="text-gray-400 text-sm">• {exp.role}</span>
                            {exp.year && <span className="text-gray-500 text-xs">{exp.year}</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[exp.difficulty] || ''}`}>
                              {exp.difficulty}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLOR[exp.outcome] || ''}`}>
                              {exp.outcome}
                            </span>
                          </div>
                        </div>
                        {exp.postedBy?._id === user?._id && (
                          <button onClick={() => deleteExpMutation.mutate(exp._id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{exp.experience}</p>
                      {exp.tips && (
                        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 text-sm text-yellow-200/80 mb-3">
                          <span className="font-medium text-yellow-300">💡 Tips: </span>{exp.tips}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700/40">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                            {exp.postedBy?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-gray-500 text-xs">{exp.postedBy?.name}</span>
                          <span className="text-gray-600 text-xs">{timeAgo(exp.createdAt)}</span>
                        </div>
                        <button
                          onClick={() => upvoteMutation.mutate(exp._id)}
                          className="flex items-center gap-1 text-gray-400 hover:text-indigo-300 text-xs transition-colors"
                        >
                          👍 {exp.upvotes?.length || 0} helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Opportunities */}
          {tab === 'opportunities' && (
            <div>
              {loadingOpp ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse h-24" />)}</div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-16 bg-gray-800 border border-gray-700/60 rounded-xl">
                  <p className="text-3xl mb-2">💼</p>
                  <p className="text-white font-semibold">No opportunities yet</p>
                  <p className="text-gray-400 text-sm mt-1">Share off-campus opportunities with your campus!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunities.map((opp) => (
                    <div key={opp._id} className="bg-gray-800 border border-gray-700/60 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-white font-semibold">{opp.company}</span>
                            <span className="text-gray-400 text-sm">• {opp.role}</span>
                            <span className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded-full">
                              {OPP_TYPE_LABEL[opp.type] || opp.type}
                            </span>
                          </div>
                          {opp.description && <p className="text-gray-400 text-sm mb-2">{opp.description}</p>}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {opp.deadline && <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>}
                            <span>{timeAgo(opp.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {opp.applyLink && (
                            <a href={opp.applyLink} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                              Apply →
                            </a>
                          )}
                          {opp.postedBy?._id === user?._id && (
                            <button onClick={() => deleteOppMutation.mutate(opp._id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PlacementPage
