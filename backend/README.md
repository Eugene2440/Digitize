# Digital Logbook Backend

RESTful API for the Digital Logbook System built with Golang, Gin, and SQLite.

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "System Administrator"
  },
  "expires_at": "2024-01-02T00:00:00Z"
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

---

### Visitors

All visitor endpoints require authentication.

#### GET /api/visitors
List all visitors with optional filtering.

**Query Parameters:**
- `status` - Filter by status (signed_in, signed_out)
- `from_date` - Filter by sign-in date (ISO format)
- `to_date` - Filter by sign-in date (ISO format)

#### POST /api/visitors
Create a new visitor entry.

**Permission:** data_entry, admin

**Request:**
```json
{
  "name": "John Doe",
  "id_number": "12345678",
  "area_of_visit": "IT Department",
  "company_from": "ABC Corp",
  "purpose": "Equipment installation"
}
```

#### POST /api/visitors/:id/signin
Sign in a visitor with badge number.

**Permission:** dashboard_visitor, admin

**Request:**
```json
{
  "badge_number": "B001"
}
```

#### POST /api/visitors/:id/signout
Sign out a visitor.

**Permission:** dashboard_visitor, admin

---

### Cargo

#### GET /api/cargo
List all cargo entries with optional filtering.

**Query Parameters:**
- `category` - Filter by category (known, unknown)
- `from_date` - Filter by creation date
- `to_date` - Filter by creation date
- `awb` - Search by AWB number

#### POST /api/cargo
Create a new cargo entry.

**Permission:** data_entry, admin

**Request:**
```json
{
  "category": "known",
  "seal_number": "SEAL123",
  "description": "Electronics equipment",
  "awb_number": "AWB789456",
  "uld_numbers": "ULD001, ULD002",
  "driver_name": "Jane Smith",
  "company": "Freight Co",
  "vehicle_registration": "ABC-1234"
}
```

---

### Users (Admin Only)

#### GET /api/users
List all users.

#### POST /api/users
Create a new user.

**Request:**
```json
{
  "username": "operator1",
  "password": "securepass123",
  "role": "data_entry",
  "full_name": "Operator One"
}
```

**Roles:** data_entry, dashboard_visitor, dashboard_cargo, admin

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `role` - User role
- `full_name` - Full name
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Visitors Table
- `id` - Primary key
- `name` - Visitor name
- `id_number` - National ID number
- `area_of_visit` - Destination area
- `company_from` - Company (optional)
- `purpose` - Visit purpose
- `badge_number` - Assigned badge
- `status` - signed_in/signed_out
- `sign_in_time` - Timestamp
- `sign_out_time` - Timestamp (nullable)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Cargo Table
- `id` - Primary key
- `category` - known/unknown
- `seal_number` - Seal number (optional)
- `description` - Cargo description
- `awb_number` - Air Waybill Number
- `uld_numbers` - ULD Numbers
- `driver_name` - Driver name
- `company` - Delivery company
- `vehicle_registration` - License plate
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Running the Server

```bash
go run main.go
```

Server starts on port 8080.

## Environment Variables (Optional)

- `PORT` - Server port (default: 8080)
- `JWT_SECRET` - Secret key for JWT tokens
- `DATABASE_PATH` - SQLite database file path (default: logbook.db)
