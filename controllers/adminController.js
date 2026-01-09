import path from 'path';
import { fileURLToPath } from 'url';

import * as leaveModel from '../models/leaveModel.js';
import { page, escapeHtml } from './viewHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isAdminCredentials(email, password) {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  return String(email || '').trim().toLowerCase() === adminEmail && String(password || '') === adminPassword;
}

async function getAdminLogin(req, res, next) {
  try {
    if (req.session?.admin?.isAdmin) return res.redirect('/admin/dashboard');
    return res.sendFile(path.join(__dirname, '..', 'views', 'admin-login.html'));
  } catch (e) {
    return next(e);
  }
}

async function postAdminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Missing credentials');

    if (!isAdminCredentials(email, password)) {
      return res.status(401).send('Invalid admin credentials');
    }

    req.session.admin = { isAdmin: true, email: String(email).trim().toLowerCase() };
    return res.redirect('/admin/dashboard');
  } catch (e) {
    return next(e);
  }
}

async function getAdminDashboard(req, res, next) {
  try {
    const rows = await leaveModel.listAll();

    const tableRows = rows
      .map((r) => {
        const approveDisabled = r.status === 'Approved' ? 'disabled' : '';
        const rejectDisabled = r.status === 'Rejected' ? 'disabled' : '';

        return `<tr>
  <td>${escapeHtml(r.id)}</td>
  <td>${escapeHtml(r.name)}<br/><small>${escapeHtml(r.email)}</small></td>
  <td>${escapeHtml(r.start_date)} → ${escapeHtml(r.end_date)}</td>
  <td>${escapeHtml(r.reason)}</td>
  <td><span class="badge badge-${String(r.status).toLowerCase()}">${escapeHtml(r.status)}</span></td>
  <td>
    <form method="post" action="/leave/${escapeHtml(r.id)}/approve" style="display:inline">
      <button class="btn" type="submit" ${approveDisabled}>Approve</button>
    </form>
    <form method="post" action="/leave/${escapeHtml(r.id)}/reject" style="display:inline">
      <button class="btn btn-danger" type="submit" ${rejectDisabled}>Reject</button>
    </form>
  </td>
</tr>`;
      })
      .join('\n');

    const body = `
<div class="nav">
  <div>Admin Dashboard</div>
  <div class="nav-actions">
    <form method="post" action="/logout" style="display:inline">
      <button class="btn btn-secondary" type="submit">Logout</button>
    </form>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Employee</th>
      <th>Dates</th>
      <th>Reason</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${tableRows || '<tr><td colspan="6">No leave requests found.</td></tr>'}
  </tbody>
</table>
`;

    return res.send(page('Admin Dashboard', body));
  } catch (e) {
    return next(e);
  }
}

export { getAdminLogin, postAdminLogin, getAdminDashboard };
