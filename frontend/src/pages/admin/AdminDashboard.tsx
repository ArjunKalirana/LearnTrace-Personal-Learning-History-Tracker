import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../utils/api';
import type { CollegeOverview } from '../../types';
import { Users, BookOpen, GraduationCap, Building2, ArrowRight, Clock, Loader2, Network } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<CollegeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminAPI.getOverview();
        setOverview(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load college overview');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-md">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Neural-Architect Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-[#13151a] to-blue-950 p-10 lg:p-14 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Abstract Photographic Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-screen"></div>
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <Network className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Neural Command Center</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-blue-100/70 font-medium max-w-2xl text-lg leading-relaxed backdrop-blur-sm">
            {overview?.collegeName} — Monitor live student telemetry, visualize domain clusters, and audit learning trajectories across your network.
          </p>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={<Users className="h-6 w-6" />} label="Active Nodes" value={overview?.totalStudents || 0}
          gradient="from-blue-500 to-cyan-400" />
        <StatCard icon={<Building2 className="h-6 w-6" />} label="Network Sectors" value={overview?.totalClasses || 0}
          gradient="from-purple-500 to-pink-500" />
        <StatCard icon={<BookOpen className="h-6 w-6" />} label="Data Logs" value={overview?.totalEntries || 0}
          gradient="from-emerald-400 to-teal-500" />
      </div>

      {/* Classes & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Sectors (Classes) List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">Active Sectors</h2>
            <div className="bg-[#1a1b24] border border-white/10 px-4 py-1.5 rounded-full">
              <span className="text-xs font-bold text-gray-400 tracking-wider">NETWORK STATUS: <span className="text-emerald-400">ONLINE</span></span>
            </div>
          </div>

          {overview?.classes && overview.classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {overview.classes.map((cls) => (
                <Link
                  key={cls.className}
                  to={`/admin/classroom/${encodeURIComponent(cls.className!)}`}
                  className="group relative overflow-hidden bg-[#1a1b24] border border-white/5 hover:border-blue-500/50 rounded-[2rem] p-6 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Network className="h-24 w-24 text-blue-500 -translate-y-1/4 translate-x-1/4" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between mb-8">
                      <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                        <GraduationCap className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="p-2 bg-white/5 rounded-full group-hover:bg-blue-500 group-hover:text-white text-gray-500 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">{cls.className}</h3>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                          {cls.studentCount} Nodes
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1b24] rounded-[2rem] p-16 text-center border border-white/5">
              <Network className="h-16 w-16 text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 font-bold text-lg">No active network sectors initialized.</p>
            </div>
          )}
        </div>

        {/* Incoming Telemetry */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white tracking-tight">Recent Connections</h2>
          <div className="bg-[#1a1b24] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
            
            {overview?.recentStudents && overview.recentStudents.length > 0 ? (
              <div className="flex flex-col gap-4 relative z-10">
                {overview.recentStudents.map((student) => (
                  <div key={student.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-white font-black shadow-inner">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-md">
                          {student.className || 'UNASSIGNED'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-black tracking-wider">
                          #{student.rollNumber || '???'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center relative z-10">
                <p className="text-gray-500 font-bold">No incoming telemetry detected.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient }: {
  icon: React.ReactNode; label: string; value: number; gradient: string;
}) {
  return (
    <div className="relative overflow-hidden bg-[#1a1b24] border border-white/10 rounded-[2rem] p-8 group hover:-translate-y-1 transition-all duration-300 shadow-xl">
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className={`h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-4xl font-black text-white tracking-tighter drop-shadow-sm mb-1">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.15em]">{label}</p>
        </div>
      </div>
    </div>
  );
}
