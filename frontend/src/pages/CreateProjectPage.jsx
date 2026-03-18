import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { createProject } from '../services/projectService'

function CreateProjectPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    demoUrl: '',
    imageUrls: '',
  })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project._id}`)
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create project.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    const techStack = form.techStack.split(',').map((s) => s.trim()).filter(Boolean)
    const imageUrls = form.imageUrls.split('\n').map((s) => s.trim()).filter(Boolean)
    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      techStack,
      githubUrl: form.githubUrl.trim() || null,
      demoUrl: form.demoUrl.trim() || null,
      imageUrls,
    })
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 max-w-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Share a Project</h1>
            <p className="text-gray-400 text-sm mt-1">Showcase what you've built to your campus</p>
          </div>

          <div className="bg-gray-800 border border-gray-700/60 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">Project Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={set('title')}
                  placeholder="e.g., CampusConnect"
                  maxLength={200}
                  className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="What does your project do? What problem does it solve?"
                  maxLength={3000}
                  rows={4}
                  className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">
                  Tech Stack <span className="text-gray-500 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.techStack}
                  onChange={set('techStack')}
                  placeholder="React, Node.js, MongoDB, Tailwind"
                  className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">GitHub URL</label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={set('githubUrl')}
                  placeholder="https://github.com/..."
                  className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">Demo URL</label>
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={set('demoUrl')}
                  placeholder="https://..."
                  className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-1.5">
                  Image URLs <span className="text-gray-500 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={form.imageUrls}
                  onChange={set('imageUrls')}
                  placeholder="https://... (paste screenshot URLs)"
                  rows={2}
                  className="w-full bg-gray-700/60 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {mutation.isPending ? 'Publishing...' : 'Publish Project'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateProjectPage
