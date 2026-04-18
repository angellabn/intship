import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard',  label: 'Dashboard',        icon: '📊' },
    { to: '/payments',   label: 'Transactions',      icon: '💳' },
    { to: '/process',    label: 'Process Payment',   icon: '➕' },
    { to: '/orders',     label: 'Orders',            icon: '📦' },
  ];

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>💳</span>
          <span style={styles.brandText}>PayManager</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navActive : {}) })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{user?.name?.[0] || 'A'}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name || 'Admin'}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: '#f4f7fb', fontFamily: "'Segoe UI',sans-serif" },
  sidebar: { width: 220, background: '#1a3c6e', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.1)' },
  brandIcon: { fontSize: 24 },
  brandText: { color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '.5px' },
  nav: { flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 },
  navLink: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all .2s' },
  navActive: { background: 'rgba(255,255,255,.15)', color: '#fff', fontWeight: 700 },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  userBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 14px', borderTop: '1px solid rgba(255,255,255,.1)', background: 'rgba(0,0,0,.15)' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#2e86c1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { color: 'rgba(255,255,255,.5)', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0 },
  main: { flex: 1, overflowY: 'auto', minWidth: 0 },
};
