import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import session from 'express-session';

import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable('x-powered-by');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    name: 'elms.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    
    }
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (req.session?.user?.role === 'employee') return res.redirect('/dashboard');
  if (req.session?.admin?.isAdmin) return res.redirect('/admin/dashboard');
  return res.redirect('/login');
});


app.use(authRoutes);
app.use(leaveRoutes);
app.use(adminRoutes);

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
  
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal Server Error';

  if (req.accepts('json')) {
    return res.status(status).json({ success: false, message });
  }

  return res.status(status).send(message);
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  
 // serer is running ...
  console.log(`Server running on http://localhost:${port}`);
});
