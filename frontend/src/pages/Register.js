import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const inputCls =
  'w-full h-12 bg-black border-2 border-[#262626] rounded-none px-3 text-white placeholder:text-white/30 outline-none focus:border-[#fcee0a]';
const labelCls = 'block mb-2 text-sm uppercase tracking-wider text-white/70';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const walletAddress = useTonAddress();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(email, password, walletAddress);

    if (result.success) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12" data-testid="register-page">
      <div className="cut w-full max-w-md bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-6 sm:p-8">

        <div className="mb-6">
          <img src="/logo.png" alt="" className="h-12 w-12 mb-4" />
          <p className="font-mono text-sm text-[#00f0ff] mb-1">Create your THRUSTER account</p>
          <h1 className="text-4xl font-bold uppercase text-white">
            Reg<span className="text-[#fcee0a]">ister</span>
          </h1>

          {walletAddress && (
            <div className="mt-4 p-2 bg-[#00f0ff]/10 border-l-2 border-[#00f0ff] text-xs font-mono text-[#00f0ff]">
              Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              data-testid="register-email-input"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
              data-testid="register-password-input"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelCls}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputCls}
              data-testid="register-confirm-password-input"
            />
          </div>

          <button
            type="submit"
            className="cp-btn w-full text-center !py-4 mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#fcee0a]"
            disabled={loading}
            data-testid="register-submit-btn"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#00f0ff] hover:text-[#fcee0a] underline underline-offset-4"
              data-testid="register-login-link"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;