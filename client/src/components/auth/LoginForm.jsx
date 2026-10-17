import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };
      
  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123'); // Assuming a default password for demo accounts
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your private chat account</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition duration-200 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick demo accounts bar */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium mb-2.5 text-center">Quick Demo Login (Click to fill):</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('alice@example.com')}
            className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg text-left border border-gray-200 transition font-medium truncate"
          >
            👩 Alice (alice@example.com)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('bob.smith@example.com')}
            className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg text-left border border-gray-200 transition font-medium truncate"
          >
            👨 Bob (bob.smith@example.com)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('charlie.brown@example.com')}
            className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg text-left border border-gray-200 transition font-medium truncate"
          >
            🧔 Charlie (charlie.brown@example.com)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('diana@example.com')}
            className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg text-left border border-gray-200 transition font-medium truncate"
          >
            👸 Diana (diana@example.com)
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
