import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { Lock, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff, Check, X, BookOpen } from 'lucide-react';

function getPasswordStrength(password: string): { score: 0|1|2|3|4; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  const labels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500'];
  return { score: score as 0|1|2|3|4, label: labels[score], color: colors[score] };
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const requirements = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special char', met: /[!@#$%^&*]/.test(password) },
  ];
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = strength.score >= 2 && passwordsMatch && !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      await authAPI.resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-500 font-medium mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password"
            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80&auto=format"
          alt="Desk with study materials" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-amber-900/30" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">LearnTrace</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Set a new<br />secure password.
          </h1>
          <p className="text-gray-300 text-lg font-medium max-w-md">
            Choose a strong password to keep your learning data safe.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
        <div className="w-full max-w-[440px] mx-auto">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900 text-xl font-bold">LearnTrace</span>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password reset successful</h2>
              <p className="text-gray-500 font-medium mb-6">
                Your password has been updated. Redirecting you to sign in...
              </p>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-[progress_3s_linear_forwards]" />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  Reset password
                </h2>
                <p className="mt-2 text-gray-500 font-medium">
                  Create a new password for your account
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} id="reset-password-form">
                {error && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm font-semibold">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700">
                    New password
                    {password && (
                      <span className={`float-right text-xs font-bold ${strength.score >= 3 ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {strength.label}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input id="new-password" type={showPassword ? 'text' : 'password'} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
                      placeholder="Create new password" />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="pt-2">
                      <div className="flex gap-1 h-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < strength.score ? strength.color : 'bg-gray-100'}`} />
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-y-1.5">
                        {requirements.map((req) => (
                          <div key={req.label} className="flex items-center space-x-1.5">
                            {req.met ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-gray-300" />}
                            <span className={`text-xs font-medium ${req.met ? 'text-gray-700' : 'text-gray-400'}`}>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700">
                    Confirm password
                    {confirmPassword && (
                      <span className={`float-right text-xs font-bold ${passwordsMatch ? 'text-emerald-500' : 'text-red-400'}`}>
                        {passwordsMatch ? 'Matches' : 'Does not match'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input id="confirm-password" type="password" required value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all outline-none ${
                        confirmPassword ? (passwordsMatch ? 'border-emerald-300 focus:border-emerald-500' : 'border-red-200 focus:border-red-400') : 'border-gray-200 focus:border-amber-500'
                      }`}
                      placeholder="Confirm your password" />
                  </div>
                </div>

                <button type="submit" disabled={loading || !canSubmit} id="reset-submit"
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 disabled:opacity-30 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset password'}
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
