import { useState, type FormEvent } from 'react';
import { Code2, ExternalLink, Plus, Trophy, Users, X } from 'lucide-react';
import { createProjectTeam, toggleProjectJoin } from '../lib/kluService';
import { CURATED_SKILLS, type ProjectTeam, type StudentPublic } from '../types/klu';

interface ProjectsViewProps {
  me: StudentPublic;
  projects: ProjectTeam[];
}

export function ProjectsView({ me, projects }: ProjectsViewProps) {
  const [filterHackathonOnly, setFilterHackathonOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openRoles, setOpenRoles] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['React / Next.js']);
  const [isHackathonTeam, setIsHackathonTeam] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleTech = (skill: string) => {
    setTechStack((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : prev.length < 10 ? [...prev, skill] : prev
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProjectTeam({
        authorUid: me.uid,
        authorName: me.fullName,
        title,
        description,
        techStack,
        openRoles,
        githubUrl,
        portfolioUrl,
        isHackathonTeam,
      });
      setTitle('');
      setDescription('');
      setOpenRoles('');
      setGithubUrl('');
      setPortfolioUrl('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const visibleProjects = filterHackathonOnly
    ? projects.filter((p) => p.isHackathonTeam)
    : projects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Projects & Teams</h1>
          <p className="text-sm text-zinc-600">
            Collaborate on software/hardware builds, link GitHub portfolios, and form hackathon squads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterHackathonOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              filterHackathonOnly
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Hackathon Teams
          </button>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-10 text-center space-y-2 shadow-xs">
          <Code2 className="w-5 h-5 text-[#C8102E] mx-auto" />
          <p className="text-sm font-medium text-zinc-950">No active project teams yet</p>
          <p className="text-xs text-zinc-500">
            Start a project or Smart India Hackathon squad to recruit teammates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visibleProjects.map((project) => {
            const isMember = project.memberUids.includes(me.uid);
            const isAuthor = project.authorUid === me.uid;
            return (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-zinc-500">
                        Led by {project.authorName}
                        {project.isHackathonTeam ? ' · Hackathon Squad' : ' · Campus Project'}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-semibold text-zinc-950">
                        {project.title}
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 capitalize">
                      {project.status}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-700 leading-relaxed">{project.description}</p>

                  <div className="text-xs space-y-1 border-t border-zinc-200 pt-3">
                    <p className="text-zinc-500">
                      Open Roles: <span className="text-zinc-900 font-medium">{project.openRoles}</span>
                    </p>
                    {project.techStack.length > 0 && (
                      <p className="text-zinc-500">
                        Stack: {project.techStack.join(' · ')}
                      </p>
                    )}
                  </div>

                  {(project.githubUrl || project.portfolioUrl) && (
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#C8102E] hover:underline font-medium"
                        >
                          GitHub Repo
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {project.portfolioUrl && (
                        <a
                          href={project.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-700 hover:underline font-medium"
                        >
                          Live / Portfolio
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 pt-3.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-zinc-500">
                    <Users className="w-3.5 h-3.5" />
                    {project.memberUids.length} members
                  </span>
                  {!isAuthor && project.status === 'recruiting' && (
                    <button
                      type="button"
                      onClick={() => toggleProjectJoin(project, me.uid)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        isMember
                          ? 'border border-rose-200 bg-rose-50 text-[#C8102E]'
                          : 'bg-[#C8102E] text-white font-semibold hover:bg-[#A30D25]'
                      }`}
                    >
                      {isMember ? 'Joined Team' : 'Join Team'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-zinc-950">Launch Project Team</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Project Title *</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Description & Progress *</label>
              <textarea
                required
                minLength={10}
                maxLength={600}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Open Roles *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={160}
                value={openRoles}
                onChange={(e) => setOpenRoles(e.target.value)}
                placeholder="e.g. Backend Engineer, ML Researcher"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">GitHub URL (Optional)</label>
                <input
                  type="url"
                  maxLength={240}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Portfolio / Demo URL</label>
                <input
                  type="url"
                  maxLength={240}
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isHackathonTeam}
                onChange={(e) => setIsHackathonTeam(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#C8102E]"
              />
              Recruiting for a Hackathon team
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700">Tech Stack</label>
              <div className="flex flex-wrap gap-1.5">
                {CURATED_SKILLS.slice(0, 10).map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleTech(sk)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] ${
                      techStack.includes(sk)
                        ? 'border-[#C8102E] bg-rose-50 text-[#C8102E] font-medium'
                        : 'border-zinc-200 bg-[#FAFAFA] text-zinc-600 hover:border-zinc-300 hover:text-zinc-950'
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#C8102E] py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              {submitting ? 'Creating Team...' : 'Create Project Team'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
