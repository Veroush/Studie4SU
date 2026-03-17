// ============================================================
//  admin-users.js — Users management page
// ============================================================

// ── State ────────────────────────────────────────────────────
let allUsers    = [];
let filtered    = [];
let currentPage = 1;
const PAGE_SIZE = 15;
let myId        = null; // logged-in admin's own ID

// ── Auth header helper ────────────────────────────────────────
// ADDED BY RAKSHA: all /admin/* routes require a Bearer token. Use this helper
// in every fetch() that hits an /admin/* endpoint.
function authHeaders(extra = {}) {
  return {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
    ...extra,
  };
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  initAuth();
  loadUsers();
  bindEvents();
});

// ── Auth ─────────────────────────────────────────────────────
function checkAdminAccess() {
  const token = localStorage.getItem('auth_token');
  if (!token) { window.location.href = 'login.html'; return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'admin') window.location.href = 'index.html';
    myId = payload.id;
  } catch {
    window.location.href = 'login.html';
  }
}

function initAuth() {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.name) document.getElementById('admin-name').textContent = payload.name;
  } catch {}
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('auth_token');
  window.location.href = 'login.html';
});

// ── Mobile sidebar ───────────────────────────────────────────
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('visible');
});
document.getElementById('sidebar-overlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
});

// ── Load users ────────────────────────────────────────────────
async function loadUsers() {
  try {
    // ADDED: Authorization header — /admin/users requires admin JWT
    const res = await fetch('/admin/users', {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load');
    allUsers = await res.json();
    updateStats();
    applyFiltersAndRender();
  } catch (err) {
    document.getElementById('users-tbody').innerHTML = `
      <tr><td colspan="5" style="text-align:center;padding:32px;color:var(--color-red-600);">
        Failed to load users. Is the server running?
      </td></tr>`;
    console.error('[admin-users] load error:', err);
  }
}

// ── Stats cards ───────────────────────────────────────────────
function updateStats() {
  const total    = allUsers.length;
  const admins   = allUsers.filter(u => u.role === 'admin').length;
  const students = allUsers.filter(u => u.role === 'student').length;

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-admins').textContent   = admins;
  document.getElementById('stat-students').textContent = students;
  document.getElementById('users-count-label').textContent =
    `${total} user${total !== 1 ? 's' : ''} registered`;
}

// ── Bind events ───────────────────────────────────────────────
function bindEvents() {
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; applyFiltersAndRender(); }, 250);
  });
  document.getElementById('filter-role').addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-role').value = '';
    currentPage = 1;
    applyFiltersAndRender();
  });

  // Delete modal
  document.getElementById('modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('modal-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('modal-confirm').addEventListener('click', confirmDelete);
  document.getElementById('delete-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
}

// ── Filter + render ───────────────────────────────────────────
function applyFiltersAndRender() {
  const search = document.getElementById('search-input').value.trim().toLowerCase();
  const roleF  = document.getElementById('filter-role').value;

  filtered = allUsers.filter(u => {
    const matchSearch = !search ||
      (u.name  && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search));
    const matchRole = !roleF || u.role === roleF;
    return matchSearch && matchRole;
  });

  renderTable();
  renderPagination();
}

// ── Render table ──────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('users-tbody');
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filtered.slice(start, start + PAGE_SIZE);

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">
      ${allUsers.length === 0 ? 'No users registered yet.' : 'No users match your search.'}
    </td></tr>`;
    return;
  }

  tbody.innerHTML = page.map(u => {
    const isMe = u.id === myId;
    const youBadge = isMe ? '<span class="you-badge">You</span>' : '';

    return `
    <tr data-id="${u.id}">
      <td>
        <div class="user-name-cell">${escHtml(u.name || '—')}${youBadge}</div>
        <div class="user-id-label">#${u.id}</div>
      </td>
      <td>${escHtml(u.email)}</td>
      <td>
        <select class="role-select" data-user-id="${u.id}" onchange="onRoleChange(this)" ${isMe ? 'disabled title="You cannot change your own role"' : ''}>
          <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
          <option value="admin"   ${u.role === 'admin'   ? 'selected' : ''}>Admin</option>
        </select>
      </td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn action-btn-save" id="save-btn-${u.id}" onclick="saveRole(${u.id})">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Save
          </button>
          <button class="action-btn action-btn-delete" onclick="openDeleteModal(${u.id}, '${escHtml(u.name || u.email)}')" ${isMe ? 'disabled title="You cannot delete your own account"' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// Show Save button when role dropdown changes
function onRoleChange(select) {
  const userId = select.dataset.userId;
  const saveBtn = document.getElementById(`save-btn-${userId}`);
  if (saveBtn) saveBtn.classList.add('visible');
}

// Save new role to backend
async function saveRole(userId) {
  const select = document.querySelector(`select[data-user-id="${userId}"]`);
  const saveBtn = document.getElementById(`save-btn-${userId}`);
  if (!select) return;

  const newRole = select.value;
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try {
    // ADDED BY RAKSHA: Authorization header — /admin/* routes require admin JWT
    const res = await fetch(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) throw new Error('Failed to update role');

    // Update in-memory
    const user = allUsers.find(u => u.id === userId);
    if (user) user.role = newRole;

    saveBtn.classList.remove('visible');
    updateStats();
    showToast(`Role updated to "${newRole}" successfully`, 'success');
  } catch (err) {
    showToast('Failed to update role', 'error');
    console.error('[admin-users] role update error:', err);
  } finally {
    saveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save`;
    saveBtn.disabled = false;
  }
}

// ── Delete modal ──────────────────────────────────────────────
let deleteTargetId = null;

function openDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('modal-user-name').textContent = name;
  document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').style.display = 'none';
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const btn = document.getElementById('modal-confirm');
  btn.textContent = 'Deleting...';
  btn.disabled = true;

  try {
    // ADDED: Authorization header — /admin/* routes require admin JWT
    const res = await fetch(`/admin/users/${deleteTargetId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Delete failed');
    allUsers = allUsers.filter(u => u.id !== deleteTargetId);
    closeDeleteModal();
    updateStats();
    applyFiltersAndRender();
    showToast('User deleted successfully', 'success');
  } catch (err) {
    showToast('Failed to delete user', 'error');
    console.error('[admin-users] delete error:', err);
  } finally {
    btn.textContent = 'Delete User';
    btn.disabled = false;
  }
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end   = Math.min(currentPage * PAGE_SIZE, filtered.length);

  document.getElementById('pagination-info').textContent =
    filtered.length === 0 ? '' : `Showing ${start}–${end} of ${filtered.length}`;

  const pag = document.getElementById('pagination');
  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="pagination-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
  </button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination-page ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }

  html += `<button class="pagination-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </button>`;

  pag.innerHTML = html;
}

function goPage(n) {
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (n < 1 || n > totalPages) return;
  currentPage = n;
  renderTable();
  renderPagination();
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span class="toast-msg">${escHtml(message)}</span>
    <button class="toast-close-btn" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Utils ─────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}