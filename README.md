# Digital Logbook System

A comprehensive full-stack web application for managing visitor sign-in/sign-out and cargo tracking with role-based access control.

## 🌟 Features

- **Visitor Management**: Complete visitor lifecycle from sign-in to sign-out with badge tracking
- **Cargo Tracking**: Track cargo deliveries with AWB, ULD, and driver information
- **Role-Based Access Control**: Four user roles with specific permissions
- **Modern UI**: Beautiful, premium design using LinkedIn Blue (#0D66C2) and Red Hat fonts
- **Secure Authentication**: JWT-based authentication with password hashing
- **Real-time Dashboard**: Live statistics and recent activity views

## 🏗️ Technology Stack

### Backend
- **Language**: Golang 1.21+
- **Framework**: Gin (HTTP web framework)
- **Database**: SQLite with GORM ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **CORS**: Enabled for frontend communication

### Frontend
- **Library**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with modern design system
- **Fonts**: Google Fonts - Red Hat Display & Red Hat Text

## 👥 User Roles & Permissions

1. **Data Entry Operators**
   - Create visitor entries
   - Create cargo entries
   - View all entries

2. **Dashboard Visitor Operators**
   - View visitors
   - Sign in/sign out visitors
   - No create or delete permissions

3. **Dashboard Cargo Operators**
   - View cargo entries only
   - No edit or delete permissions

4. **Admin Users**
   - Full CRUD operations on all resources
   - User management capabilities
   - System-wide access

## 🚀 Getting Started

### Prerequisites

- **Golang**: Version 1.21 or higher ([Download](https://golang.org/dl/))
- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Go dependencies:
   ```bash
   go mod download
   ```

3. Run the backend server:
   ```bash
   go run main.go
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000` and automatically open in your browser

## 🔐 Default Credentials

**Username**: `admin`  
**Password**: `admin123`

> ⚠️ **IMPORTANT**: Change the default password immediately after first login!

## 📊 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Visitors
- `GET /api/visitors` - List all visitors (with filters)
- `POST /api/visitors` - Create new visitor (data_entry, admin)
- `GET /api/visitors/:id` - Get visitor details
- `POST /api/visitors/:id/signin` - Sign in visitor (dashboard_visitor, admin)
- `POST /api/visitors/:id/signout` - Sign out visitor (dashboard_visitor, admin)
- `PUT /api/visitors/:id` - Update visitor (admin only)
- `DELETE /api/visitors/:id` - Delete visitor (admin only)

### Cargo
- `GET /api/cargo` - List all cargo (with filters)
- `POST /api/cargo` - Create cargo entry (data_entry, admin)
- `GET /api/cargo/:id` - Get cargo details
- `PUT /api/cargo/:id` - Update cargo (admin only)
- `DELETE /api/cargo/:id` - Delete cargo (admin only)

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📝 Workflow Examples

### Visitor Sign-In Process
1. Data Entry operator opens "New Visitor" form
2. Enters details from national ID
3. Clicks "Register Visitor"
4. System retains visitor ID and provides badge number
5. Visitor receives physical badge

### Visitor Sign-Out Process
1. Dashboard Visitor operator opens "Visitor List"
2. Finds active visitor
3. Clicks "Sign Out"
4. Returns ID card to visitor

### Cargo Entry
1. Data Entry operator opens "New Cargo"
2. Selects category (Known/Unknown)
3. Enters AWB, ULD, description
4. Enters driver and vehicle information
5. Submits entry

## 🎨 Design Guidelines

- **Color Palette**: LinkedIn Blue (#0D66C2), Black, White
- **Typography**: Red Hat Display (headings), Red Hat Text (body)
- **Aesthetics**: Modern, premium with glassmorphism and smooth animations
- **Responsive**: Mobile-friendly design

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the backend directory (optional):
```env
PORT=8080
JWT_SECRET=your-secret-key-here
DATABASE_PATH=logbook.db
```

### Frontend Configuration

Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:8080/api
```

## 📦 Building for Production

### Backend
```bash
cd backend
go build -o digital-logbook main.go
```

### Frontend
```bash
cd frontend
npm run build
```

The build folder will contain the production-ready static files.

## 🐛 Troubleshooting

### Backend won't start
- Ensure Go 1.21+ is installed: `go version`
- Check if port 8080 is available
- Run `go mod tidy` to clean dependencies

### Frontend won't start
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is available

### CORS Errors
- Ensure backend is running on port 8080
- Check that frontend API URL matches backend URL
- Verify CORS configuration in `backend/main.go`

## 📄 License

This project is part of an internal digital logbook system.

## 🤝 Support

For issues or questions, contact your system administrator.
# Digitize
