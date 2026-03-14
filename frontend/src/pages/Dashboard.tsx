import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Flame, Plus, ArrowUpRight, Calendar, Layers } from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { DashboardSummary, LearningEntry } from '../types';
import { format } from 'date-fns';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await analyticsAPI.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse pt-10">
        <div className="flex justify-between items-end">
            <div className="space-y-4">
                <div className="h-10 bg-gray-50 rounded-xl w-48" />
                <div className="h-4 bg-gray-50 rounded-lg w-64" />
            </div>
            <div className="h-12 bg-gray-50 rounded-2xl w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-[32px]" />)}
        </div>
        <div className="h-96 bg-gray-50 rounded-[32px]" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium">
          Unable to establish connection to the analytics engine.
        </div>
        <button
          onClick={loadSummary}
          className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
        >
          Reconnect
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Milestones',
      value: summary.totalEntries,
      icon: BookOpen,
      trend: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Observed Hours',
      value: summary.totalHours,
      icon: Clock,
      trend: '+5%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Active Streak',
      value: `${summary.streak} Days`,
      icon: Flame,
      trend: 'Peak',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Skill Domains',
      value: summary.uniqueSkills,
      icon: Layers,
      trend: 'Stable',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Track your growth and learning velocity.</p>
        </div>
        <Link
          to="/entries/new"
          className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="font-bold">Log Activity</span>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-6">
                <div className={`${stat.bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold text-gray-900">Recent Milestones</h2>
                    <Link to="/timeline" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        View All <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>
                
                {summary.recentEntries.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-[28px] border border-dashed border-gray-200">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm">
                        <BookOpen size={32} />
                    </div>
                    <p className="text-gray-900 font-bold">Your journey starts here.</p>
                    <p className="text-gray-400 text-sm mt-1 mb-8">No entries found in your history.</p>
                    <Link
                      to="/entries/new"
                      className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create first entry
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {summary.recentEntries.map((entry: LearningEntry) => (
                      <Link
                        key={entry.id}
                        to={`/entries/${entry.id}`}
                        className="group flex items-center justify-between p-6 bg-white border border-gray-50 rounded-[28px] hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-md">
                                {entry.domain}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(entry.completionDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{entry.title}</h3>
                          <p className="text-sm text-gray-500 font-medium line-clamp-1 mt-1">{entry.platform}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-8">
            <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Flame size={120} />
                </div>
                <div className="relative">
                    <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2">Knowledge Streak</h3>
                    <p className="text-4xl font-bold mb-4">{summary.streak} Days</p>
                    <p className="text-xs text-gray-400 leading-relaxed">You're in the top 5% of active learners this month. Keep the momentum going!</p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Learning Distribution</h3>
                <div className="space-y-6">
                    {/* Placeholder for a mini-chart or list */}
                    {summary.recentEntries.length > 0 ? (
                        <div className="space-y-4">
                            {Array.from(new Set(summary.recentEntries.map(e => e.domain))).slice(0, 3).map(domain => (
                                <div key={domain}>
                                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                                        <span>{domain}</span>
                                        <span className="text-gray-400">Primary</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No domain usage data available yet.</p>
                    )}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
