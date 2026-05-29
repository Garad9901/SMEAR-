import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, Lock, Mail, ArrowRight, AlertCircle, MapPin, Briefcase } from 'lucide-react';

const DISTRICTS = [
  'Nagpur', 'Amravati', 'Wardha', 'Yavatmal', 'Akola',
  'Buldhana', 'Washim', 'Chandrapur', 'Gadchiroli', 'Gondia', 'Bhandara'
];

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [district, setDistrict] = useState('Nagpur');
  
  const [error, setError] = useState<string | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBtnLoading(true);

    try {
      await register(email, name, role, district, password);
      // Immediately redirect to login on success
      navigate('/login');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Registration failed. Email might already be in use.'
      );
    } finally {
      setBtnLoading(false);
    }
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
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Join Vidarbha Crop-Climate Platform
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 placeholder-slate-500"
                placeholder="Ramesh Patil"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
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
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 placeholder-slate-500"
                placeholder="farmer@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Profile Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Briefcase className="w-4 h-4" />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 appearance-none"
                >
                  <option value="farmer">Farmer</option>
                  <option value="agribusiness">Agri-Business</option>
                  <option value="insurance">Insurance</option>
                  <option value="government">Government</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Home District
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </span>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 appearance-none"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Choose Password
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
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-brand-green/45 focus:outline-none focus:ring-0 placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full py-3 bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-greenHover hover:to-brand-blueHover text-white font-bold rounded-xl text-sm transition mt-2 shadow-lg shadow-brand-green/10 flex items-center justify-center gap-2"
          >
            {btnLoading ? 'Creating Profile...' : 'Complete Registration'}
            {!btnLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-green hover:underline font-semibold">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
