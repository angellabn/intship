import { useEffect, useState } from 'react';
import { getOrders, createOrder, updateOrderStatus } from '../services/api';

const STATUS_COLORS = {
  Pending:   { bg: '#eaf4fb', color: '#2e86c1' },
  Completed: { bg: '#eafaf1', color: '#27ae60' },
  Cancelled: { bg: '#fdf2f8', color: '#e74c3c' },
  Returned:  { bg: '#fef9e7', color: '#e67e22' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_email: '', total_amount: '' });
  const [toast, setToast] = useState(null);

  const fetch = () => getOrders().then(r => setOrders(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createOrder({ ...form, total_amount: Number(form.total_amount) });
      showToast('Order created!');
      setShowForm(false);
      setForm({ customer_name: '', customer_email: '', total_amount: '' });
      fetch();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create order', 'error');
    }
  };

  const handleStatusChange = async (order_id, status) => {
    try {
      await updateOrderStatus(order_id, status);
      showToast('Status updated!');
      fetch();
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'error' ? '#e74c3c' : '#27ae60' }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.heading}>Orders</h2>
        <button style={styles.btn} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Order'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Order</h3>
          <form onSubmit={handleCreate} style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Customer Name</label>
              <input style={styles.input} required value={form.customer_name}
                onChange={e => setForm({ ...form, customer_name: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Customer Email</label>
              <input style={styles.input} type="email" required value={form.customer_email}
                onChange={e => setForm({ ...form, customer_email: e.target.value })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Total Amount (₹)</label>
              <input style={styles.input} type="number" step="0.01" min="1" required value={form.total_amount}
                onChange={e => setForm({ ...form, total_amount: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={styles.btn}>Create Order</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Order ID', 'Customer', 'Amount', 'Status', 'Created', 'Update Status'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => {
              const s = STATUS_COLORS[o.order_status] || { bg: '#eee', color: '#555' };
              return (
                <tr key={o.order_id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={styles.td}>#{o.order_id}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{o.customer_email}</div>
                  </td>
                  <td style={{ ...styles.td, fontWeight: 700, color: '#1a3c6e' }}>
                    ₹{Number(o.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={styles.td}>
                    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {o.order_status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={styles.td}>
                    <select
                      style={styles.statusSelect}
                      value={o.order_status}
                      onChange={e => handleStatusChange(o.order_id, e.target.value)}
                    >
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                      <option>Returned</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '24px 28px', fontFamily: "'Segoe UI',sans-serif", maxWidth: 1100, position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: 700, color: '#1a3c6e', margin: 0 },
  btn: { padding: '9px 20px', background: 'linear-gradient(135deg,#1a3c6e,#2e86c1)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.08)', marginBottom: 20 },
  formTitle: { fontSize: 15, fontWeight: 700, color: '#1a3c6e', marginBottom: 16, marginTop: 0 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 },
  field: {},
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 5 },
  input: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', outline: 'none' },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead: { background: '#1a3c6e' },
  th: { color: '#fff', padding: '11px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12 },
  td: { padding: '10px 14px', borderBottom: '1px solid #f0f0f0', color: '#333', verticalAlign: 'middle' },
  statusSelect: { padding: '5px 10px', borderRadius: 6, border: '1.5px solid #ddd', fontSize: 12, outline: 'none', background: '#fff', cursor: 'pointer' },
  toast: { position: 'fixed', top: 20, right: 24, color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' },
};
