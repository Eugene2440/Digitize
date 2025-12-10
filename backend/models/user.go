package models

import (
	"time"
)

// UserRole represents the different roles in the system
type UserRole string

const (
	RoleDataEntry        UserRole = "data_entry"
	RoleDashboardVisitor UserRole = "dashboard_visitor"
	RoleDashboardCargo   UserRole = "dashboard_cargo"
	RoleAdmin            UserRole = "admin"
)

// User represents a system user with role-based permissions
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Role         UserRole  `gorm:"not null" json:"role"`
	FullName     string    `gorm:"not null" json:"full_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CanCreateVisitor checks if user can create visitor entries
func (u *User) CanCreateVisitor() bool {
	return u.Role == RoleDataEntry || u.Role == RoleAdmin
}

// CanSignInOutVisitor checks if user can sign in/out visitors
func (u *User) CanSignInOutVisitor() bool {
	return u.Role == RoleDashboardVisitor || u.Role == RoleAdmin
}

// CanEditVisitor checks if user can edit visitor entries
func (u *User) CanEditVisitor() bool {
	return u.Role == RoleAdmin
}

// CanCreateCargo checks if user can create cargo entries
func (u *User) CanCreateCargo() bool {
	return u.Role == RoleDataEntry || u.Role == RoleAdmin
}

// CanEditCargo checks if user can edit cargo entries
func (u *User) CanEditCargo() bool {
	return u.Role == RoleAdmin
}

// CanManageUsers checks if user can manage other users
func (u *User) CanManageUsers() bool {
	return u.Role == RoleAdmin
}
