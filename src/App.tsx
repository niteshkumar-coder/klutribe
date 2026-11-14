import { Component, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Code2,
  CreditCard,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { auth, googleProvider, prewarmGooglePopup, testFirestoreConnection } from './lib/firebase';
import {
  checkIsAdmin,
  subscribeCampusEvents,
  subscribeMyConnections,
  subscribeMyIdeas,
  subscribeMySubmittedOpportunities,
  subscribeOpportunities,
  subscribeProjects,
  subscribePublicIdeas,
  subscribePublicStudents,
  subscribeSkillExchanges,
} from './lib/kluService';
import {
  ADMIN_BOOTSTRAP_EMAIL,
  getArchetypeMeta,
  type CampusEvent,
  type Connection,
  type Opportunity,
  type ProjectTeam,
  type SkillExchange,
  type StartupIdea,
  type StudentPublic,
} from './types/klu';
import { LandingPage } from './components/LandingPage';
import { KluTribeLogo } from './components/KluTribeLogo';
import { PublicPassView } from './components/PublicPassView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardHome } from './components/DashboardHome';
import { TribePassCard } from './components/TribePassCard';
import { NetworkView } from './components/NetworkView';
import { IdeaBoardView } from './components/IdeaBoardView';
import { SkillExchangeView } from './components/SkillExchangeView';
import { ProjectsView } from './components/ProjectsView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { CampusView } from './components/CampusView';
import { LeaderboardView } from './components/LeaderboardView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboardView } from './components/AdminDashboardView';

type WorkspaceTab =
  | 'dashboard'
  | 'pass'
  | 'network'
  | 'ideas'
  | 'skills'
  | 'projects'
  | 'opportunities'
  | 'campus'
  | 'leaderboard'
  | 'settings'
  | 'admin';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F5F7] text-zinc-950 flex items-center justify-center p-6">
          <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-6 space-y-3 shadow-lg">
            <h1 className="font-display text-lg font-semibold text-zinc-950">Unable to complete operation</h1>
            <p className="text-xs text-zinc-600 break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [publicPassParam, setPublicPassParam] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('pass');
  });

  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCanRetry, setAuthErrorCanRetry] = useState(false);

  const [students, setStudents] = useState<StudentPublic[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [publicIdeas, setPublicIdeas] = useState<StartupIdea[]>([]);
  const [myPrivateIdeas, setMyPrivateIdeas] = useState<StartupIdea[]>([]);
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([]);
  const [projects, setProjects] = useState<ProjectTeam[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myOppSubmissions, setMyOppSubmissions] = useState<Opportunity[]>([]);
  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>([]);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [showLanding, setShowLanding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    testFirestoreConnection();
    prewarmGooglePopup();
    const unsubAuth = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const adminStatus = await checkIsAdmin(
          nextUser.uid,
          nextUser.email,
          nextUser.emailVerified
        );
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          setActiveTab((prev) => (prev === 'admin' ? 'dashboard' : prev));
        }
      } else {
        setIsAdmin(false);
        setActiveTab((prev) => (prev === 'admin' ? 'dashboard' : prev));
      }
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to workspace collections only after auth is ready & user signed in
  useEffect(() => {
    if (!authReady || !user) {
      setStudents([]);
      setStudentsLoaded(false);
      setConnections([]);
      setPublicIdeas([]);
      setMyPrivateIdeas([]);
      setSkillExchanges([]);
      setProjects([]);
      setOpportunities([]);
      setMyOppSubmissions([]);
      setCampusEvents([]);
      return;
    }

    const unsubStudents = subscribePublicStudents((rows) => {
      setStudents(rows);
      setStudentsLoaded(true);
    });
    const unsubConns = subscribeMyConnections(user.uid, setConnections);
    const unsubIdeas = subscribePublicIdeas(setPublicIdeas);
    const unsubMyIdeas = subscribeMyIdeas(user.uid, setMyPrivateIdeas);
    const unsubSkills = subscribeSkillExchanges(setSkillExchanges);
    const unsubProjects = subscribeProjects(setProjects);
    const unsubOpps = subscribeOpportunities(setOpportunities);
    const unsubMyOpps = subscribeMySubmittedOpportunities(user.uid, setMyOppSubmissions);
    const unsubEvents = subscribeCampusEvents(setCampusEvents);

    return () => {
      unsubStudents();
      unsubConns();
      unsubIdeas();
      unsubMyIdeas();
      unsubSkills();
      unsubProjects();
      unsubOpps();
      unsubMyOpps();
      unsubEvents();
    };
  }, [authReady, user]);

  const handleGoogleSignIn = async () => {
    if (signingIn) return;
    // Initiate popup synchronously on click to preserve strict browser user-gesture activation
    const popupPromise = signInWithPopup(auth, googleProvider);
    setSigningIn(true);
    setAuthError(null);
    setAuthErrorCanRetry(false);
    try {
      await popupPromise;
      setShowLanding(false);
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setAuthError(
          `Domain "${host}" is not authorized in Firebase Auth. Add "${host}" under Firebase Console → Authentication → Settings → Authorized domains.`
        );
        return;
      }
      if (code === 'auth/popup-blocked') {
        prewarmGooglePopup();
        setAuthErrorCanRetry(true);
        setAuthError(
          'Google Sign-In pop-up could not open. Allow pop-ups for this site and click Retry Sign-In.'
        );
        return;
      }
      setAuthError(err instanceof Error ? err.message : 'Unable to complete Google Sign-In.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
    setShowLanding(false);
  };

  if (publicPassParam) {
    return (
      <ErrorBoundary>
        <PublicPassView
          memberNumber={publicPassParam}
          onExit={() => {
            setPublicPassParam(null);
            window.history.replaceState({}, '', window.location.pathname);
          }}
        />
      </ErrorBoundary>
    );
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] text-zinc-600 flex items-center justify-center text-sm font-medium">
        Loading KLU TRIBE...
      </div>
    );
  }

  const me = user ? students.find((s) => s.uid === user.uid) || null : null;

  // Landing Page when logged out or explicitly visiting landing
  if (!user || showLanding) {
    return (
      <ErrorBoundary>
        {authError && (
          <div className="fixed bottom-4 right-4 z-50 flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-xs text-zinc-800 shadow-xl">
            <div className="flex-1 space-y-2">
              <p className="font-medium text-red-700 leading-relaxed">{authError}</p>
              {authErrorCanRetry && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8102E] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#A30D25] transition-colors disabled:opacity-60"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Sign-In
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setAuthErrorCanRetry(false);
              }}
              className="rounded-md p-0.5 text-zinc-400 hover:text-zinc-900"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <LandingPage
          isSignedIn={Boolean(user)}
          hasProfile={Boolean(me)}
          signingIn={signingIn}
          onPrimaryAction={() => {
            if (user) {
              setShowLanding(false);
            } else {
              handleGoogleSignIn();
            }
          }}
        />
      </ErrorBoundary>
    );
  }

  if (!studentsLoaded) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] text-zinc-600 flex items-center justify-center text-sm font-medium">
        Syncing your KLU TRIBE workspace...
      </div>
    );
  }

  // Onboarding when authenticated user doesn't have a student profile yet
  if (!me) {
    return (
      <ErrorBoundary>
        <OnboardingFlow
          uid={user.uid}
          email={user.email || ''}
          displayName={user.displayName || ''}
          onComplete={() => setActiveTab('pass')}
          onSignOut={handleSignOut}
        />
      </ErrorBoundary>
    );
  }

  if (me.isSuspended) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] text-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-6 space-y-4 shadow-lg">
          <h1 className="font-display text-xl font-bold text-[#C8102E]">Account Suspended</h1>
          <p className="text-sm text-zinc-600">
            This KLU TRIBE account has been suspended by campus moderators. Contact administration if you believe this is an error.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Merge public ideas and own private ideas without duplicates
  const mergedIdeas = [
    ...publicIdeas,
    ...myPrivateIdeas.filter((priv) => !publicIdeas.some((pub) => pub.id === priv.id)),
  ];

  const pendingIncoming = connections.filter((c) => c.status === 'pending' && c.toUid === me.uid);

  const navItems: { id: WorkspaceTab; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pass', label: 'My Tribe Pass', icon: CreditCard },
    { id: 'network', label: 'Tribe Network', icon: Users },
    { id: 'ideas', label: 'Idea Board', icon: Lightbulb },
    { id: 'skills', label: 'Skill Exchange', icon: ArrowLeftRight },
    { id: 'projects', label: 'Projects & Teams', icon: Code2 },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'campus', label: 'Campus Life', icon: Calendar },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isAuthorizedAdmin = Boolean(
    isAdmin &&
      user.emailVerified &&
      user.email?.trim().toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()
  );

  if (isAuthorizedAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: Shield });
  }

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F4F5F7] text-zinc-950 flex">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-zinc-800 bg-[#141416]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => setShowLanding(true)}
              className="inline-flex items-center hover:opacity-90 transition-opacity"
              aria-label="KLU TRIBE Home"
            >
              <KluTribeLogo variant="compact" surface="dark" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#D91B38] to-[#B91C1C] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.id === 'network' && pendingIncoming.length > 0 && (
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        active ? 'text-white' : 'text-[#F87171]'
                      }`}
                    >
                      {pendingIncoming.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-zinc-800 p-4 space-y-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{me.fullName}</p>
              <p className="font-mono text-[11px] text-zinc-400">#{me.memberNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowLanding(true)}
              className="w-full inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-white/10 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#F87171]" />
              Go To Home page
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 bg-[#141416] border-r border-zinc-800 flex flex-col justify-between p-4 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <KluTribeLogo variant="compact" surface="dark" />
                  <button type="button" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-zinc-400 hover:text-white" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium ${
                          activeTab === item.id
                            ? 'bg-gradient-to-r from-[#D91B38] to-[#B91C1C] text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLanding(true);
                  }}
                  className="w-full inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
                >
                  <Home className="w-3.5 h-3.5 text-[#F87171]" />
                  Go To Home page
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16 lg:pb-0 bg-[#F4F5F7]">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 hover:bg-zinc-50"
                  aria-label="Open menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <span className="text-xs text-zinc-500">
                  KLU TRIBE <span className="mx-1.5 text-zinc-300">/</span>{' '}
                  <span className="text-zinc-950 font-semibold">{activeNavLabel}</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 relative">
                <button
                  type="button"
                  onClick={() => setShowLanding(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-[#FAFAFA] px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
                >
                  <Home className="w-3.5 h-3.5 text-[#C8102E]" />
                  Go To Home page
                </button>

                <button
                  type="button"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative rounded-xl border border-zinc-200 bg-[#FAFAFA] p-2 text-zinc-600 hover:border-zinc-300 hover:text-zinc-950"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {pendingIncoming.length > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-[#C8102E] px-1.5 text-[10px] font-mono font-bold text-white">
                      {pendingIncoming.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pass')}
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-[#FAFAFA] px-3 py-1.5 text-xs font-medium text-zinc-800 hover:border-zinc-300 hover:bg-white whitespace-nowrap shrink-0"
                >
                  {me.fullName.split(' ')[0]} · #{me.memberNumber}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl z-40 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-zinc-950">Notifications</p>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="text-zinc-400 hover:text-zinc-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {pendingIncoming.length === 0 ? (
                      <p className="text-xs text-zinc-500">No pending connection requests.</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingIncoming.map((req) => (
                          <button
                            key={req.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('network');
                              setShowNotifications(false);
                            }}
                            className="w-full text-left rounded-xl border border-zinc-200 bg-[#FAFAFA] p-2.5 text-xs text-zinc-700 hover:border-[#C8102E]"
                          >
                            <span className="font-semibold text-zinc-950">{req.fromName}</span> sent a connection request.
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
            {activeTab === 'dashboard' && (
              <DashboardHome
                me={me}
                allStudents={students}
                connections={connections}
                events={campusEvents}
                onNavigate={(tab) => setActiveTab(tab as WorkspaceTab)}
              />
            )}

            {activeTab === 'pass' && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                    Your <span className="text-[#C8102E]">KLU TRIBE</span> Pass
                  </h1>
                  <p className="text-sm text-zinc-600 mt-1">
                    Your official student identity on the KLU TRIBE platform. QR verification encodes only your safe public identifier.
                  </p>
                </div>
                <TribePassCard
                  student={me}
                  onEditClick={() => setActiveTab('settings')}
                />
                <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-2 shadow-xs">
                  <p className="text-xs text-zinc-500">Selected Archetype & Secondary Interests</p>
                  <p
                    className="font-display text-base font-semibold"
                    style={{ color: getArchetypeMeta(me.primaryCategory).accentHex }}
                  >
                    {getArchetypeMeta(me.primaryCategory).name}
                  </p>
                  {me.secondaryInterests.length > 0 && (
                    <p className="text-xs text-zinc-600">
                      Secondary Interests: {me.secondaryInterests.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'network' && (
              <NetworkView me={me} students={students} connections={connections} />
            )}

            {activeTab === 'ideas' && (
              <IdeaBoardView
                me={me}
                ideas={mergedIdeas}
                students={students}
                connections={connections}
              />
            )}

            {activeTab === 'skills' && (
              <SkillExchangeView
                me={me}
                exchanges={skillExchanges}
                students={students}
                connections={connections}
              />
            )}

            {activeTab === 'projects' && <ProjectsView me={me} projects={projects} />}

            {activeTab === 'opportunities' && (
              <OpportunitiesView
                me={me}
                isAdmin={isAuthorizedAdmin}
                opportunities={opportunities}
                mySubmissions={myOppSubmissions}
              />
            )}

            {activeTab === 'campus' && <CampusView me={me} events={campusEvents} />}

            {activeTab === 'leaderboard' && (
              <LeaderboardView
                students={students}
                ideas={publicIdeas}
                projects={projects}
                events={campusEvents}
              />
            )}

            {activeTab === 'settings' && <SettingsView me={me} />}

            {activeTab === 'admin' && isAuthorizedAdmin && (
              <AdminDashboardView
                adminUid={user.uid}
                adminEmail={user.email || ''}
                ideas={mergedIdeas}
                onGoHome={() => setShowLanding(true)}
              />
            )}
          </main>
        </div>

        {/* Compact Mobile Bottom Nav (4 core items, <= 15% viewport height) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden grid grid-cols-4 border-t border-zinc-200 bg-white/95 backdrop-blur-sm">
          {[
            { id: 'dashboard' as WorkspaceTab, label: 'Home', icon: Home },
            { id: 'pass' as WorkspaceTab, label: 'Pass', icon: CreditCard },
            { id: 'network' as WorkspaceTab, label: 'Tribe', icon: Users },
            { id: 'ideas' as WorkspaceTab, label: 'Ideas', icon: Lightbulb },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
                  active ? 'text-[#C8102E]' : 'text-zinc-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </ErrorBoundary>
  );
}
