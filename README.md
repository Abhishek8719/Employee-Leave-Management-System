# Employee Leave Management System

A comprehensive web-based employee leave management system built with Node.js, Express, and MySQL. This application streamlines the process of leave requests, approvals, and tracking for organizations.

# Features

### Employee Features
- **User Registration & Authentication**:  Secure signup and login with password hashing
- **Leave Request Management**: Submit leave requests with start date, end date, and reason
- **Request Tracking**: View status of all submitted leave requests (Pending, Approved, Rejected)
- **Dashboard**: Centralized view of all leave-related activities
- <img width="1920" height="1080" alt="Screenshot (372)" src="https://github.com/user-attachments/assets/5324cc0f-400e-433f-b449-6b4327d303ef" />


### Admin Features
- **Admin Dashboard**: Comprehensive overview of all leave requests
- **Request Management**:  Approve or reject employee leave requests
- **Employee Oversight**: Monitor leave patterns and history

### Security Features
- Session-based authentication
- Password hashing with bcrypt
- SQL injection protection with prepared statements
- CSRF protection with session management
- Secure HTTP headers

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MySQL2 (Database)
- Express-session (Session management)

**Security:**
- Bcrypt (Password hashing)
- Dotenv (Environment variables)

**Additional Tools:**
- Nodemailer (Email notifications)
- Nodemon (Development)

## 📋 Prerequisites

Before running this application, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Abhishek8719/Employee-Leave-Management-System.git
cd Employee-Leave-Management-System
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory: 

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=leave_management

# Session Configuration
SESSION_SECRET=your_secure_session_secret_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
```

### 4. Initialize the database
```bash
npm run db:init
```

Or manually run the SQL script:
```bash
mysql -u your_username -p < database. sql
```

### 5. Start the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
Employee-Leave-Management-System/
├── controllers/        # Request handlers and business logic
├── middleware/         # Authentication and validation middleware
├── models/            # Database models and queries
├── routes/            # API routes (auth, leave, admin)
├── services/          # Business logic and external services
├── views/             # Frontend templates
├── public/            # Static assets (CSS, JS, images)
├── scripts/           # Database initialization scripts
├── app.js             # Application entry point
├── database.sql       # Database schema
├── package.json       # Project dependencies
└── . env               # Environment variables (create this)
```

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password_hash`: Encrypted password
- `role`: User role (employee)
- `created_at`: Registration timestamp

### Leaves Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `start_date`: Leave start date
- `end_date`: Leave end date
- `reason`: Leave reason/description
- `status`: Request status (Pending, Approved, Rejected)
- `created_at`: Request creation timestamp
- `updated_at`: Last update timestamp

## 🔐 Default Admin Access

To access the admin panel, you'll need to manually create an admin user in the database or modify the authentication logic to support admin accounts.

## 📝 API Routes

### Authentication Routes
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /signup` - Registration page
- `POST /signup` - Register new user
- `POST /logout` - Logout user

### Employee Routes (Protected)
- `GET /dashboard` - Employee dashboard
- `GET /leave/new` - New leave request form
- `POST /leave/new` - Submit leave request
- `GET /leave/history` - View leave history

### Admin Routes (Protected)
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/leaves` - View all leave requests
- `POST /admin/leave/:id/approve` - Approve leave request
- `POST /admin/leave/:id/reject` - Reject leave request

## 🧪 Testing

```bash
# Run in development mode with auto-reload
npm run dev
```

## 🚢 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku addons:create cleardb: ignite
```

### Railway
```bash
railway login
railway init
railway up
```

### Manual Deployment
1. Set up MySQL database on your hosting provider
2. Configure environment variables
3. Run database initialization script
4. Start the application with `npm start`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Abhishek8719**
- GitHub: [@Abhishek8719](https://github.com/Abhishek8719)

## 🙏 Acknowledgments

- Express.js community
- MySQL documentation
- Node.js best practices

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainer.

---

**Note**: This is a learning/demonstration project. For production use, consider adding:
- Comprehensive unit and integration tests
- API rate limiting
- Advanced logging and monitoring
- Email notification system integration
- Multi-factor authentication
- Role-based access control (RBAC)
- Database connection pooling
- Caching layer (Redis)
- CI/CD pipeline
