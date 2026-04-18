import { useEffect, useState } from 'react';
import { getPayments, refundPayment, updateOrderStatus } from '../services/api';
import { StatusBadge } from './DashboardPage';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({ status: '', method: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getPayments({ ...filters, page, limit });
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (e) {
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRefund = async (payment) => {
    if (!window.confirm(`Refund ₹${Number(payment.amount).toLocaleString('en-IN')} for Payment #${payment.payment_id}?`)) return;
    try {
      // First mark order as Cancelled so refund is allowed
      await updateOrderStatus(payment.order_id, 'Cancelled');
      await refundPayment(payment.payment_id);
      showToast('Refund issued successfully!');
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Refund failed', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === 'error' ? '#e74c3c' : '#27ae60' }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.header}>
        <h2 style={styles.heading}>Payment Transactions</h2>
        <span style={styles.count}>{total} records</span>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <select style={styles.select} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option>Paid</option><option>Failed</option><option>Refunded</option>
        </select>
        <select style={styles.select} value={filters.method} onChange={e => setFilters({ ...filters, method: e.target.value })}>
          <option value="">All Methods</option>
          <option>Credit Card</option><option>PayPal</option><option>Bank Transfer</option>
        </select>
        <input style={styles.select} type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
        <input style={styles.select} type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
        <button style={styles.btn} onClick={() => { setPage(1); fetchData(); }}>🔍 Filter</button>
        <button style={styles.btnSecondary} onClick={() => { setFilters({ status: '', method: '', from: '', to: '' }); setPage(1); fetchData(); }}>Reset</button>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Pay ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#999' }}>Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#999' }}>No payments found</td></tr>
            ) : payments.map((p, i) => (
              <tr key={p.payment_id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                <td style={styles.td}>#{p.payment_id}</td>
                <td style={styles.td}>#{p.order_id}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{p.customer_name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{p.customer_email}</div>
                </td>
                <td style={{ ...styles.td, fontWeight: 700, color: '#1a3c6e' }}>
                  ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td style={styles.td}>{p.payment_method}</td>
                <td style={styles.td}><StatusBadge status={p.payment_status} /></td>
                <td style={styles.td}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                <td style={styles.td}>
                  {p.payment_status === 'Paid' ? (
                    <button style={styles.refundBtn} onClick={() => handleRefund(p)}>↩ Refund</button>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={{ fontSize: 13, color: '#555' }}>Page {page} of {totalPages || 1}</span>
        <button style={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '24px 28px', fontFamily: "'Segoe UI',sans-serif", maxWidth: 1200, position: 'relative' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  heading: { fontSize: 22, fontWeight: 700, color: '#1a3c6e', margin: 0 },
  count: { background: '#eaf4fb', color: '#2e86c1', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 600 },
  filterBar: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },
  select: { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13, outline: 'none', background: '#fff' },
  btn: { padding: '8px 18px', background: '#1a3c6e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { padding: '8px 14px', background: '#eee', color: '#555', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead: { background: '#1a3c6e' },
  th: { color: '#fff', padding: '11px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12 },
  td: { padding: '10px 14px', borderBottom: '1px solid #f0f0f0', color: '#333', verticalAlign: 'middle' },
  refundBtn: { padding: '4px 12px', background: '#fff4e8', color: '#e67e22', border: '1px solid #f0c080', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  pagination: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, justifyContent: 'center' },
  pageBtn: { padding: '7px 16px', background: '#1a3c6e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  toast: { position: 'fixed', top: 20, right: 24, color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' },
};
