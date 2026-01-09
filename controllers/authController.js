import path from 'path';
import { fileURLToPath } from 'url';

import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel.js';
import * as leaveModel from '../models/leaveModel.js';
import { page, escapeHtml } from './viewHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFlash(req) {
  const msg = req.session.flash;
  delete req.session.flash;
  return msg;
}

function setFlash(req, message) {
  req.session.flash = message;
}

async function getSignup(req, res, next) {
  try {
    return res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
  } catch (e) {
    return next(e);
  }
}

async function postSignup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send('Missing required fields');
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const passwordHash = await bcrypt.hash(String(password), 12);

    await userModel.createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash
    });

    setFlash(req, 'Signup successful. Please login.');
    return res.redirect('/login');
  } catch (e) {
    // Duplicate email
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).send('Email already exists');
    }
    return next(e);
  }
}

async function getLogin(req, res, next) {
  try {
    return res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
  } catch (e) {
    return next(e);
  }
}

async function postLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Missing credentials');

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await userModel.findByEmail(normalizedEmail);

    if (!user) return res.status(401).send('Invalid email or password');

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).send('Invalid email or password');

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'employee'
    };

    return res.redirect('/dashboard');
  } catch (e) {
    return next(e);
  }
}

async function postLogout(req, res, next) {
  try {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  } catch (e) {
    return next(e);
  }
}

async function getDashboard(req, res, next) {
  try {
    if (req.session?.user?.role !== 'employee') return res.redirect('/login');

    const flash = getFlash(req);

    const leaves = await leaveModel.listByUser(req.session.user.id);

    const rowsHtml = leaves
      .map((l) => {
        return `<tr>
  <td>${escapeHtml(l.id)}</td>
  <td>${escapeHtml(l.start_date)}</td>
  <td>${escapeHtml(l.end_date)}</td>
  <td>${escapeHtml(l.reason)}</td>
  <td><span class="badge badge-${String(l.status).toLowerCase()}">${escapeHtml(l.status)}</span></td>
</tr>`;
      })
      .join('\n');

    const body = `
<div class="nav">
  <div>Welcome, <strong>${escapeHtml(req.session.user.name)}</strong></div>
  <div class="nav-actions">
    <a class="btn" href="/apply-leave">Apply Leave</a>
    <form method="post" action="/logout" style="display:inline">
      <button class="btn btn-secondary" type="submit">Logout</button>
    </form>
  </div>
</div>

${flash ? `<p class="flash">${escapeHtml(flash)}</p>` : ''}

<h2>Leave History</h2>
<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>Start</th>
      <th>End</th>
      <th>Reason</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml || '<tr><td colspan="5">No leave requests yet.</td></tr>'}
  </tbody>
</table>
`;

    return res.send(page('Employee Dashboard', body));
  } catch (e) {
    return next(e);
  }
}

export { getSignup, postSignup, getLogin, postLogin, postLogout, getDashboard };
