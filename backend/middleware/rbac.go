package middleware

import (
	"digital-logbook/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole ensures the user has one of the specified roles
func RequireRole(roles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, err := GetCurrentUser(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		// Check if user has any of the required roles
		hasRole := false
		for _, role := range roles {
			if user.Role == role {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin ensures only admin users can access the route
func RequireAdmin() gin.HandlerFunc {
	return RequireRole(models.RoleAdmin)
}

// RequireDataEntry ensures only data entry operators or admins can access
func RequireDataEntry() gin.HandlerFunc {
	return RequireRole(models.RoleDataEntry, models.RoleAdmin)
}

// RequireVisitorDashboard ensures only visitor dashboard operators or admins can access
func RequireVisitorDashboard() gin.HandlerFunc {
	return RequireRole(models.RoleDashboardVisitor, models.RoleAdmin)
}

// RequireCargoDashboard ensures only cargo dashboard operators or admins can access
func RequireCargoDashboard() gin.HandlerFunc {
	return RequireRole(models.RoleDashboardCargo, models.RoleAdmin)
}
