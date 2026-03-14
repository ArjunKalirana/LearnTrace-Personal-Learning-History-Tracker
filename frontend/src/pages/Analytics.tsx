import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { analyticsAPI } from '../utils/api';
import { LayoutGrid, PieChart as PieIcon, TrendingUp, Cpu, Award } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900">{payload[0].value} Entries</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    domains: [] as any[],
    trend: [] as any[],
    platforms: [] as any[],
    skills: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [domains, trend, platforms, skills] = await Promise.all([
        analyticsAPI.getDomainDistribution(),
        analyticsAPI.getYearlyTrend(),
        analyticsAPI.getPlatformUsage(),
        analyticsAPI.getSkillsFrequency(),
      ]);

      setAnalyticsData({
        domains: Object.entries(domains).map(([name, value]) => ({ name, value })),
        trend: Object.entries(trend).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({ name, value })),
        platforms: Object.entries(platforms).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, value]) => ({ name, value })),
        skills: Object.entries(skills).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, value]) => ({ name, value })),
      });
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse pb-20">
             <div className="h-20 bg-gray-50 rounded-2xl w-1/3" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-80 bg-gray-50 rounded-2xl" />
                <div className="h-80 bg-gray-50 rounded-2xl" />
             </div>
             <div className="h-96 bg-gray-50 rounded-2xl" />
        </div>
    );
  }

  const isEmpty = analyticsData.domains.length === 0;

  if (isEmpty) {
    return (
        <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-6">
                <LayoutGrid className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">No data points yet</h1>
            <p className="text-gray-500 max-w-sm mx-auto">Start logging your learning milestones to see insights and patterns in your growth.</p>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-gray-500 mt-2 font-medium">Deep insights into your learning velocity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Domain Mix */}
        <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-900">Domain Distribution</h2>
                    <p className="text-xs text-gray-500 font-medium">Topic-wise breakout of activities</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <PieIcon className="h-5 w-5" />
                </div>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={analyticsData.domains}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {analyticsData.domains.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                {analyticsData.domains.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d.name}</span>
                    </div>
                ))}
            </div>
        </section>

        {/* Platform Split */}
        <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-900">Platform Usage</h2>
                    <p className="text-xs text-gray-500 font-medium">Where you spend your time</p>
                </div>
                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <Award className="h-5 w-5" />
                </div>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.platforms} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#6b7280' }} width={80} />
                        <Tooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* Learning Trend */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-gray-900">Learning Velocity</h2>
                    <p className="text-xs text-gray-500 font-medium">Milestones completed over time</p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.trend}>
                        <defs>
                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* Top Skills */}
        <section className="lg:col-span-2 bg-gray-900 rounded-3xl p-10 text-white shadow-xl shadow-gray-200">
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold">Skill Frequency</h2>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Most frequently tagged competencies</p>
                </div>
                <Cpu className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.skills}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
      </div>
    </div>
  );
}
