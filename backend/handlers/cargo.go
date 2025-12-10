package handlers

import (
	"digital-logbook/database"
	"digital-logbook/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateCargoRequest struct {
	Category            models.CargoCategory `json:"category" binding:"required,oneof=unknown known"`
	SealNumber          string               `json:"seal_number"`
	Description         string               `json:"description" binding:"required"`
	AWBNumber           string               `json:"awb_number" binding:"required"`
	ULDNumbers          string               `json:"uld_numbers" binding:"required"`
	DriverName          string               `json:"driver_name" binding:"required"`
	Company             string               `json:"company" binding:"required"`
	VehicleRegistration string               `json:"vehicle_registration" binding:"required"`
}

// CreateCargo creates a new cargo entry (data_entry or admin only)
func CreateCargo(c *gin.Context) {
	var req CreateCargoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cargo := &models.Cargo{
		Category:            req.Category,
		SealNumber:          req.SealNumber,
		Description:         req.Description,
		AWBNumber:           req.AWBNumber,
		ULDNumbers:          req.ULDNumbers,
		DriverName:          req.DriverName,
		Company:             req.Company,
		VehicleRegistration: req.VehicleRegistration,
		TimeIn:              time.Now(),
	}

	if err := database.DB.CreateCargo(cargo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cargo"})
		return
	}

	c.JSON(http.StatusCreated, cargo)
}

// ListCargo returns all cargo with optional filtering
func ListCargo(c *gin.Context) {
	filters := make(map[string]interface{})

	// Filter by category if provided
	category := c.Query("category")
	if category != "" {
		filters["category"] = category
	}

	cargoList := database.DB.GetAllCargo(filters)
	c.JSON(http.StatusOK, cargoList)
}

// GetCargo returns a specific cargo by ID
func GetCargo(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	cargo, err := database.DB.GetCargoByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cargo not found"})
		return
	}

	c.JSON(http.StatusOK, cargo)
}

// UpdateCargo updates a cargo entry (admin only)
func UpdateCargo(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	cargo, err := database.DB.GetCargoByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cargo not found"})
		return
	}

	var req CreateCargoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cargo.Category = req.Category
	cargo.SealNumber = req.SealNumber
	cargo.Description = req.Description
	cargo.AWBNumber = req.AWBNumber
	cargo.ULDNumbers = req.ULDNumbers
	cargo.DriverName = req.DriverName
	cargo.Company = req.Company
	cargo.VehicleRegistration = req.VehicleRegistration

	if err := database.DB.UpdateCargo(cargo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cargo"})
		return
	}

	c.JSON(http.StatusOK, cargo)
}

// DeleteCargo deletes a cargo entry (admin only)
func DeleteCargo(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.DeleteCargo(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cargo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cargo deleted successfully"})
}
