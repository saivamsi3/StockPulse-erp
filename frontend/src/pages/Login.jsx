import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import StockPulseLogo from '../components/StockPulseLogo';

const demoAccounts = [
  { role: 'Administrator', tag: 'AD', desc: 'Full business control', email: 'admin@stockpulse.com' },
  { role: 'Sales', tag: 'SA', desc: 'Customers & challans', email: 'sales@stockpulse.com' },
  { role: 'Warehouse', tag: 'WH', desc: 'Products & inventory', email: 'warehouse@stockpulse.com' },
  { role: 'Accounts', tag: 'AC', desc: 'Business visibility', email: 'accounts@stockpulse.com' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-page-split">
      {/* Left Side - Brand & Value Proposition Hero */}
      <div className="auth-hero-panel">
        <div className="auth-hero-header">
          <StockPulseLogo showSubtitle={true} iconSize={48} />
        </div>

        <div className="auth-hero-content">
          <div className="hero-category-tag">WHOLESALE OPERATIONS PLATFORM</div>
          <h1 className="hero-main-title">
            Every Product. Every Customer. Every Transaction. <span className="hero-highlight">One Powerful ERP.</span>
          </h1>
          <p className="hero-description">
            Bring sales, warehouse, accounts and customer operations together in a single, dependable workspace.
          </p>
        </div>

        <div className="auth-hero-features">
          <div className="hero-feature-item">
            <span className="feature-num">01</span>
            <span className="feature-text">Unified operations</span>
          </div>
          <div className="hero-feature-item">
            <span className="feature-num">02</span>
            <span className="feature-text">Role-based access</span>
          </div>
          <div className="hero-feature-item">
            <span className="feature-num">03</span>
            <span className="feature-text">Live stock control</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form & Demo Selector */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="form-card-header">
            <span className="secure-badge">SECURE ACCESS</span>
            <h2>Welcome back</h2>
            <p className="muted">Sign in to continue to your workspace.</p>
          </div>

          <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@stockpulse.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-tradeflow-submit" type="submit" disabled={submitting}>
              {submitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in to StockPulse</span>
                  <span className="btn-arrow">&rarr;</span>
                </>
              )}
            </button>
          </form>

          <div className="protected-note">
            <span className="lock-icon">⚡</span>
            <span>Protected business workspace</span>
          </div>

          <div className="auth-demo-section">
            <div className="demo-header">
              <span className="demo-title">EXPLORE THE DEMO</span>
              <span className="demo-pwd-info">All accounts use <strong>password123</strong></span>
            </div>
            <div className="demo-grid-cards">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  className={`demo-card-item ${email === a.email ? 'selected' : ''}`}
                  onClick={() => {
                    setEmail(a.email);
                    setPassword('password123');
                  }}
                >
                  <div className="demo-tag">{a.tag}</div>
                  <div className="demo-info">
                    <div className="demo-role-name">
                      <span>{a.role}</span>
                      <span className="arrow-icon"></span>
                    </div>
                    <div className="demo-desc">{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
