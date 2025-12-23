package models

import (
	"time"
)

// VisitorStatus represents the current status of a visitor
type VisitorStatus string

const (
	StatusSignedIn  VisitorStatus = "signed_in"
	StatusSignedOut VisitorStatus = "signed_out"
)

// Visitor represents a visitor entry in the logbook
type Visitor struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"not null" json:"name"`
	IDNumber     string         `gorm:"not null" json:"id_number"`
	AreaOfVisit  string         `gorm:"not null" json:"area_of_visit"`
	CompanyFrom  string         `json:"company_from"` // Optional
	Purpose      string         `gorm:"not null" json:"purpose"`
	BadgeNumber  string         `json:"badge_number"`
	Status       VisitorStatus  `gorm:"not null;default:'signed_in'" json:"status"`
	SignInTime   time.Time      `gorm:"not null" json:"sign_in_time"`
	SignOutTime  *time.Time     `json:"sign_out_time,omitempty"`
	LocationID   uint           `gorm:"not null" json:"location_id"`
	Location     *Location      `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

// IsActive returns true if the visitor is currently signed in
func (v *Visitor) IsActive() bool {
	return v.Status == StatusSignedIn
}

// SignIn marks the visitor as signed in with a badge number
func (v *Visitor) SignIn(badgeNumber string) {
	v.BadgeNumber = badgeNumber
	v.SignInTime = time.Now()
	v.Status = StatusSignedIn
}

// SignOut marks the visitor as signed out
func (v *Visitor) SignOut() {
	now := time.Now()
	v.SignOutTime = &now
	v.Status = StatusSignedOut
}
