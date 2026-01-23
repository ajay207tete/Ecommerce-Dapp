import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTonAddress } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12" data-testid="register-page">
      <Card className="w-full max-w-md bg-[#0F0F1C]/80 backdrop-blur-md border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-orbitron uppercase tracking-tight text-primary">
            Register
          </CardTitle>
          <CardDescription className="font-rajdhani text-white/60">
            Create your THRUSTER account
          </CardDescription>
          {walletAddress && (
            <div className="mt-2 p-2 bg-secondary/10 border border-secondary/30 rounded text-xs font-mono text-secondary">
              Wallet connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-white/10 text-white"
                data-testid="register-email-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-white/10 text-white"
                data-testid="register-password-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input border-white/10 text-white"
                data-testid="register-confirm-password-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 font-orbitron uppercase tracking-wider"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/60 font-rajdhani">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:underline" data-testid="register-login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;