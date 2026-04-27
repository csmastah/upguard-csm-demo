import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  BookOpen,
  RefreshCcw,
  BarChart3,
  Settings,
  Search,
  X,
  MoreVertical,
  Lightbulb,
  ArrowUpRight,
  Layers,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Send,
  Copy,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ACCOUNTS } from './mockData';
import { Account, Theme, HealthGrade, AccountStage } from './types';

type View = 'portfolio' | 'playbooks' | 'renewals' | 'health' | 'settings';

const PLAYBOOKS = [
  {
    id: 'p1',
    name: 'Churn Rescue',
    icon: AlertTriangle,
    color: 'text-error border-error/30 bg-error/5',
    description: 'Emergency intervention for Churn Risk accounts. Triggers exec escalation, champion mapping, and ROI report generation.',
    steps: ['Identify champion replacement', 'Send ROI impact report', 'Book exec alignment call', 'Offer contract extension'],
    accounts: MOCK_ACCOUNTS.filter(a => a.stage === 'Churn Risk').length,
  },
  {
    id: 'p2',
    name: 'Onboarding Accelerator',
    icon: Zap,
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    description: 'Drives new accounts to first value within 30 days. Automated check-ins, implementation milestones, and adoption targets.',
    steps: ['Week 1: Platform walkthrough', 'Week 2: First vendor monitored', 'Week 3: Questionnaire sent', 'Week 4: Health review'],
    accounts: MOCK_ACCOUNTS.filter(a => a.stage === 'Onboarding').length,
  },
  {
    id: 'p3',
    name: 'Expansion Trigger',
    icon: TrendingUp,
    color: 'text-success border-success/30 bg-success/5',
    description: 'Converts healthy adopted accounts into expansion revenue. Identifies module gaps and times upsell conversations.',
    steps: ['Audit unused modules', 'Build expansion business case', 'Schedule expansion QBR', 'Send proposal'],
    accounts: MOCK_ACCOUNTS.filter(a => a.stage === 'Expanding' || (a.grade === 'A' && a.stage === 'Adopted')).length,
  },
  {
    id: 'p4',
    name: 'Renewal Motion',
    icon: Clock,
    color: 'text-warning border-warning/30 bg-warning/5',
    description: 'Initiates renewal conversations 90 days out. Multi-year proposal generation, health summary, and exec briefing.',
    steps: ['90d: Send renewal brief', '60d: Health summary to champion', '30d: Exec proposal delivered', '7d: Final negotiation'],
    accounts: MOCK_ACCOUNTS.filter(a => a.renewalDays <= 90).length,
  },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeView, setActiveView] = useState<View>('portfolio');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = MOCK_ACCOUNTS.find(a => a.id === selectedAccountId);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('Portfolio synced — all 18 accounts updated');
    }, 2000);
  };

  const handleViewProfile = (account: Account) => {
    window.open(`https://www.upguard.com`, '_blank');
    showToast(`Opening UpGuard profile for ${account.name}`);
  };

  const handleDropdownAction = (action: string) => {
    setShowDropdown(false);
    showToast(action);
  };

  // Compute portfolio stats from actual data
  const activeAccounts = MOCK_ACCOUNTS.filter(a => a.nrr > 0);
  const portfolioNRR = Math.round(activeAccounts.reduce((sum, a) => sum + a.nrr, 0) / activeAccounts.length);
  const portfolioGRR = 96;
  const atRiskCount = MOCK_ACCOUNTS.filter(a => a.stage === 'Churn Risk' || a.stage === 'At Risk').length;
  const renewalSoonARR = MOCK_ACCOUNTS.filter(a => a.renewalDays <= 30).reduce((s, a) => s + a.arr, 0);

  const getGradeColor = (grade: HealthGrade) => {
    switch (grade) {
      case 'A': return 'text-success border-success/30 bg-success/10';
      case 'B': return 'text-primary border-primary/30 bg-primary/10';
      case 'C': return 'text-warning border-warning/30 bg-warning/10';
      case 'D': return 'text-error border-error/30 bg-error/10';
      case 'F': return 'text-error border-error/50 bg-error/20';
    }
  };

  const getStageColor = (stage: AccountStage) => {
    switch (stage) {
      case 'Churn Risk':  return 'text-error bg-error/10 border-error/30';
      case 'At Risk':     return 'text-warning bg-warning/10 border-warning/30';
      case 'Renewal Due': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'Onboarding':  return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'Expanding':   return 'text-success bg-success/10 border-success/30';
      case 'Adopted':     return 'text-primary bg-primary/10 border-primary/30';
    }
  };

  const FILTER_OPTIONS = ['All', 'Churn Risk', 'At Risk', 'Renewal Due', 'Onboarding', 'Expanding', 'Adopted'];

  const filteredAccounts = MOCK_ACCOUNTS
    .filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'All' || a.stage === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => a.healthScore - b.healthScore);

  const renewalAccounts = [...MOCK_ACCOUNTS]
    .filter(a => a.renewalDays <= 90)
    .sort((a, b) => a.renewalDays - b.renewalDays);

  const navItems: { id: View; icon: any; label: string }[] = [
    { id: 'portfolio', icon: LayoutGrid, label: 'Portfolio' },
    { id: 'playbooks', icon: BookOpen, label: 'Playbooks' },
    { id: 'renewals', icon: RefreshCcw, label: 'Renewals' },
    { id: 'health', icon: BarChart3, label: 'Health Analysis' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface)] text-[var(--text-primary)]">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 border border-outline text-white text-xs font-semibold px-5 py-3 rounded-full shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 border-r border-outline flex flex-col p-6 z-30 bg-[var(--surface)]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-slate-900">U</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">UpGuard CSM</h1>
            <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">APAC Region</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.slice(0, 4).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeView === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-outline hover:text-white hover:bg-outline/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-primary' : 'text-outline group-hover:text-white'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {activeView === item.id && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />}
            </button>
          ))}
          <div className="py-4 border-t border-outline mt-4">
            <button
              onClick={() => setActiveView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeView === 'settings'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-outline hover:text-white hover:bg-outline/5'
              }`}
            >
              <Settings className={`w-5 h-5 ${activeView === 'settings' ? 'text-primary' : 'text-outline group-hover:text-white'}`} />
              <span className="font-medium text-sm">Settings</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 tonal-elevation-1 rounded-xl border border-outline">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Theme</p>
            <button
              onClick={() => setTheme(prev => prev === 'upguard' ? 'dark' : 'upguard')}
              className="w-full py-2 px-4 rounded border border-outline hover:border-primary hover:text-primary text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Switch to {theme === 'upguard' ? 'Original' : 'UpGuard'}
            </button>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-sm">
              AA
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">APAC Regional Lead</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[var(--surface-main,var(--surface))]">

        {/* Header */}
        <header className="h-16 border-b border-outline flex items-center justify-between px-8 bg-[var(--surface)]">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium capitalize">
              {activeView === 'portfolio' ? 'Portfolio Overview' :
               activeView === 'playbooks' ? 'Playbooks' :
               activeView === 'renewals' ? 'Upcoming Renewals' :
               activeView === 'health' ? 'Health Analysis' : 'Settings'}
            </h2>
          </div>
          {activeView === 'portfolio' && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 w-4 h-4 text-[var(--text-secondary)] -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name, region, industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-dim)] border border-outline rounded px-3 py-1.5 pl-10 text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </header>

        {/* Views */}
        <div className="flex-1 overflow-y-auto p-6 thin-scrollbar space-y-6">

          {/* PORTFOLIO VIEW */}
          {activeView === 'portfolio' && (
            <>
              <div className="grid grid-cols-4 gap-6">
                <StatCard label="Portfolio NRR" value={`${portfolioNRR}%`} sub="+3.2% vs last quarter" trend="up" />
                <StatCard label="Portfolio GRR" value={`${portfolioGRR}%`} sub="Stable" trend="neutral" />
                <StatCard label="Accounts at Risk" value={String(atRiskCount)} sub={`${atRiskCount} need intervention`} trend="down" />
                <StatCard label="Renewals (30d)" value={`$${(renewalSoonARR / 1000000).toFixed(1)}M`} sub="ARR at stake" trend="warn" />
              </div>

              {/* Stage Filters */}
              <div className="flex gap-2 flex-wrap">
                {FILTER_OPTIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => setStageFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border tracking-tight transition-all ${
                      stageFilter === f
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'border-outline/30 text-[var(--text-secondary)] hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {f}
                    {f !== 'All' && (
                      <span className="ml-1.5 opacity-60">
                        {MOCK_ACCOUNTS.filter(a => a.stage === f).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="tonal-elevation-1 rounded-xl overflow-hidden border border-outline">
                <div className="px-6 py-4 border-b border-outline flex justify-between items-center bg-[var(--surface-dim)]">
                  <h3 className="font-semibold text-sm">Account Portfolio</h3>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                    {filteredAccounts.length} accounts · sorted by health ↑
                  </span>
                </div>
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-900/10 text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest border-b border-outline">
                    <tr>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-4 py-3">Industry</th>
                      <th className="px-4 py-3 text-center">Score</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3 text-right">ARR</th>
                      <th className="px-4 py-3 text-right">NRR</th>
                      <th className="px-4 py-3 text-right">Renewal</th>
                      <th className="px-4 py-3 text-right">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline">
                    {filteredAccounts.map(account => (
                      <tr
                        key={account.id}
                        onClick={() => setSelectedAccountId(account.id)}
                        className={`hover:bg-primary/5 cursor-pointer transition-colors group ${selectedAccountId === account.id ? 'bg-primary/10' : ''}`}
                      >
                        <td className="px-6 py-4 font-medium group-hover:text-primary">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold border ${getGradeColor(account.grade)}`}>
                              {account.grade}
                            </div>
                            <div>
                              {account.name}
                              <p className="text-[10px] text-[var(--text-secondary)]">{account.region}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[var(--text-secondary)] text-xs">{account.industry}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-bold text-sm ${account.healthScore > 80 ? 'text-success' : account.healthScore > 60 ? 'text-warning' : 'text-error'}`}>
                            {account.healthScore}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${getStageColor(account.stage)}`}>
                            {account.stage}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-xs opacity-80">${(account.arr / 1000000).toFixed(1)}M</td>
                        <td className="px-4 py-4 text-right font-mono text-xs">
                          {account.nrr === 0
                            ? <span className="text-[var(--text-secondary)]">—</span>
                            : <span className={account.nrr < 95 ? 'text-error' : account.nrr >= 110 ? 'text-success' : 'text-primary'}>{account.nrr}%</span>
                          }
                        </td>
                        <td className="px-4 py-4 text-right text-xs">
                          <span className={account.renewalDays <= 30 ? 'text-error font-bold' : account.renewalDays <= 90 ? 'text-warning' : 'text-[var(--text-secondary)]'}>
                            {account.renewalDays}d
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-[var(--text-secondary)] text-xs">{account.lastActivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-outline text-center bg-[var(--surface-dim)]">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {filteredAccounts.length} of {MOCK_ACCOUNTS.length} accounts shown
                  </p>
                </div>
              </div>
            </>
          )}

          {/* PLAYBOOKS VIEW */}
          {activeView === 'playbooks' && (
            <div className="grid grid-cols-2 gap-6">
              {PLAYBOOKS.map(pb => (
                <div key={pb.id} className={`tonal-elevation-1 rounded-xl border p-6 ${pb.color}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <pb.icon className="w-6 h-6" />
                      <div>
                        <h3 className="font-bold text-base">{pb.name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{pb.accounts} accounts eligible</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">{pb.description}</p>
                  <div className="space-y-2 mb-5">
                    {pb.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-current opacity-40 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                        <p className="text-xs">{step}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => showToast(`${pb.name} playbook queued for ${pb.accounts} accounts`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-current opacity-80 hover:opacity-100 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Run Playbook
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* RENEWALS VIEW */}
          {activeView === 'renewals' && (
            <>
              <div className="grid grid-cols-3 gap-6">
                <StatCard label="Due in 30 Days" value={String(MOCK_ACCOUNTS.filter(a => a.renewalDays <= 30).length)} sub={`$${(MOCK_ACCOUNTS.filter(a => a.renewalDays <= 30).reduce((s,a) => s+a.arr,0)/1000000).toFixed(1)}M ARR`} trend="down" />
                <StatCard label="Due in 60 Days" value={String(MOCK_ACCOUNTS.filter(a => a.renewalDays <= 60).length)} sub={`$${(MOCK_ACCOUNTS.filter(a => a.renewalDays <= 60).reduce((s,a) => s+a.arr,0)/1000000).toFixed(1)}M ARR`} trend="warn" />
                <StatCard label="Due in 90 Days" value={String(renewalAccounts.length)} sub={`$${(renewalAccounts.reduce((s,a) => s+a.arr,0)/1000000).toFixed(1)}M ARR`} trend="neutral" />
              </div>
              <div className="tonal-elevation-1 rounded-xl overflow-hidden border border-outline">
                <div className="px-6 py-4 border-b border-outline bg-[var(--surface-dim)]">
                  <h3 className="font-semibold text-sm">Renewals Due Within 90 Days</h3>
                </div>
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="text-[var(--text-secondary)] text-[10px] uppercase font-bold tracking-widest border-b border-outline bg-slate-900/10">
                    <tr>
                      <th className="px-6 py-3">Company</th>
                      <th className="px-4 py-3 text-center">Health</th>
                      <th className="px-4 py-3">Stage</th>
                      <th className="px-4 py-3 text-right">ARR</th>
                      <th className="px-4 py-3 text-right">Days Left</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline">
                    {renewalAccounts.map(account => (
                      <tr key={account.id} onClick={() => { setActiveView('portfolio'); setSelectedAccountId(account.id); }} className="hover:bg-primary/5 cursor-pointer transition-colors">
                        <td className="px-6 py-4 font-medium">
                          <div>
                            {account.name}
                            <p className="text-[10px] text-[var(--text-secondary)]">{account.region}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-bold ${account.healthScore > 80 ? 'text-success' : account.healthScore > 60 ? 'text-warning' : 'text-error'}`}>
                            {account.grade} · {account.healthScore}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${getStageColor(account.stage)}`}>{account.stage}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-xs">${(account.arr / 1000000).toFixed(1)}M</td>
                        <td className="px-4 py-4 text-right">
                          <span className={`font-bold text-sm ${account.renewalDays <= 30 ? 'text-error' : 'text-warning'}`}>{account.renewalDays}d</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); showToast(`Renewal motion initiated for ${account.name}`); }}
                            className="text-[10px] font-bold text-primary border border-primary/30 px-3 py-1.5 rounded hover:bg-primary/10 transition-all uppercase tracking-wide"
                          >
                            Initiate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* HEALTH ANALYSIS VIEW */}
          {activeView === 'health' && (
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-4">
                {(['A','B','C','D','F'] as HealthGrade[]).map(grade => {
                  const count = MOCK_ACCOUNTS.filter(a => a.grade === grade).length;
                  const pct = Math.round(count / MOCK_ACCOUNTS.length * 100);
                  return (
                    <div key={grade} className={`tonal-elevation-1 p-6 rounded-xl border text-center ${getGradeColor(grade)}`}>
                      <p className="text-4xl font-bold mb-1">{grade}</p>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{pct}% of portfolio</p>
                      <button
                        onClick={() => { setActiveView('portfolio'); setStageFilter('All'); setSearchQuery(''); }}
                        className="mt-3 text-[10px] font-bold underline opacity-60 hover:opacity-100"
                      >
                        View accounts →
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="tonal-elevation-1 rounded-xl border border-outline p-6">
                <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-[var(--text-secondary)]">UpGuard Module Adoption Across Portfolio</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Vendor Risk', count: MOCK_ACCOUNTS.filter(a => a.metrics.vendorRisk).length },
                    { label: 'Breach Risk', count: MOCK_ACCOUNTS.filter(a => a.metrics.breachRisk).length },
                    { label: 'Risk Automations', count: MOCK_ACCOUNTS.filter(a => a.metrics.riskAutomations).length },
                    { label: 'Questionnaires Active', count: MOCK_ACCOUNTS.filter(a => a.metrics.questionnaires > 0).length },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-4">
                      <span className="text-xs font-semibold w-48 text-[var(--text-secondary)]">{m.label}</span>
                      <div className="flex-1 h-2 bg-outline/10 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round(m.count / MOCK_ACCOUNTS.length * 100)}%` }} />
                      </div>
                      <span className="text-xs font-mono font-bold w-16 text-right">{m.count}/{MOCK_ACCOUNTS.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeView === 'settings' && (
            <div className="max-w-lg space-y-6">
              <div className="tonal-elevation-1 rounded-xl border border-outline p-6">
                <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-[var(--text-secondary)]">Account</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-outline">
                    <p className="text-sm">Name</p><p className="text-sm text-[var(--text-secondary)]">APAC Regional Lead</p>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-outline">
                    <p className="text-sm">Region</p><p className="text-sm text-[var(--text-secondary)]">Asia Pacific</p>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <p className="text-sm">Accounts managed</p><p className="text-sm text-[var(--text-secondary)]">{MOCK_ACCOUNTS.length}</p>
                  </div>
                </div>
              </div>
              <div className="tonal-elevation-1 rounded-xl border border-outline p-6">
                <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-[var(--text-secondary)]">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Theme</p>
                    <button
                      onClick={() => setTheme(prev => prev === 'upguard' ? 'dark' : 'upguard')}
                      className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded hover:bg-primary/10 transition-all"
                    >
                      {theme === 'upguard' ? 'Switch to Original' : 'Switch to UpGuard'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm">Default sort</p>
                    <p className="text-xs text-[var(--text-secondary)]">Health score ascending</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => showToast('Settings saved')}
                className="w-full py-3 bg-primary text-slate-900 font-bold rounded-lg hover:opacity-90 transition-all text-xs uppercase tracking-widest"
              >
                Save Settings
              </button>
            </div>
          )}
        </div>

        {/* FAB — Sync */}
        <button
          onClick={handleSync}
          className={`absolute bottom-6 right-6 flex items-center gap-2 px-4 h-12 bg-primary text-slate-900 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)] font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all z-20 ${syncing ? 'opacity-70 cursor-wait' : ''}`}
        >
          <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
      </main>

      {/* Account Detail Drawer */}
      <AnimatePresence>
        {selectedAccountId && selectedAccount && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAccountId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-screen w-[500px] bg-[var(--surface)] border-l border-outline shadow-2xl z-[50] flex flex-col"
            >
              <div className="p-8 border-b border-outline flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl font-bold ${getGradeColor(selectedAccount.grade)} border-2`}>
                    {selectedAccount.grade}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{selectedAccount.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest">{selectedAccount.region} · {selectedAccount.industry}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide mt-1 inline-block ${getStageColor(selectedAccount.stage)}`}>
                      {selectedAccount.stage}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedAccountId(null)} className="p-2 hover:bg-outline rounded-full transition-colors">
                  <X className="w-6 h-6 text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 thin-scrollbar space-y-8">

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="tonal-elevation-1 p-4 rounded-xl text-center border border-outline">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">ARR</p>
                    <p className="text-xl font-bold">${(selectedAccount.arr / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="tonal-elevation-1 p-4 rounded-xl text-center border border-outline">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">NRR</p>
                    <p className={`text-xl font-bold ${selectedAccount.nrr === 0 ? 'text-[var(--text-secondary)]' : selectedAccount.nrr < 95 ? 'text-error' : 'text-success'}`}>
                      {selectedAccount.nrr === 0 ? '—' : `${selectedAccount.nrr}%`}
                    </p>
                  </div>
                  <div className="tonal-elevation-1 p-4 rounded-xl text-center border border-outline">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Renewal</p>
                    <p className={`text-xl font-bold ${selectedAccount.renewalDays <= 30 ? 'text-error' : selectedAccount.renewalDays <= 90 ? 'text-warning' : ''}`}>
                      {selectedAccount.renewalDays}d
                    </p>
                  </div>
                </div>

                {/* AI Intervention */}
                <div className="tonal-elevation-1 p-6 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Recommended Action</h4>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">{selectedAccount.intervention}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast(`Playbook sent to ${selectedAccount.name}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-primary/30 text-primary rounded text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all"
                    >
                      <Send className="w-3 h-3" /> Send Playbook
                    </button>
                    <button
                      onClick={() => showToast(`Meeting scheduled with ${selectedAccount.name}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-outline text-[var(--text-secondary)] rounded text-[10px] font-bold uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
                    >
                      <Phone className="w-3 h-3" /> Schedule Call
                    </button>
                  </div>
                </div>

                {/* Health Breakdown */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-4">Health Breakdown</h4>
                  <div className="space-y-4">
                    <HealthBar label="Login Frequency" value={selectedAccount.metrics.loginFrequency} />
                    <HealthBar label="Feature Adoption" value={selectedAccount.metrics.featureAdoption} />
                    <HealthBar label="CSM Engagement" value={selectedAccount.metrics.csmEngagement} />
                  </div>
                </div>

                {/* UpGuard Module Adoption */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-4">UpGuard Module Adoption</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FeatureFlag label="Vendor Risk" active={selectedAccount.metrics.vendorRisk} />
                    <FeatureFlag label="Breach Risk" active={selectedAccount.metrics.breachRisk} />
                    <FeatureFlag label="Risk Automations" active={selectedAccount.metrics.riskAutomations} />
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-outline">
                      <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                      <div>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Questionnaires</p>
                        <p className="text-sm font-bold">{selectedAccount.metrics.questionnaires} sent</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* News & Triggers */}
                {selectedAccount.news.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-4">News & Triggers</h4>
                    <div className="space-y-3">
                      {selectedAccount.news.map(n => (
                        <div key={n.id} className={`p-4 rounded-lg border ${n.variant === 'error' ? 'border-error/30 bg-error/5' : n.variant === 'success' ? 'border-success/30 bg-success/5' : n.variant === 'warning' ? 'border-warning/30 bg-warning/5' : 'border-primary/30 bg-primary/5'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold uppercase tracking-wide">{n.title}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] font-mono ml-4 shrink-0">{n.time}</p>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{n.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 bg-[var(--surface-dim)] border-t border-outline flex gap-3">
                <button
                  onClick={() => handleViewProfile(selectedAccount)}
                  className="flex-1 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                  View Security Profile <ArrowUpRight className="w-4 h-4" />
                </button>

                {/* More Actions Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(prev => !prev)}
                    className="p-3 border border-outline rounded-lg hover:border-primary/40 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-14 right-0 w-48 bg-[var(--surface)] border border-outline rounded-xl shadow-2xl overflow-hidden z-10"
                      >
                        {[
                          { icon: Send, label: 'Send Playbook' },
                          { icon: Phone, label: 'Schedule Call' },
                          { icon: Copy, label: 'Copy Account Link' },
                        ].map(action => (
                          <button
                            key={action.label}
                            onClick={() => handleDropdownAction(`${action.label} — ${selectedAccount.name}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 hover:text-primary text-sm transition-colors text-left"
                          >
                            <action.icon className="w-4 h-4" />
                            {action.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, sub, trend }: { label: string, value: string, sub: string, trend: 'up' | 'down' | 'neutral' | 'warn' }) {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : trend === 'warn' ? 'text-warning' : 'text-[var(--text-secondary)]';
  return (
    <div className="tonal-elevation-1 p-6 rounded-xl border border-outline hover:border-primary/40 transition-all">
      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">{label}</p>
      <h3 className="text-3xl font-bold tracking-tighter mb-2">{value}</h3>
      <p className={`text-[10px] font-bold ${trendColor}`}>{sub}</p>
    </div>
  );
}

function HealthBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-outline font-semibold w-36">{label}</span>
      <div className="flex-1 h-1.5 bg-outline/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${value > 70 ? 'bg-success' : value > 40 ? 'bg-primary' : 'bg-error'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold w-10 text-right ${value < 40 ? 'text-error' : ''}`}>{value}%</span>
    </div>
  );
}

function FeatureFlag({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${active ? 'border-success/30 bg-success/5' : 'border-outline/30'}`}>
      {active ? <CheckCircle className="w-4 h-4 text-success shrink-0" /> : <XCircle className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />}
      <p className={`text-xs font-bold ${active ? 'text-success' : 'text-[var(--text-secondary)]'}`}>{label}</p>
    </div>
  );
}
