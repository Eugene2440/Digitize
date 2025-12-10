package handlers

import (
	"digital-logbook/database"
	"digital-logbook/middleware"
	"digital-logbook/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type CreateUserRequest struct {
	Username string          `json:"username" binding:"required"`
	Password string          `json:"password" binding:"required,min=6"`
	Role     models.UserRole `json:"role" binding:"required,oneof=data_entry dashboard_visitor dashboard_cargo admin"`
	FullName string          `json:"full_name" binding:"required"`
}

type UpdateUserRequest struct {
	Username string          `json:"username"`
	Password string          `json:"password,omitempty"`
	Role     models.UserRole `json:"role" binding:"required,oneof=data_entry dashboard_visitor dashboard_cargo admin"`
	FullName string          `json:"full_name"`
}

// CreateUser creates a new user (admin only)
func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if username already exists
	if _, err := database.DB.GetUserByUsername(req.Username); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := &models.User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
		FullName:     req.FullName,
	}

	if err := database.DB.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// ListUsers returns all users (admin only)
func ListUsers(c *gin.Context) {
	users := database.DB.GetAllUsers()
	c.JSON(http.StatusOK, users)
}

// GetUser returns a specific user by ID (admin only)
func GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	user, err := database.DB.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateUser updates a user's information (admin only)
func UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	user, err := database.DB.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if req.Username != "" && req.Username != user.Username {
		// Check if new username is already taken
		if _, err := database.DB.GetUserByUsername(req.Username); err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
			return
		}
		user.Username = req.Username
	}

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user.PasswordHash = string(hashedPassword)
	}

	user.Role = req.Role
	if req.FullName != "" {
		user.FullName = req.FullName
	}

	if err := database.DB.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// DeleteUser deletes a user (admin only)
func DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Prevent deleting own account
	currentUser, err := middleware.GetCurrentUser(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	if currentUser.ID == uint(id) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete your own account"})
		return
	}

	if err := database.DB.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
