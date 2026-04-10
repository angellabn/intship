/* ── Customer Management Module — app.js ── */
const API = '/api';
let currentUser = null;
let authToken   = null;
let loginType   = 'admin';
let currentPage = 1;
let editingId   = null;
let searchTimer = null;

// ─────────────────── UTILS ───────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab' + cap(name)).classList.add('active');
  const nav = document.getElementById('nav' + cap(name));
  if (nav) nav.classList.add('active');

  if (name === 'dashboard') loadCustomers();
  if (name === 'profile')   loadProfile();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
}

function badge(status) {
  return status
    ? '<span class="badge badge-active">Active</span>'
    : '<span class="badge badge-inactive">Inactive</span>';
}

function setAlert(id, msg, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
}

function setLoginType(type, btn) {
  loginType = type;
  document.querySelectorAll('.ttab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('loginEmail').placeholder =
    type === 'admin' ? 'admin@demo.com' : 'rahul@example.com';
}

// ─────────────────── AUTH ───────────────────
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  document.getElementById('loginError').className = 'alert alert-error hidden';

  try {
    const endpoint = loginType === 'admin' ? '/auth/admin/login' : '/auth/login';
    const res  = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) { setAlert('loginError', data.message); return; }

    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('cmm_token', authToken);
    localStorage.setItem('cmm_user',  JSON.stringify(currentUser));
    initApp();
  } catch { setAlert('loginError', 'Connection error. Is the server running?'); }
}

async function register() {
  const body = {
    first_name: document.getElementById('regFirst').value.trim(),
    last_name:  document.getElementById('regLast').value.trim(),
    email:      document.getElementById('regEmail').value.trim(),
    phone:      document.getElementById('regPhone').value.trim(),
    password:   document.getElementById('regPassword').value
  };
  document.getElementById('registerError').className   = 'alert alert-error hidden';
  document.getElementById('registerSuccess').className = 'alert alert-success hidden';

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.success) { setAlert('registerError', data.message); return; }
    setAlert('registerSuccess', 'Account created! Redirecting to login…', 'success');
    setTimeout(() => showPage('loginPage'), 1500);
  } catch { setAlert('registerError', 'Connection error.'); }
}

function logout() {
  localStorage.removeItem('cmm_token');
  localStorage.removeItem('cmm_user');
  authToken = null; currentUser = null;
  showPage('loginPage');
}

function initApp() {
  document.getElementById('sbName').textContent   = currentUser.name;
  document.getElementById('sbRole').textContent   = currentUser.isAdmin ? 'Admin' : 'Customer';
  document.getElementById('sbAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

  if (currentUser.isAdmin) {
    document.getElementById('addCustomerBtn').style.display = 'inline-flex';
    document.getElementById('navProfile').style.display     = 'none';
  } else {
    document.getElementById('addCustomerBtn').style.display = 'none';
    document.getElementById('navProfile').style.display     = 'flex';
  }

  showPage('appPage');
  switchTab('dashboard');
}

// ─────────────────── LOAD CUSTOMERS ───────────────────
async function loadCustomers(page = 1) {
  currentPage = page;
  const search = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusFilter').value;
  const params = new URLSearchParams({ page, limit: 15 });
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const tbody = document.getElementById('custTableBody');
  tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Loading…</td></tr>';

  try {
    const res  = await fetch(`${API}/customers?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success) { tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">${data.message}</td></tr>`; return; }

    renderTable(data.data, tbody);
    renderPagination(data.pagination);
    renderStats(data.data);
  } catch { tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Error loading customers.</td></tr>'; }
}

function renderTable(customers, tbody) {
  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No customers found.</td></tr>';
    return;
  }
  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><code style="font-family:JetBrains Mono,monospace;font-size:12px">#${c.user_id}</code></td>
      <td><div style="font-weight:600">${c.first_name} ${c.last_name}</div></td>
      <td style="color:var(--text2);font-size:13px">${c.email}</td>
      <td style="font-size:13px">${c.phone || '—'}</td>
      <td>${badge(c.status)}</td>
      <td style="font-size:12px;color:var(--text2)">${fmtDate(c.created_at)}</td>
      <td>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="viewCustomer(${c.user_id})">View</button>
          ${currentUser.isAdmin ? `
            <button class="btn btn-primary btn-sm"  onclick="openEditModal(${c.user_id})">Edit</button>
            ${c.status
              ? `<button class="btn btn-danger btn-sm" onclick="deactivate(${c.user_id})">Deactivate</button>`
              : `<button class="btn btn-success btn-sm" onclick="reactivate(${c.user_id})">Reactivate</button>`
            }
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStats(customers) {
  const total    = customers.length;
  const active   = customers.filter(c => c.status).length;
  const inactive = total - active;
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat total">  <div class="stat-label">Total</div>   <div class="stat-value">${total}</div></div>
    <div class="stat active">  <div class="stat-label">Active</div>  <div class="stat-value">${active}</div></div>
    <div class="stat inactive"><div class="stat-label">Inactive</div><div class="stat-value">${inactive}</div></div>
  `;
}

function renderPagination(pg) {
  const el = document.getElementById('pagination');
  if (!pg || pg.total_pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = Array.from({ length: pg.total_pages }, (_, i) => i + 1)
    .map(p => `<button class="pg-btn${p === pg.page ? ' active' : ''}" onclick="loadCustomers(${p})">${p}</button>`)
    .join('');
}

function debounce() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadCustomers(1), 400);
}

// ─────────────────── VIEW MODAL ───────────────────
async function viewCustomer(id) {
  document.getElementById('viewModal').classList.remove('hidden');
  document.getElementById('viewModalBody').innerHTML = '<p style="padding:20px;text-align:center">Loading…</p>';
  document.getElementById('viewModalFtr').innerHTML  = '';

  try {
    const res  = await fetch(`${API}/customers/${id}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const data = await res.json();
    if (!data.success) { document.getElementById('viewModalBody').innerHTML = `<p>${data.message}</p>`; return; }
    const c = data.data;

    document.getElementById('viewModalBody').innerHTML = `
      <div class="detail-grid">
        <span class="dl">Customer ID</span>  <span class="dv">#${c.user_id}</span>
        <span class="dl">Full Name</span>    <span class="dv">${c.first_name} ${c.last_name}</span>
        <span class="dl">Email</span>        <span class="dv">${c.email}</span>
        <span class="dl">Phone</span>        <span class="dv">${c.phone || '—'}</span>
        <span class="dl">Status</span>       <span class="dv">${badge(c.status)}</span>
        <span class="dl">Registered On</span><span class="dv">${fmtDate(c.created_at)}</span>
        <span class="dl">Last Updated</span> <span class="dv">${fmtDate(c.updated_at)}</span>
      </div>
    `;

    const ftr = document.getElementById('viewModalFtr');
    if (currentUser.isAdmin) {
      ftr.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="closeModal('viewModal');openEditModal(${c.user_id})">Edit</button>
        ${c.status
          ? `<button class="btn btn-danger btn-sm"  onclick="closeModal('viewModal');deactivate(${c.user_id})">Deactivate</button>`
          : `<button class="btn btn-success btn-sm" onclick="closeModal('viewModal');reactivate(${c.user_id})">Reactivate</button>`
        }
      `;
    }
    ftr.innerHTML += `<button class="btn btn-secondary" onclick="closeModal('viewModal')">Close</button>`;
  } catch { document.getElementById('viewModalBody').innerHTML = '<p>Error.</p>'; }
}

// ─────────────────── ADD / EDIT MODAL ───────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Customer';
  document.getElementById('mFirst').value = '';
  document.getElementById('mLast').value  = '';
  document.getElementById('mEmail').value = '';
  document.getElementById('mPhone').value = '';
  document.getElementById('mPassword').value = '';
  document.getElementById('mPasswordGroup').style.display = 'block';
  document.getElementById('mStatusGroup').style.display   = 'none';
  document.getElementById('modalAlert').className         = 'alert hidden';
  document.getElementById('custModal').classList.remove('hidden');
}

async function openEditModal(id) {
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Customer';
  document.getElementById('mPasswordGroup').style.display = 'none';
  document.getElementById('mStatusGroup').style.display   = 'block';
  document.getElementById('modalAlert').className         = 'alert hidden';

  try {
    const res  = await fetch(`${API}/customers/${id}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const data = await res.json();
    const c    = data.data;
    document.getElementById('mFirst').value  = c.first_name;
    document.getElementById('mLast').value   = c.last_name;
    document.getElementById('mEmail').value  = c.email;
    document.getElementById('mPhone').value  = c.phone || '';
    document.getElementById('mStatus').value = c.status ? '1' : '0';
  } catch {}

  document.getElementById('custModal').classList.remove('hidden');
}

async function saveCustomer() {
  const body = {
    first_name: document.getElementById('mFirst').value.trim(),
    last_name:  document.getElementById('mLast').value.trim(),
    email:      document.getElementById('mEmail').value.trim(),
    phone:      document.getElementById('mPhone').value.trim(),
  };
  document.getElementById('modalAlert').className = 'alert hidden';

  try {
    let res, data;
    if (!editingId) {
      // ADD
      body.password = document.getElementById('mPassword').value;
      res  = await fetch(`${API}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(body)
      });
    } else {
      // EDIT
      body.status = document.getElementById('mStatus').value === '1';
      res  = await fetch(`${API}/customers/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(body)
      });
    }
    data = await res.json();
    if (!data.success) {
      setAlert('modalAlert', data.message); return;
    }
    closeModal('custModal');
    loadCustomers(currentPage);
  } catch { setAlert('modalAlert', 'Error saving customer.'); }
}

// ─────────────────── DEACTIVATE / REACTIVATE ───────────────────
async function deactivate(id) {
  if (!confirm(`Deactivate customer #${id}? They will not be able to log in.`)) return;
  try {
    const res  = await fetch(`${API}/customers/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) loadCustomers(currentPage);
  } catch { alert('Error.'); }
}

async function reactivate(id) {
  if (!confirm(`Reactivate customer #${id}?`)) return;
  try {
    const res  = await fetch(`${API}/customers/${id}/reactivate`, {
      method: 'PATCH', headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) loadCustomers(currentPage);
  } catch { alert('Error.'); }
}

// ─────────────────── PROFILE (customer) ───────────────────
async function loadProfile() {
  const el = document.getElementById('profileCard');
  el.innerHTML = 'Loading…';
  try {
    const res  = await fetch(`${API}/customers/${currentUser.id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success) { el.innerHTML = `<p>${data.message}</p>`; return; }
    const c = data.data;
    el.innerHTML = `
      <div class="profile-avatar">${c.first_name.charAt(0).toUpperCase()}</div>
      <div class="profile-row">
        <span class="profile-label">Full Name</span>   <span class="profile-value">${c.first_name} ${c.last_name}</span>
        <span class="profile-label">Email</span>       <span class="profile-value">${c.email}</span>
        <span class="profile-label">Phone</span>       <span class="profile-value">${c.phone || '—'}</span>
        <span class="profile-label">Account Status</span><span class="profile-value">${badge(c.status)}</span>
        <span class="profile-label">Member Since</span><span class="profile-value">${fmtDate(c.created_at)}</span>
      </div>
      <button class="btn btn-primary" onclick="openSelfEditModal(${c.user_id})">✏️ Edit My Details</button>
    `;
  } catch { el.innerHTML = '<p>Error loading profile.</p>'; }
}

function openSelfEditModal(id) {
  editingId = id;
  document.getElementById('modalTitle').textContent      = 'Update My Details';
  document.getElementById('mPasswordGroup').style.display = 'none';
  document.getElementById('mStatusGroup').style.display   = 'none';
  document.getElementById('modalAlert').className         = 'alert hidden';

  fetch(`${API}/customers/${id}`, { headers: { 'Authorization': `Bearer ${authToken}` } })
    .then(r => r.json()).then(data => {
      const c = data.data;
      document.getElementById('mFirst').value = c.first_name;
      document.getElementById('mLast').value  = c.last_name;
      document.getElementById('mEmail').value = c.email;
      document.getElementById('mPhone').value = c.phone || '';
    });

  document.getElementById('custModal').classList.remove('hidden');
}

// ─────────────────── HELPERS ───────────────────
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.querySelectorAll('.overlay').forEach(el => {
  el.addEventListener('click', function(e) { if (e.target === this) this.classList.add('hidden'); });
});

// ─────────────────── INIT ───────────────────
window.addEventListener('load', () => {
  const t = localStorage.getItem('cmm_token');
  const u = localStorage.getItem('cmm_user');
  if (t && u) { authToken = t; currentUser = JSON.parse(u); initApp(); }
  else showPage('loginPage');
});
