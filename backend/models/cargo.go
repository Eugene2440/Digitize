package models

import (
	"time"
)

// CargoCategory represents the type of cargo
type CargoCategory string

const (
	CategoryUnknown CargoCategory = "unknown"
	CategoryKnown   CargoCategory = "known"
)

// Cargo represents a cargo entry in the logbook
type Cargo struct {
	ID                   uint          `gorm:"primaryKey" json:"id"`
	Category             CargoCategory `gorm:"not null" json:"category"`
	SealNumber           string        `json:"seal_number"` // Optional
	Description          string        `gorm:"not null" json:"description"`
	AWBNumber            string        `gorm:"not null" json:"awb_number"`
	ULDNumbers           string        `gorm:"not null" json:"uld_numbers"`
	DriverName           string        `gorm:"not null" json:"driver_name"`
	Company              string        `gorm:"not null" json:"company"`
	VehicleRegistration  string        `gorm:"not null" json:"vehicle_registration"`
	LocationID           uint          `gorm:"not null" json:"location_id"`
	Location             *Location     `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	TimeIn               time.Time     `gorm:"not null" json:"time_in"`
	CreatedAt            time.Time     `json:"created_at"`
	UpdatedAt            time.Time     `json:"updated_at"`
}
