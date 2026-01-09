import path from 'path';
import { fileURLToPath } from 'url';

import * as leaveModel from '../models/leaveModel.js';
import { sendLeaveDecisionEmail } from '../services/emailService.js';
import { page, escapeHtml } from './viewHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseISODate(value) {
  // Expect yyyy-mm-dd from HTML date input
  const v = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return v;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateForInput(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  const asString = String(value);
  const match = asString.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

async function getApplyLeave(req, res, next) {
  try {
    return res.sendFile(path.join(__dirname, '..', 'views', 'apply-leave.html'));
  } catch (e) {
    return next(e);
  }
}

async function postApplyLeave(req, res, next) {
  try {
    const { startDate, endDate, reason } = req.body;

    const start = parseISODate(startDate);
    const end = parseISODate(endDate);
    const why = String(reason || '').trim();

    if (!start || !end || !why) {
      return res.status(400).send('Start date, end date, and reason are required');
    }

    // Backend validation for leave dates
    if (start > end) {
      return res.status(400).send('Start date must be before or equal to end date');
    }

    const today = todayISO();
    if (start < today) {
      return res.status(400).send('Start date cannot be in the past');
    }

    await leaveModel.createLeave({
      userId: req.session.user.id,
      startDate: start,
      endDate: end,
      reason: why
    });

    req.session.flash = 'Leave request submitted.';
    return res.redirect('/dashboard');
  } catch (e) {
    return next(e);
  }
}

async function postApproveLeave(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).send('Invalid leave id');

    const updated = await leaveModel.updateStatus(id, 'Approved');
    if (updated === 0) return res.status(404).send('Leave request not found');

    try {
      const leave = await leaveModel.findWithUserById(id);
      if (leave?.email) {
        await sendLeaveDecisionEmail({
          to: leave.email,
          employeeName: leave.name,
          leaveId: leave.id,
          startDate: leave.start_date,
          endDate: leave.end_date,
          reason: leave.reason,
          status: leave.status
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send approval email:', err);
    }

    return res.redirect('/admin/dashboard');
  } catch (e) {
    return next(e);
  }
}

async function postRejectLeave(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).send('Invalid leave id');

    const updated = await leaveModel.updateStatus(id, 'Rejected');
    if (updated === 0) return res.status(404).send('Leave request not found');

    try {
      const leave = await leaveModel.findWithUserById(id);
      if (leave?.email) {
        await sendLeaveDecisionEmail({
          to: leave.email,
          employeeName: leave.name,
          leaveId: leave.id,
          startDate: leave.start_date,
          endDate: leave.end_date,
          reason: leave.reason,
          status: leave.status
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send rejection email:', err);
    }

    return res.redirect('/admin/dashboard');
  } catch (e) {
    return next(e);
  }
}

export { getApplyLeave, postApplyLeave, postApproveLeave, postRejectLeave };

async function getEditLeave(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).send('Invalid leave id');

    const leave = await leaveModel.findByIdForUser(id, req.session.user.id);
    if (!leave) return res.status(404).send('Leave request not found');

    if (leave.status !== 'Pending') {
      req.session.flash = 'Only pending leave requests can be edited.';
      return res.redirect('/dashboard');
    }

    const startValue = formatDateForInput(leave.start_date);
    const endValue = formatDateForInput(leave.end_date);

    const body = `
<form id="leave-form" method="post" action="/leave/${escapeHtml(leave.id)}/update" class="card">
  <div class="form-error" role="alert" aria-live="polite" hidden></div>
  <label>
    Start Date
    <input name="startDate" type="date" required value="${escapeHtml(startValue)}" />
  </label>

  <label>
    End Date
    <input name="endDate" type="date" required value="${escapeHtml(endValue)}" />
  </label>

  <label>
    Reason
    <textarea name="reason" rows="4" required>${escapeHtml(leave.reason)}</textarea>
  </label>

  <div class="row">
    <button class="btn" type="submit">Update</button>
    <a class="btn btn-secondary" href="/dashboard">Back</a>
  </div>
</form>
`;

    return res.send(page('Edit Leave', body));
  } catch (e) {
    return next(e);
  }
}

async function postUpdateLeave(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).send('Invalid leave id');

    const { startDate, endDate, reason } = req.body;

    const start = parseISODate(startDate);
    const end = parseISODate(endDate);
    const why = String(reason || '').trim();

    if (!start || !end || !why) {
      return res.status(400).send('Start date, end date, and reason are required');
    }

    if (start > end) {
      return res.status(400).send('Start date must be before or equal to end date');
    }

    const today = todayISO();
    if (start < today) {
      return res.status(400).send('Start date cannot be in the past');
    }

    const updated = await leaveModel.updateLeaveForUser(id, req.session.user.id, {
      startDate: start,
      endDate: end,
      reason: why
    });

    if (updated === 0) {
      req.session.flash = 'Unable to update. Only pending leave requests can be edited.';
      return res.redirect('/dashboard');
    }

    req.session.flash = 'Leave request updated.';
    return res.redirect('/dashboard');
  } catch (e) {
    return next(e);
  }
}

async function postDeleteLeave(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).send('Invalid leave id');

    const deleted = await leaveModel.deleteLeaveForUser(id, req.session.user.id);
    if (deleted === 0) {
      req.session.flash = 'Unable to delete. Only pending leave requests can be deleted.';
      return res.redirect('/dashboard');
    }

    req.session.flash = 'Leave request deleted.';
    return res.redirect('/dashboard');
  } catch (e) {
    return next(e);
  }
}

export { getEditLeave, postUpdateLeave, postDeleteLeave };
