package handlers

import (
	"digital-logbook/database"
	"digital-logbook/middleware"
	"digital-logbook/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateVisitorRequest struct {
	Name        string `json:"name" binding:"required"`
	IDNumber    string `json:"id_number" binding:"required"`
	AreaOfVisit string `json:"area_of_visit" binding:"required"`
	CompanyFrom string `json:"company_from"`
	Purpose     string `json:"purpose" binding:"required"`
	BadgeNumber string `json:"badge_number" binding:"required"`
	LocationID  uint   `json:"location_id"`
}

type SignInRequest struct {
	BadgeNumber string `json:"badge_number" binding:"required"`
}

// CreateVisitor creates a new visitor entry (data_entry or admin only)
func CreateVisitor(c *gin.Context) {
	var req CreateVisitorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := middleware.GetCurrentUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var locationID uint
	if user.LocationID != nil {
		locationID = *user.LocationID
	} else {
		// If user has no location (Super Admin), use provided location or defaults
		if req.LocationID != 0 {
			locationID = req.LocationID
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Location ID is required for super admin"})
			return
		}
	}

	visitor := &models.Visitor{
		Name:        req.Name,
		IDNumber:    req.IDNumber,
		AreaOfVisit: req.AreaOfVisit,
		CompanyFrom: req.CompanyFrom,
		Purpose:     req.Purpose,
		BadgeNumber: req.BadgeNumber,
		Status:      models.StatusSignedIn,
		SignInTime:  time.Now(),
		LocationID:  locationID,
	}

	if err := database.DB.CreateVisitor(visitor); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create visitor"})
		return
	}

	c.JSON(http.StatusCreated, visitor)
}

// SignInVisitor assigns a badge and marks visitor as signed in
func SignInVisitor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	visitor, err := database.DB.GetVisitorByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}

	visitor.SignIn(req.BadgeNumber)

	if err := database.DB.UpdateVisitor(visitor); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign in visitor"})
		return
	}

	c.JSON(http.StatusOK, visitor)
}

// SignOutVisitor marks visitor as signed out
func SignOutVisitor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	visitor, err := database.DB.GetVisitorByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}

	if visitor.Status == models.StatusSignedOut {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Visitor already signed out"})
		return
	}

	visitor.SignOut()

	if err := database.DB.UpdateVisitor(visitor); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sign out visitor"})
		return
	}

	c.JSON(http.StatusOK, visitor)
}

// ListVisitors returns all visitors with optional filtering
func ListVisitors(c *gin.Context) {
	user, err := middleware.GetCurrentUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	filters := make(map[string]interface{})

	// If user is restricted to a location, force that filter
	if user.LocationID != nil {
		filters["location_id"] = *user.LocationID
	} else {
		// If super admin, allow filtering by location query param
		if locID := c.Query("location_id"); locID != "" {
			if id, err := strconv.ParseUint(locID, 10, 32); err == nil {
				filters["location_id"] = uint(id)
			}
		}
	}

	// Filter by status if provided
	status := c.Query("status")
	if status != "" {
		filters["status"] = status
	}

	visitors := database.DB.GetAllVisitors(filters)
	c.JSON(http.StatusOK, visitors)
}

// GetVisitor returns a specific visitor by ID
func GetVisitor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	visitor, err := database.DB.GetVisitorByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}

	c.JSON(http.StatusOK, visitor)
}

// UpdateVisitor updates a visitor entry (admin only)
func UpdateVisitor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	visitor, err := database.DB.GetVisitorByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}

	var req CreateVisitorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	visitor.Name = req.Name
	visitor.IDNumber = req.IDNumber
	visitor.AreaOfVisit = req.AreaOfVisit
	visitor.CompanyFrom = req.CompanyFrom
	visitor.Purpose = req.Purpose

	if err := database.DB.UpdateVisitor(visitor); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visitor"})
		return
	}

	c.JSON(http.StatusOK, visitor)
}

// DeleteVisitor deletes a visitor entry (admin only)
func DeleteVisitor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := database.DB.DeleteVisitor(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete visitor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Visitor deleted successfully"})
}
