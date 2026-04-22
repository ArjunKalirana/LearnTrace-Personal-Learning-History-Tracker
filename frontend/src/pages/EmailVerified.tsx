import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen } from 'lucide-react';

export default function EmailVerified() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-emerald-100 rounded-3xl flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Email verified!
          </h1>
          <p className="text-gray-500 font-medium">
            Your LearnTrace account is now fully activated. Start tracking your learning journey.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
        >
          <BookOpen className="h-5 w-5" />
          Go to Login
        </Link>
      </div>
    </div>
  );
}
