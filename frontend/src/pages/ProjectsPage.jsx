import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'
import { getProjects } from '../services/projectService'

const TECH_TAGS = ['React', 'Python', 'Node.js', 'Flutter', 'Machine Learning', 'Java', 'Vue', 'Django']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString()
}

function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="bg-gray-800 border border-gray-700/60 rounded-xl p-5 hover:border-indigo-500/40 transition-all flex flex-col gap-3 group"
    >
      {project.imageUrls?.[0] && (
        <img
          src={project.imageUrls[0]}
          alt={project.title}
          className="w-full h-36 object-cover rounded-lg"
        />
      )}
      <div>
        <h3 className="text-white font-semibold text-base group-hover:text-indigo-300 transition-colors leading-snug">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
        )}
      </div>
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-xs text-gray-500">+{project.techStack.length - 4}</span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/40">
        <div className="flex items-center gap-2">
          {project.createdBy?.avatarUrl ? (
            <img src={project.createdBy.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
              {project.createdBy?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <span className="text-gray-500 text-xs">{project.createdBy?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>❤️ {project.likes?.length || 0}</span>
          <span>{timeAgo(project.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}

function ProjectsPage() {
  const { user } = useAuth()
  const [techFilter, setTechFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', techFilter],
    queryFn: () => getProjects(techFilter || undefined),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Project Showcase</h1>
              <p className="text-gray-400 text-sm mt-1">Discover what your campus is building</p>
            </div>
            <Link
              to="/projects/create"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + New Project
            </Link>
          </div>

          {/* Search + Filter */}
          <div className="mb-5 space-y-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); setTechFilter(searchInput.trim()) }}
            >
              <input
                type="text"
                placeholder="Filter by technology..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Filter
              </button>
              {techFilter && (
                <button
                  type="button"
                  onClick={() => { setTechFilter(''); setSearchInput('') }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </form>
            <div className="flex flex-wrap gap-2">
              {TECH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSearchInput(tag); setTechFilter(tag) }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    techFilter === tag
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                      : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-5 animate-pulse">
                  <div className="h-36 bg-gray-700 rounded-lg mb-3" />
                  <div className="h-5 bg-gray-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-full mb-1" />
                  <div className="h-3 bg-gray-700 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 bg-gray-800 border border-gray-700/60 rounded-xl">
              <p className="text-4xl mb-3">🚀</p>
              <p className="text-white font-semibold">No projects yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to showcase your project!</p>
              <Link
                to="/projects/create"
                className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ProjectsPage
