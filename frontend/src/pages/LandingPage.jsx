import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── All 13+ platform features ────────────────────────────────────────────────
const FEATURES = [
  { icon: '👤', title: 'Student Profiles',      desc: 'Showcase skills, projects, and resume. Get discovered by peers and collaborators.',      color: 'from-indigo-500 to-indigo-700' },
  { icon: '🤝', title: 'Team Finder',            desc: 'Find teammates for hackathons and projects. Filter by skill, year, and branch.',          color: 'from-violet-500 to-violet-700' },
  { icon: '📅', title: 'Campus Events',          desc: 'Discover hackathons, workshops, and fests. Register with one tap, get real-time alerts.', color: 'from-amber-500 to-amber-700' },
  { icon: '📚', title: 'AI Notes Search',        desc: 'Upload PDFs and let AI summarize them. Search all campus notes with natural language.',   color: 'from-blue-500 to-blue-700' },
  { icon: '🚀', title: 'Project Showcase',       desc: 'Publish your projects with links and tech stack. Get likes from your campus.',            color: 'from-pink-500 to-pink-700' },
  { icon: '🤖', title: 'AI Team Matching',       desc: 'Enter required skills and get matched with the top 5 students who complement you.',       color: 'from-emerald-500 to-emerald-700' },
  { icon: '💬', title: 'Real-time Messaging',    desc: 'Chat with your connections. Instant, private, no external apps needed.',                  color: 'from-teal-500 to-teal-700' },
  { icon: '🏆', title: 'Gamification',           desc: 'Earn points for uploading, attending, and connecting. Climb the campus leaderboard.',     color: 'from-yellow-500 to-yellow-700' },
  { icon: '🧑‍💼', title: 'Placement Prep Hub',  desc: 'Browse and share interview experiences and off-campus opportunities by company.',         color: 'from-cyan-500 to-cyan-700' },
  { icon: '🛒', title: 'Campus Marketplace',     desc: 'Buy and sell textbooks, electronics, and more — safe and local, within your campus.',     color: 'from-orange-500 to-orange-700' },
  { icon: '📍', title: 'Lost & Found',           desc: 'Post lost or found items on campus. Mark resolved when the item is returned.',            color: 'from-red-500 to-red-700' },
  { icon: '🕐', title: 'Study Rooms',            desc: 'Create Pomodoro-synced study rooms. Focus together with shared timers.',                  color: 'from-purple-500 to-purple-700' },
  { icon: '🖌️', title: 'Collaborative Workspace', desc: 'Real-time whiteboard + voice call. Build ideas together without leaving the app.',      color: 'from-fuchsia-500 to-fuchsia-700' },
]

const STEPS = [
  { step: '01', title: 'Create your profile', desc: 'Sign up with your college email. Add skills, upload your resume, and let AI extract your experience instantly.' },
  { step: '02', title: 'Discover your campus', desc: 'Browse classmates, find teammates for hackathons, attend events, and follow the campus activity feed.' },
  { step: '03', title: 'Earn & Grow', desc: 'Upload notes, publish projects, help others — and earn points on the leaderboard while you build your network.' },
]

const STATS = [
  { value: '13+', label: 'Platform Features' },
  { value: '100%', label: 'Campus Isolated' },
  { value: 'Free', label: 'For All Students' },
  { value: 'AI', label: 'Powered Search' },
]

// ── Tiny animated counter ────────────────────────────────────────────────────
function AnimatedStat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  )
}

// ── Stagger container variants ────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-indigo">
                <span className="text-white font-black text-sm">CC</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">CampusConnect</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800">
                Sign In
              </Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-glow-indigo">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Background orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="absolute top-20 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute top-1/3 right-0 w-[480px] h-[480px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="show"
            variants={container}
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Built for students · Powered by AI · Free forever
              </span>
            </motion.div>

            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="text-white">Your campus.</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Supercharged.
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              The all-in-one platform built exclusively for college students. Find teammates, share notes,
              attend events, explore placements, and earn recognition — all within your campus.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 shadow-glow-indigo"
              >
                Create Free Account →
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all backdrop-blur-sm"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.p variants={item} className="text-gray-600 text-sm mt-5">
              No credit card required · Campus-isolated data · Real-time collaboration
            </motion.p>

            {/* Stats */}
            <motion.div variants={item} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto border-t border-gray-800/60 pt-10">
              {STATS.map((s) => <AnimatedStat key={s.label} {...s} />)}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 bg-gray-950 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">Everything in one place</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              13 features. One platform.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              CampusConnect replaces 6 different apps your college currently needs.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i} variants={item}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(79,70,229,0.2)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group bg-gray-900/80 border border-gray-800/60 hover:border-indigo-500/40 rounded-2xl p-5 cursor-default backdrop-blur-sm"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-1.5 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-widest">Simple onboarding</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">Get started in 3 steps</h2>
            <p className="text-gray-400 text-lg">From signup to your first collaboration in minutes.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* connector line */}
            <div className="hidden sm:block absolute top-7 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-indigo-600/40 via-violet-600/40 to-purple-600/40" />
            {STEPS.map((s, i) => (
              <motion.div
                key={i} className="text-center relative"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.4 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-700/40 text-indigo-300 font-black text-lg flex items-center justify-center mx-auto mb-5 relative z-10">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Highlight strip ── */}
      <section className="py-16 border-y border-gray-800/40 bg-gradient-to-r from-indigo-950/30 via-gray-950 to-violet-950/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <span className="text-3xl mb-4 block">🤖</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Powered by <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Groq AI</span>
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              Upload your resume and get instant skill extraction. Upload notes and search them semantically.
              Find teammates intelligently — all running on Llama 3 via Groq.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-gray-950 to-violet-950/30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          className="relative max-w-3xl mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/40 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Ready to get started?
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Your campus community<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              is waiting for you.
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join students who are already finding teammates, sharing knowledge, and building their campus reputation on CampusConnect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-glow-indigo"
            >
              Join CampusConnect — It's Free
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign in here →</Link>
          </p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800/40 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">CC</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">CampusConnect</p>
                <p className="text-gray-600 text-xs">Built for students, by students.</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Sign In</Link>
              <Link to="/register" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
