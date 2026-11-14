import {
  ACADEMIC_YEARS,
  ARCHETYPES,
  BRANCHES,
  type CampusEvent,
  type ProjectTeam,
  type StartupIdea,
  type StudentPublic,
} from '../types/klu';

interface LeaderboardViewProps {
  students: StudentPublic[];
  ideas: StartupIdea[];
  projects: ProjectTeam[];
  events: CampusEvent[];
}

export function LeaderboardView({
  students,
  ideas,
  projects,
  events,
}: LeaderboardViewProps) {
  const totalStudents = students.length;

  const branchCounts = BRANCHES.map((branch) => ({
    label: branch,
    count: students.filter((s) => s.branch === branch).length,
  })).sort((a, b) => b.count - a.count);

  const yearCounts = ACADEMIC_YEARS.map((yr) => ({
    label: yr,
    count: students.filter((s) => s.year === yr).length,
  }));

  const categoryCounts = ARCHETYPES.map((arch) => ({
    label: arch.name,
    subtitle: arch.subtitle,
    color: arch.accentHex,
    count: students.filter((s) => s.primaryCategory === arch.id).length,
  })).sort((a, b) => b.count - a.count);

  const skillMap = new Map<string, number>();
  students.forEach((s) => {
    s.skills.forEach((sk) => {
      skillMap.set(sk, (skillMap.get(sk) || 0) + 1);
    });
  });
  const topSkills = Array.from(skillMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const totalParticipations = events.reduce((acc, ev) => acc + ev.attendeeUids.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
          Leaderboard & Aggregate Statistics
        </h1>
        <p className="text-sm text-zinc-600">
          Live aggregate distribution across KL University branches, years, archetypes, and active builds. Personal and gender data are never compared publicly.
        </p>
      </div>

      {/* Top Real Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs text-zinc-500">Active Members</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-zinc-950">{totalStudents}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs text-zinc-500">Active Projects</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#C8102E]">
            {projects.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs text-zinc-500">Public Startup Ideas</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-700">
            {ideas.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs text-zinc-500">Campus Participations</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-zinc-950">{totalParticipations}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Breakdown */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-zinc-950">Branch-wise Students</h2>
          <div className="space-y-3">
            {branchCounts.map((row) => {
              const pct = totalStudents > 0 ? Math.round((row.count / totalStudents) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800">{row.label}</span>
                    <span className="font-mono tabular-nums text-zinc-500">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-[#C8102E]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category-wise Distribution */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-zinc-950">Archetype Distribution</h2>
          <div className="space-y-3">
            {categoryCounts.map((row) => {
              const pct = totalStudents > 0 ? Math.round((row.count / totalStudents) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800">
                      {row.label} <span className="text-zinc-500">· {row.subtitle}</span>
                    </span>
                    <span className="font-mono tabular-nums text-zinc-500">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Year-wise Distribution */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-zinc-950">Year-wise Cohorts</h2>
          <div className="grid grid-cols-2 gap-4">
            {yearCounts.map((yr) => (
              <div key={yr.label} className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-4">
                <p className="text-xs text-zinc-500">{yr.label}</p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-950">
                  {yr.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Most Popular Skills */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-4 shadow-xs">
          <h2 className="font-display text-base font-semibold text-zinc-950">Most Popular Skills</h2>
          {topSkills.length === 0 ? (
            <p className="text-xs text-zinc-500">No skills recorded yet.</p>
          ) : (
            <div className="divide-y divide-zinc-200">
              {topSkills.map((item, idx) => (
                <div key={item.skill} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-800">
                    <span className="font-mono text-zinc-400 mr-2">0{idx + 1}.</span>
                    {item.skill}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-[#C8102E]">
                    {item.count} members
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
