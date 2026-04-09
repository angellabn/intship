/* ──────────────────────────────────────────────
   Order Management Module — Frontend JS
   ────────────────────────────────────────────── */

const API = '/api';
let currentUser  = null;
let authToken    = null;
let currentPage  = 1;
let searchTimer  = null;
let cart         = {};   // { product_id: { name, price, qty } }
let products     = [];

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  const navEl = document.getElementById('nav' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (navEl) navEl.classList.add('active');

  if (tab === 'dashboard') loadOrders();
  if (tab === 'placeOrder') loadProducts();
  if (tab === 'myOrders') loadMyOrders();
}

function fmtCurrency(n) {
  return '₹' + parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function badgeHTML(status) {
  const cls = { Pending:'pending', Shipped:'shipped', Delivered:'delivered', Cancelled:'cancelled' };
  return `<span class="badge badge-${cls[status] || 'pending'}">${status}</span>`;
}

function setAlert(elId, msg, type = 'error') {
  const el = document.getElementById(elId);
  el.className = `alert alert-${type}`;
  el.textContent = msg;
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
async function login() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.className = 'alert alert-error hidden';

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) { setAlert('loginError', data.message); return; }

    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('omm_token', authToken);
    localStorage.setItem('omm_user',  JSON.stringify(currentUser));
    initApp();
  } catch (e) {
    setAlert('loginError', 'Connection error. Is the server running?');
  }
}

async function register() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role     = document.getElementById('regRole').value;
  document.getElementById('registerError').className   = 'alert alert-error hidden';
  document.getElementById('registerSuccess').className = 'alert alert-success hidden';

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!data.success) { setAlert('registerError', data.message); return; }
    setAlert('registerSuccess', 'Registered successfully! You can now log in.', 'success');
    setTimeout(() => showPage('loginPage'), 1500);
  } catch (e) {
    setAlert('registerError', 'Connection error.');
  }
}

function logout() {
  localStorage.removeItem('omm_token');
  localStorage.removeItem('omm_user');
  authToken   = null;
  currentUser = null;
  cart        = {};
  showPage('loginPage');
}

function initApp() {
  document.getElementById('sidebarName').textContent  = currentUser.name;
  document.getElementById('sidebarRole').textContent  = currentUser.role;
  document.getElementById('sidebarAvatar').textContent = currentUser.name.charAt(0).toUpperCase();

  // Show/hide nav items per role
  if (currentUser.role === 'customer') {
    document.getElementById('navMyOrders').style.display = 'flex';
  } else {
    document.getElementById('navMyOrders').style.display = 'none';
  }

  showPage('appPage');
  switchTab('dashboard');
}

// ─────────────────────────────────────────────
// ORDERS — DASHBOARD
// ─────────────────────────────────────────────
async function loadOrders(page = 1) {
  currentPage = page;
  const status = document.getElementById('statusFilter').value;
  const search = document.getElementById('searchInput').value.trim();
  const params = new URLSearchParams({ page, limit: 20 });
  if (status) params.set('status', status);
  if (search) params.set('search', search);

  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading…</td></tr>';

  try {
    const res  = await fetch(`${API}/orders?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success) { tbody.innerHTML = `<tr><td colspan="7" class="loading-cell">${data.message}</td></tr>`; return; }

    renderOrdersTable(data.data, tbody);
    renderPagination(data.pagination);
    renderStats(data.data);
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Error loading orders.</td></tr>';
  }
}

function renderOrdersTable(orders, tbody) {
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><code style="font-family:DM Mono,monospace;font-size:12px">#${o.order_id}</code></td>
      <td>
        <div style="font-weight:500">${o.customer_name}</div>
        <div style="font-size:12px;color:#64748b">${o.email}</div>
      </td>
      <td style="font-weight:600">${fmtCurrency(o.total_amount)}</td>
      <td>${badgeHTML(o.order_status)}</td>
      <td style="font-size:12px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${o.shipping_address}</td>
      <td style="font-size:12px;color:#64748b">${fmtDate(o.created_at)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary" style="padding:5px 10px;font-size:12px" onclick="viewOrder(${o.order_id})">View</button>
          ${currentUser.role === 'admin' ? `<button class="btn btn-success" style="padding:5px 10px;font-size:12px" onclick="openStatusModal(${o.order_id},'${o.order_status}')">Update</button>` : ''}
          ${o.order_status !== 'Cancelled' && o.order_status !== 'Shipped' && o.order_status !== 'Delivered'
            ? `<button class="btn btn-danger" style="padding:5px 10px;font-size:12px" onclick="cancelOrder(${o.order_id})">Cancel</button>`
            : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderStats(orders) {
  const counts = { Pending:0, Shipped:0, Delivered:0, Cancelled:0 };
  orders.forEach(o => { if (counts[o.order_status] !== undefined) counts[o.order_status]++; });
  document.getElementById('statsRow').innerHTML = Object.entries(counts).map(([k, v]) => `
    <div class="stat-card ${k.toLowerCase()}">
      <div class="stat-label">${k}</div>
      <div class="stat-value">${v}</div>
    </div>
  `).join('');
}

function renderPagination({ total_pages, page }) {
  const el = document.getElementById('pagination');
  if (total_pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = Array.from({ length: total_pages }, (_, i) => i + 1)
    .map(p => `<button class="page-btn${p === page ? ' active' : ''}" onclick="loadOrders(${p})">${p}</button>`)
    .join('');
}

function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadOrders(1), 400);
}

// ─────────────────────────────────────────────
// ORDER DETAIL MODAL
// ─────────────────────────────────────────────
async function viewOrder(id) {
  document.getElementById('orderModal').classList.remove('hidden');
  document.getElementById('modalBody').innerHTML = '<p style="text-align:center;padding:20px">Loading…</p>';
  document.getElementById('modalFooter').innerHTML = '';

  try {
    const res  = await fetch(`${API}/orders/${id}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const data = await res.json();
    if (!data.success) { document.getElementById('modalBody').innerHTML = `<p>${data.message}</p>`; return; }

    const o = data.data;
    document.getElementById('modalBody').innerHTML = `
      <div class="detail-grid">
        <span class="detail-label">Order ID</span>
        <span class="detail-value">#${o.order_id}</span>
        <span class="detail-label">Customer</span>
        <span class="detail-value">${o.customer_name} (${o.email})</span>
        <span class="detail-label">Status</span>
        <span class="detail-value">${badgeHTML(o.order_status)}</span>
        <span class="detail-label">Total Amount</span>
        <span class="detail-value" style="font-weight:700;color:var(--primary)">${fmtCurrency(o.total_amount)}</span>
        <span class="detail-label">Shipping Address</span>
        <span class="detail-value">${o.shipping_address}</span>
        <span class="detail-label">Placed On</span>
        <span class="detail-value">${fmtDate(o.created_at)}</span>
        <span class="detail-label">Last Updated</span>
        <span class="detail-value">${o.updated_at ? fmtDate(o.updated_at) : '—'}</span>
      </div>
      <h4 style="font-size:14px;font-weight:600;margin-bottom:10px">Order Items</h4>
      <table class="items-table">
        <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${(o.items || []).map(item => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.quantity}</td>
              <td>${fmtCurrency(item.unit_price)}</td>
              <td style="font-weight:600">${fmtCurrency(item.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const footer = document.getElementById('modalFooter');
    footer.innerHTML = '';
    if (currentUser.role === 'admin' && o.order_status !== 'Cancelled') {
      footer.innerHTML = `
        <select class="status-select" id="modalStatusSelect">
          <option ${o.order_status==='Pending'   ? 'selected' : ''}>Pending</option>
          <option ${o.order_status==='Shipped'   ? 'selected' : ''}>Shipped</option>
          <option ${o.order_status==='Delivered' ? 'selected' : ''}>Delivered</option>
          <option ${o.order_status==='Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        <button class="btn btn-primary" onclick="updateStatus(${o.order_id})">Update Status</button>
      `;
    }
    footer.innerHTML += `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`;
  } catch (e) {
    document.getElementById('modalBody').innerHTML = '<p>Error loading order.</p>';
  }
}

function openStatusModal(orderId, currentStatus) {
  viewOrder(orderId);
}

async function updateStatus(orderId) {
  const order_status = document.getElementById('modalStatusSelect').value;
  try {
    const res  = await fetch(`${API}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ order_status })
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) { closeModal(); loadOrders(currentPage); }
  } catch (e) {
    alert('Error updating status.');
  }
}

async function cancelOrder(id) {
  if (!confirm(`Cancel order #${id}? This cannot be undone.`)) return;
  try {
    const res  = await fetch(`${API}/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) loadOrders(currentPage);
  } catch (e) {
    alert('Error cancelling order.');
  }
}

function closeModal() {
  document.getElementById('orderModal').classList.add('hidden');
}

// ─────────────────────────────────────────────
// PLACE ORDER
// ─────────────────────────────────────────────
async function loadProducts() {
  const el = document.getElementById('productList');
  el.innerHTML = 'Loading products…';
  try {
    const res  = await fetch(`${API}/orders/products/list`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!data.success) { el.innerHTML = 'Failed to load products.'; return; }
    products = data.data;
    el.innerHTML = products.map(p => `
      <div class="product-card" id="pcard-${p.id}" onclick="toggleProduct(${p.id})">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${fmtCurrency(p.price)}</div>
        <div class="product-stock">Stock: ${p.stock}</div>
        <div class="qty-control" id="qtyCtrl-${p.id}" style="display:none" onclick="event.stopPropagation()">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-display" id="qty-${p.id}">1</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = 'Error loading products.';
  }
}

function toggleProduct(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;

  if (cart[productId]) {
    delete cart[productId];
    document.getElementById(`pcard-${productId}`).classList.remove('selected');
    document.getElementById(`qtyCtrl-${productId}`).style.display = 'none';
  } else {
    cart[productId] = { name: p.name, price: parseFloat(p.price), qty: 1 };
    document.getElementById(`pcard-${productId}`).classList.add('selected');
    document.getElementById(`qtyCtrl-${productId}`).style.display = 'flex';
  }
  renderCart();
}

function changeQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId].qty = Math.max(1, cart[productId].qty + delta);
  document.getElementById(`qty-${productId}`).textContent = cart[productId].qty;
  renderCart();
}

function renderCart() {
  const items   = Object.entries(cart);
  const cartEl  = document.getElementById('cartItems');
  const summEl  = document.getElementById('cartSummary');
  const placeBtn = document.getElementById('placeOrderBtn');

  if (!items.length) {
    cartEl.className = 'cart-empty';
    cartEl.innerHTML = 'Your cart is empty';
    summEl.classList.add('hidden');
    placeBtn.disabled = true;
    return;
  }

  cartEl.className = '';
  cartEl.innerHTML = items.map(([id, item]) => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div style="font-size:12px;color:#64748b">${item.qty} × ${fmtCurrency(item.price)}</div>
      </div>
      <div style="display:flex;align-items:center">
        <span class="cart-item-price">${fmtCurrency(item.price * item.qty)}</span>
        <span class="cart-item-remove" onclick="toggleProduct(${id})">✕</span>
      </div>
    </div>
  `).join('');

  const subtotal = items.reduce((s, [, i]) => s + i.price * i.qty, 0);
  const gst      = subtotal * 0.18;
  const total    = subtotal + gst;

  document.getElementById('cartSubtotal').textContent = fmtCurrency(subtotal);
  document.getElementById('cartGst').textContent      = fmtCurrency(gst);
  document.getElementById('cartTotal').textContent    = fmtCurrency(total);
  summEl.classList.remove('hidden');
  placeBtn.disabled = false;
}

async function placeOrder() {
  const shipping_address = document.getElementById('shippingAddress').value.trim();
  const alertEl = document.getElementById('orderAlert');
  alertEl.className = 'alert hidden';

  if (!shipping_address) {
    alertEl.className = 'alert alert-error';
    alertEl.textContent = 'Please enter a shipping address.';
    return;
  }

  const items = Object.entries(cart).map(([product_id, item]) => ({
    product_id: parseInt(product_id),
    quantity:   item.qty
  }));

  try {
    const res  = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify({ shipping_address, items })
    });
    const data = await res.json();

    if (!data.success) {
      alertEl.className = 'alert alert-error';
      alertEl.textContent = data.message;
      return;
    }

    alertEl.className = 'alert alert-success';
    alertEl.textContent = `✅ Order #${data.order_id} placed successfully! Total: ${fmtCurrency(data.total_amount)}`;

    // Reset cart
    cart = {};
    Object.keys(cart).forEach(id => {
      document.getElementById(`pcard-${id}`)?.classList.remove('selected');
      if (document.getElementById(`qtyCtrl-${id}`))
        document.getElementById(`qtyCtrl-${id}`).style.display = 'none';
    });
    renderCart();
    document.getElementById('shippingAddress').value = '';
    loadProducts();
  } catch (e) {
    alertEl.className = 'alert alert-error';
    alertEl.textContent = 'Error placing order.';
  }
}

// ─────────────────────────────────────────────
// MY ORDERS (customers)
// ─────────────────────────────────────────────
async function loadMyOrders() {
  const tbody = document.getElementById('myOrdersBody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading…</td></tr>';
  try {
    const res  = await fetch(`${API}/orders?limit=50`, { headers: { 'Authorization': `Bearer ${authToken}` } });
    const data = await res.json();
    if (!data.success || !data.data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No orders found.</td></tr>';
      return;
    }
    tbody.innerHTML = data.data.map(o => `
      <tr>
        <td><code style="font-family:DM Mono,monospace;font-size:12px">#${o.order_id}</code></td>
        <td style="font-weight:600">${fmtCurrency(o.total_amount)}</td>
        <td>${badgeHTML(o.order_status)}</td>
        <td style="font-size:12px">${o.shipping_address}</td>
        <td style="font-size:12px;color:#64748b">${fmtDate(o.created_at)}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary" style="padding:5px 10px;font-size:12px" onclick="viewOrder(${o.order_id})">View</button>
            ${o.order_status === 'Pending'
              ? `<button class="btn btn-danger" style="padding:5px 10px;font-size:12px" onclick="cancelMyOrder(${o.order_id})">Cancel</button>`
              : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Error loading orders.</td></tr>';
  }
}

async function cancelMyOrder(id) {
  if (!confirm(`Cancel order #${id}?`)) return;
  try {
    const res  = await fetch(`${API}/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) loadMyOrders();
  } catch (e) { alert('Error.'); }
}

// ─────────────────────────────────────────────
// INIT — check saved session
// ─────────────────────────────────────────────
window.addEventListener('load', () => {
  const savedToken = localStorage.getItem('omm_token');
  const savedUser  = localStorage.getItem('omm_user');
  if (savedToken && savedUser) {
    authToken   = savedToken;
    currentUser = JSON.parse(savedUser);
    initApp();
  } else {
    showPage('loginPage');
  }
});

// Close modal on overlay click
document.getElementById('orderModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
