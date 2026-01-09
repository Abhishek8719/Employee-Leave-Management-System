import nodemailer from 'nodemailer';

function envBool(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const v = String(raw).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function getSmtpConfig() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = envBool('SMTP_SECURE', false);

  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '').trim();

  const from = String(process.env.SMTP_FROM || '').trim();
  const enabled = envBool('EMAIL_NOTIFICATIONS_ENABLED', true);
  const debug = envBool('SMTP_DEBUG', false);

  return { host, port, secure, user, pass, from, enabled, debug };
}

function isConfigured(cfg) {
  if (!cfg.enabled) return false;
  if (!cfg.host) return false;
  if (!cfg.from && !cfg.user) return false;
  return true;
}

function configSummary(cfg) {
  return {
    enabled: !!cfg.enabled,
    host: cfg.host || null,
    port: cfg.port,
    secure: !!cfg.secure,
    fromSet: !!cfg.from,
    userSet: !!cfg.user,
    passSet: !!cfg.pass,
    debug: !!cfg.debug
  };
}

function configProblems(cfg) {
  const problems = [];
  if (!cfg.enabled) problems.push('EMAIL_NOTIFICATIONS_ENABLED is false');
  if (!cfg.host) problems.push('SMTP_HOST is empty');
  if (!cfg.from && !cfg.user) problems.push('Set SMTP_FROM or SMTP_USER');
  if (cfg.user && !cfg.pass) problems.push('SMTP_USER is set but SMTP_PASS is empty');
  return problems;
}

let cachedTransport = null;
let cachedKey = null;

function getTransport(cfg) {
  const key = JSON.stringify({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    user: cfg.user,
    debug: cfg.debug
  });

  if (cachedTransport && cachedKey === key) return cachedTransport;

  const auth = cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined;

  cachedTransport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth,
    logger: !!cfg.debug,
    debug: !!cfg.debug
  });
  cachedKey = key;

  return cachedTransport;
}

export async function sendLeaveDecisionEmail({
  to,
  employeeName,
  leaveId,
  startDate,
  endDate,
  reason,
  status
}) {
  const cfg = getSmtpConfig();
  const toEmail = String(to || '').trim();

  if (!toEmail) {
    
    console.warn('Email notifications skipped: recipient email is empty');
    return { skipped: true, reason: 'missing_to' };
  }

  if (!isConfigured(cfg)) {

    console.warn('Email notifications skipped:', {
      problems: configProblems(cfg),
      config: configSummary(cfg)
    });
    return { skipped: true, reason: 'not_configured' };
  }

  const from = cfg.from || cfg.user;
  const subject = `Leave request #${leaveId} ${status}`;

  const text = `Hi ${employeeName || 'there'},\n\nYour leave request (#${leaveId}) has been ${String(status).toLowerCase()}.\n\nDates: ${startDate} to ${endDate}\nReason: ${reason}\nStatus: ${status}\n\nRegards,\nHR/Admin`;

  const transport = getTransport(cfg);
  await transport.sendMail({ from, to: toEmail, subject, text });

  return { sent: true };
}
