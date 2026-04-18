import { useState, useEffect } from 'react';
import { processPayment, getOrders } from '../services/api';

export default function ProcessPaymentPage() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ order_id: '', amount: '', payment_method: 'Credit Card', card_token: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders().then(r => setOrders(r.data)).catch(() => {});
  }, []);

  const handleOrderChange = (e) => {
    const order = orders.find(o => String(o.order_id) === e.target.value);
    setForm({ ...form, order_id: e.target.value, amount: order ? order.total_amount : '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const { data } = await processPayment({
        order_id: Number(form.order_id),
        amount: Number(form.amount),
        payment_method: form.payment_method,
        card_token: form.card_token || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Process New Payment</h2>

      <div style={styles.grid}>
        <div style={styles.formCard}>
          <h3 style={styles.cardTitle}>Payment Details</h3>

          {error && <div style={styles.error}>{error}</div>}
          {result && (
            <div style={styles.success}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Payment {result.status}!</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Payment ID: <b>#{result.payment_id}</b></div>
              <div style={{ fontSize: 13 }}>Ref: <b>{result.transaction_ref}</b></div>
              <button style={styles.btnSecondary} onClick={() => { setResult(null); setForm({ order_id: '', amount: '', payment_method: 'Credit Card', card_token: '' }); }}>
                New Payment
              </button>
            </div>
          )}

          {!result && (
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Select Order</label>
                <select style={styles.input} value={form.order_id} onChange={handleOrderChange} required>
                  <option value="">-- Select an order --</option>
                  {orders.map(o => (
                    <option key={o.order_id} value={o.order_id}>
                      #{o.order_id} — {o.customer_name} (₹{Number(o.total_amount).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Amount (₹)</label>
                <input
                  style={styles.input} type="number" step="0.01" min="0.01"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Payment Method</label>
                <div style={styles.methods}>
                  {['Credit Card', 'PayPal', 'Bank Transfer'].map(m => (
                    <div
                      key={m}
                      style={{ ...styles.methodOption, ...(form.payment_method === m ? styles.methodSelected : {}) }}
                      onClick={() => setForm({ ...form, payment_method: m })}
                    >
                      <span>{m === 'Credit Card' ? '💳' : m === 'PayPal' ? '🅿️' : '🏦'}</span>
                      <span style={{ fontSize: 13 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {form.payment_method === 'Credit Card' && (
                <div style={styles.field}>
                  <label style={styles.label}>Card Token (Stripe test token)</label>
                  <input
                    style={styles.input} type="text" placeholder="tok_visa (optional for demo)"
                    value={form.card_token}
                    onChange={e => setForm({ ...form, card_token: e.target.value })}
                  />
                  <div style={styles.hint}>For testing: tok_visa, tok_mastercard, tok_chargeDeclined</div>
                </div>
              )}

              <button style={loading ? styles.btnDisabled : styles.btn} disabled={loading} type="submit">
                {loading ? 'Processing…' : `Pay ₹${Number(form.amount || 0).toLocaleString('en-IN')}`}
              </button>
            </form>
          )}
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>Supported Methods</h3>
          {[
            { icon: '💳', name: 'Credit / Debit Card', desc: 'Visa, Mastercard via Stripe gateway. Secure tokenised processing.' },
            { icon: '🅿️', name: 'PayPal', desc: 'Direct PayPal integration. Customer is redirected to PayPal for auth.' },
            { icon: '🏦', name: 'Bank Transfer', desc: 'Manual bank transfer. Reference number provided for reconciliation.' },
          ].map(m => (
            <div key={m.name} style={styles.infoItem}>
              <div style={{ fontSize: 26 }}>{m.icon}</div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a3c6e', fontSize: 14 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{m.desc}</div>
              </div>
            </div>
          ))}
          <div style={styles.securityNote}>
            🔒 All transactions are encrypted and PCI-DSS compliant. Card data is never stored on our servers.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '24px 28px', fontFamily: "'Segoe UI',sans-serif", maxWidth: 1000 },
  heading: { fontSize: 22, fontWeight: 700, color: '#1a3c6e', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 },
  formCard: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  infoCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.08)', height: 'fit-content' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a3c6e', marginBottom: 20, marginTop: 0 },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  hint: { fontSize: 11, color: '#aaa', marginTop: 4 },
  methods: { display: 'flex', gap: 10 },
  methodOption: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 10, border: '2px solid #ddd', cursor: 'pointer', fontSize: 20, transition: 'all .2s' },
  methodSelected: { border: '2px solid #2e86c1', background: '#eaf4fb' },
  btn: { width: '100%', padding: 13, background: 'linear-gradient(135deg,#1a3c6e,#2e86c1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  btnDisabled: { width: '100%', padding: 13, background: '#aaa', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'not-allowed', marginTop: 8 },
  btnSecondary: { marginTop: 16, padding: '9px 20px', background: '#eaf4fb', color: '#2e86c1', border: '1.5px solid #2e86c1', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fff0f0', border: '1px solid #ffcccc', color: '#c0392b', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 },
  success: { background: '#f0fff4', border: '1px solid #a3e4b7', borderRadius: 10, padding: '24px', textAlign: 'center', marginBottom: 16, color: '#1e8449' },
  infoItem: { display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #f0f0f0' },
  securityNote: { background: '#f0fff4', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#27ae60', fontWeight: 500 },
};
