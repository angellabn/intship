import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@payment.com', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>💳</div>
        <h1 style={styles.title}>PayManager</h1>
        <p style={styles.sub}>Admin Portal</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={loading ? styles.btnDisabled : styles.btn} disabled={loading} type="submit">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={styles.hint}>Demo: admin@payment.com / admin123</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI',sans-serif" },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,.4)' },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { textAlign: 'center', margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: '#1a3c6e' },
  sub: { textAlign: 'center', color: '#666', marginBottom: 28, fontSize: 14 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none', transition: 'border .2s' },
  btn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg,#1a3c6e,#2e86c1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  btnDisabled: { width: '100%', padding: '12px', background: '#aaa', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'not-allowed', marginTop: 8 },
  error: { background: '#fff0f0', border: '1px solid #ffcccc', color: '#c0392b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 },
  hint: { textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 16 },
};
