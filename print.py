# Digital Logbook System Specifications

## Visitor Management

### Sign In Process
- **Name** (from national ID)
- **ID Number** (from national ID)
- **Area of Visit**
- **Company From** (optional)
- **Purpose of Visit**

After input of details, click "Sign In":
1. Retain visitor's ID card
2. Offer a physical badge to the visitor
3. Guide visitor to the next steps

### Sign Out Process
After visit is over:
1. Visitor returns the pass
2. Return the ID card to visitor

---

## Cargo Management

### Categories
1. **Unknown Cargo**
2. **Known Cargo**

### Cargo Details
- **Seal Number** (optional)
- **Cargo Description**
- **AWB No.** (Air Waybill Number)
- **ULD No.(s)** (Unit Load Device Number(s))
- **Cargo Delivered By:**
  - Driver's Name
  - Company
  - Vehicle Registration

---

## User Roles & Permissions

### Data Entry Operators
- In charge of data input for both visitors and cargo

### Dashboard Operators
- **View Visitors Dashboard Only**
  - Sign in and sign out actions only
  - No CRUD operations
- **View Cargo Dashboard Only**
  - View-only access
  - No editing capabilities

### Admin/Full Access Operators
- View and edit both cargo and visitors
- Full CRUD operations

---

## Technical Stack

- **Frontend:** React
- **Backend:** Golang
- **Database:** SQLite (lightweight solution for now)

---

## Design Guidelines

- **Color Palette:** #0D66C2 (LinkedIn Blue), Black, and White
- **Font:** Google Red Hat Display/Text

---

## Notes
All operations will be handled by operators with appropriate role-based access control.