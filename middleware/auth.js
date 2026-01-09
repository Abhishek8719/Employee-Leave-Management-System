export function requireEmployee(req, res, next) {
  if (req.session?.user?.role === 'employee') return next();
  return res.redirect('/login');
}

export function requireAdmin(req, res, next) {
  if (req.session?.admin?.isAdmin) return next();
  return res.redirect('/admin/login');
}

export function redirectIfEmployeeAuthed(req, res, next) {
  if (req.session?.user?.role === 'employee') return res.redirect('/dashboard');
  return next();
}
