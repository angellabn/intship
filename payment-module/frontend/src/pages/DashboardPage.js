import { useEffect, useState } from 'react';
import { getStats, getPayments } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2e86c1', '#27ae60', '#e74c3c', '#f39c12'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(console.error);
    getPayments({ limit: 5 }).then(r => setRecent(r.data.payments || [])).catch(console.error);
  }, []);

  const pieData = stats?.by_method?.map(m => ({ name: m.payment_method, value: m.count })) || [];

  const barData = [
    { name: 'Revenue', amount: Number(stats?.total_revenue || 0) },
    { name: 'Refunded', amount: Number(stats?.total_refunded || 0) },
  ];

  const statCards = [
    { label: 'Total Transactions', value: stats?.total_transactions ?? '—', icon: '📊', color: '#2e86c1' },
    { label: 'Total Revenue', value: stats ? `₹${Number(stats.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—', icon: '💰', color: '#27ae60' },
    { label: 'Total Refunded', value: stats ? `₹${Number(stats.total_refunded).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—', icon: '↩️', color: '#e67e22' },
    { label: 'Failed Payments', value: stats?.failed_count ?? '—', icon: '⚠️', color: '#e74c3c' },
  ];

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Dashboard Overview</h2>

      <div style={styles.cards}>
        {statCards.map(c => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
            <div style={styles.cardIcon}>{c.icon}</div>
            <div style={{ ...styles.cardValue, color: c.color }}>{c.value}</div>
            <div style={styles.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.charts}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Revenue vs Refunds</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={v => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Bar dataKey="amount" fill="#2e86c1" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Payments by Method</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.recentBox}>
        <h3 style={styles.chartTitle}>Recent Transactions</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['ID', 'Order', 'Customer', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((p, i) => (
              <tr key={p.payment_id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                <td style={styles.td}>#{p.payment_id}</td>
                <td style={styles.td}>#{p.order_id}</td>
                <td style={styles.td}>{p.customer_name}</td>
                <td style={styles.td}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                <td style={styles.td}>{p.payment_method}</td>
                <td style={styles.td}><StatusBadge status={p.payment_status} /></td>
                <td style={styles.td}>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = { Paid: '#27ae60', Failed: '#e74c3c', Refunded: '#e67e22', Pending: '#3498db' };
  return (
    <span style={{ background: (colors[status] || '#aaa') + '20', color: colors[status] || '#aaa', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

const styles = {
  page: { padding: '24px 28px', fontFamily: "'Segoe UI',sans-serif", maxWidth: 1200 },
  heading: { fontSize: 22, fontWeight: 700, color: '#1a3c6e', marginBottom: 20 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 12, padding: '20px 18px', boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  cardIcon: { fontSize: 26, marginBottom: 8 },
  cardValue: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  cardLabel: { fontSize: 13, color: '#666' },
  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  chartBox: { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  chartTitle: { fontSize: 15, fontWeight: 600, color: '#1a3c6e', marginBottom: 12, marginTop: 0 },
  recentBox: { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,.08)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead: { background: '#1a3c6e' },
  th: { color: '#fff', padding: '10px 12px', textAlign: 'left', fontWeight: 600 },
  td: { padding: '9px 12px', borderBottom: '1px solid #eee', color: '#333' },
};
