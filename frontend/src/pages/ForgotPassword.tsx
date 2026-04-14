import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { Mail, ArrowLeft, Loader2, CheckCircle, BookOpen } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left — Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&auto=format"
          alt="Person thinking at desk"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-amber-900/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">LearnTrace</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Don't worry,<br />we've got you covered.
          </h1>
          <p className="text-gray-300 text-lg font-medium max-w-md">
            Reset your password in just a few simple steps and get back to tracking your learning journey.
          </p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
        <div className="w-full max-w-[440px] mx-auto">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900 text-xl font-bold">LearnTrace</span>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 font-medium mb-2">
                We've sent a password reset link to
              </p>
              <p className="text-gray-900 font-bold mb-8">{email}</p>
              <p className="text-sm text-gray-400 font-medium mb-6">
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </p>
              <button onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm font-bold text-amber-600 hover:text-amber-500 transition-colors">
                Try a different email
              </button>
              <div className="mt-8 pt-8 border-t border-gray-100">
                <Link to="/login" className="flex items-center justify-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  Forgot password?
                </h2>
                <p className="mt-2 text-gray-500 font-medium">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} id="forgot-password-form">
                {error && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input id="forgot-email" type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
                      placeholder="you@university.edu"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading || !email} id="forgot-submit"
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send reset link'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <Link to="/login" className="flex items-center justify-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
