import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const inputCls =
  'w-full h-12 bg-black border-2 border-[#262626] rounded-none px-3 text-white placeholder:text-white/30 outline-none focus:border-[#fcee0a]';
const labelCls = 'block mb-2 text-sm uppercase tracking-wider text-white/70';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12" data-testid="login-page">
      <div className="cut w-full max-w-md bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-6 sm:p-8">

        <div className="mb-6">
          <img src="/logo.png" alt="" className="h-12 w-12 mb-4" />
          <p className="font-mono text-sm text-[#00f0ff] mb-1">Enter your credentials to access your account</p>
          <h1 className="text-4xl font-bold uppercase text-white">
            Sign <span className="text-[#fcee0a]">In</span>
          </h1>
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
              data-testid="login-email-input"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
              data-testid="login-password-input"
            />
          </div>

          <button
            type="submit"
            className="cp-btn w-full text-center !py-4 mt-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#fcee0a]"
            disabled={loading}
            data-testid="login-submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/60">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#00f0ff] hover:text-[#fcee0a] underline underline-offset-4"
              data-testid="login-register-link"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;