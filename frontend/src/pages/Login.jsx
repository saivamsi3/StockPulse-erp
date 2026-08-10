import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const demoAccounts = [
  { role: 'Admin', email: 'admin@stockpulse.com' },
  { role: 'Sales', email: 'sales@stockpulse.com' },
  { role: 'Warehouse', email: 'warehouse@stockpulse.com' },
  { role: 'Accounts', email: 'accounts@stockpulse.com' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark brand-mark-lg">SP</span>
          <h1>StockPulse</h1>
          <p>Mini ERP + CRM Operations Portal</p>
        </div>

        <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-demo">
          <div className="auth-demo-title">Demo accounts (password: password123)</div>
          <div className="auth-demo-grid">
            {demoAccounts.map((a) => (
              <button
                key={a.email}
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setEmail(a.email);
                  setPassword('password123');
                }}
              >
                {a.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
