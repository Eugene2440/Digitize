package handlers

import (
	"digital-logbook/database"
	"digital-logbook/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateLocationRequest struct {
	Name    string `json:"name" binding:"required"`
	Code    string `json:"code" binding:"required"`
	Address string `json:"address"`
}

type UpdateLocationRequest struct {
	Name    string `json:"name"`
	Code    string `json:"code"`
	Address string `json:"address"`
}

// CreateLocation creates a new location (admin only)
func CreateLocation(c *gin.Context) {
	var req CreateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	location := &models.Location{
		Name:    req.Name,
		Code:    req.Code,
		Address: req.Address,
	}

	if err := database.DB.CreateLocation(location); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create location"})
		return
	}

	c.JSON(http.StatusCreated, location)
}

// ListLocations returns all locations
func ListLocations(c *gin.Context) {
	locations := database.DB.GetAllLocations()
	c.JSON(http.StatusOK, locations)
}

// GetLocation returns a specific location by ID
func GetLocation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	location, err := database.DB.GetLocationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	c.JSON(http.StatusOK, location)
}

// UpdateLocation updates a location
func UpdateLocation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	location, err := database.DB.GetLocationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	var req UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		location.Name = req.Name
	}
	if req.Code != "" {
		location.Code = req.Code
	}
	if req.Address != "" {
		location.Address = req.Address
	}

	if err := database.DB.UpdateLocation(location); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
		return
	}

	c.JSON(http.StatusOK, location)
}

// DeleteLocation deletes a location
func DeleteLocation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.DeleteLocation(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete location"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Location deleted successfully"})
}
