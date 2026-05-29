import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBtnLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Incorrect email or password. Please try again.'
      );
    } finally {
      setBtnLoading(false);
    }
  };

  // Autocomplete logins for quick test credentials
  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('secure123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full glass-panel p-8 md:p-10 hover:border-brand-green/10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-green/10 rounded-2xl mb-4 border border-brand-green/20">
            <Sprout className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Sign in to AgroSense AI Command Center
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 placeholder-slate-500"
                placeholder="farmer@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Security Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-greenHover hover:to-brand-blueHover text-white font-bold rounded-xl text-sm transition shadow-lg shadow-brand-green/10 flex items-center justify-center gap-2"
          >
            {btnLoading ? 'Verifying...' : 'Sign In to Dashboard'}
            {!btnLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo profiles help */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
            🚀 Quick Credentials Switcher
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => fillCredentials('farmer@example.com')}
              className="py-1 px-2.5 bg-white/5 border border-white/10 text-[10px] rounded-lg text-slate-300 hover:bg-brand-green/10 hover:border-brand-green/25"
            >
              🌾 Farmer
            </button>
            <button
              onClick={() => fillCredentials('agribusiness@example.com')}
              className="py-1 px-2.5 bg-white/5 border border-white/10 text-[10px] rounded-lg text-slate-300 hover:bg-brand-blue/10 hover:border-brand-blue/25"
            >
              🏢 Corp
            </button>
            <button
              onClick={() => fillCredentials('insurance@example.com')}
              className="py-1 px-2.5 bg-white/5 border border-white/10 text-[10px] rounded-lg text-slate-300 hover:bg-purple-500/10 hover:border-purple-500/25"
            >
              🛡️ Insur
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          New to AgroSense?{' '}
          <Link to="/register" className="text-brand-green hover:underline font-semibold">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
