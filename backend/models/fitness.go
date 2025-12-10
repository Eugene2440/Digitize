package models

import (
	"time"
)

// FitnessSession represents a gym session time
type FitnessSession string

const (
	SessionMorning   FitnessSession = "morning"
	SessionAfternoon FitnessSession = "afternoon"
	SessionEvening   FitnessSession = "evening"
)

// FitnessMember represents a registered gym member
type FitnessMember struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	IDNumber    string    `gorm:"not null;unique" json:"id_number"`
	PhoneNumber string    `gorm:"not null" json:"phone_number"`
	Company     string    `gorm:"not null" json:"company"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// FitnessAttendance represents a gym attendance entry
type FitnessAttendance struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	MemberID   uint           `gorm:"not null" json:"member_id"`
	Member     *FitnessMember `gorm:"foreignKey:MemberID" json:"member,omitempty"`
	Session    FitnessSession `gorm:"not null" json:"session"`
	Date       time.Time      `gorm:"not null" json:"date"`
	CheckIn    time.Time      `gorm:"not null" json:"check_in"`
	CheckOut   *time.Time     `json:"check_out,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}
