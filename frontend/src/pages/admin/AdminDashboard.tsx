import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../utils/api';
import type { CollegeOverview } from '../../types';
import { Users, BookOpen, GraduationCap, Building2, ArrowRight, Clock, Loader2 } from 'lucide-react';

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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80&auto=format"
          alt="University campus"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Welcome, {user?.firstName}
          </h1>
          <p className="text-gray-400 font-medium max-w-lg">
            {overview?.collegeName} — Monitor student progress, track learning achievements, and provide informed counseling.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Students" value={overview?.totalStudents || 0}
          color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Classes" value={overview?.totalClasses || 0}
          color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Learning Entries" value={overview?.totalEntries || 0}
          color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Classes & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Classes</h2>
            <span className="text-sm text-gray-400 font-medium">{overview?.classes.length || 0} active</span>
          </div>
          {overview?.classes && overview.classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {overview.classes.map((cls) => (
                <Link
                  key={cls.className}
                  to={`/admin/classroom/${encodeURIComponent(cls.className!)}`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                      <GraduationCap className="h-5 w-5 text-gray-500 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{cls.className}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {cls.studentCount} {cls.studentCount === 1 ? 'student' : 'students'} registered
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No classes with registered students yet.</p>
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Recent Students</h2>
          {overview?.recentStudents && overview.recentStudents.length > 0 ? (
            <div className="space-y-3">
              {overview.recentStudents.map((student) => (
                <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        {student.className || 'No class'} · {student.rollNumber || 'No roll'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">
                        {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400">No recent students</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center ${color} mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value.toLocaleString()}</p>
    </div>
  );
}
