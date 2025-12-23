package routes

import (
	"digital-logbook/handlers"
	"digital-logbook/middleware"
	"digital-logbook/models"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes with appropriate middleware
func SetupRoutes(router *gin.Engine) {
	// Public routes
	api := router.Group("/api")
	{
		// Authentication
		api.POST("/auth/login", handlers.Login)
	}

	// Protected routes (require authentication)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Get current user info
		protected.GET("/auth/me", handlers.GetCurrentUser)

		// Visitor routes
		visitors := protected.Group("/visitors")
		{
			// All authenticated users can view visitors
			visitors.GET("", handlers.ListVisitors)
			visitors.GET("/:id", handlers.GetVisitor)

			// Data entry operators and admins can create visitors
			visitors.POST("", middleware.RequireDataEntry(), handlers.CreateVisitor)

			// Dashboard operators and admins can sign in/out visitors
			visitors.POST("/:id/signin", middleware.RequireVisitorDashboard(), handlers.SignInVisitor)
			visitors.POST("/:id/signout", middleware.RequireVisitorDashboard(), handlers.SignOutVisitor)

			// Only admins can update and delete visitors
			visitors.PUT("/:id", middleware.RequireAdmin(), handlers.UpdateVisitor)
			visitors.DELETE("/:id", middleware.RequireAdmin(), handlers.DeleteVisitor)
		}

		// Cargo routes
		cargo := protected.Group("/cargo")
		{
			// All authenticated users can view cargo
			cargo.GET("", handlers.ListCargo)
			cargo.GET("/:id", handlers.GetCargo)

			// Data entry operators and admins can create cargo
			cargo.POST("", middleware.RequireDataEntry(), handlers.CreateCargo)

			// Only admins can update and delete cargo
			cargo.PUT("/:id", middleware.RequireAdmin(), handlers.UpdateCargo)
			cargo.DELETE("/:id", middleware.RequireAdmin(), handlers.DeleteCargo)
		}

		// Fitness routes
		fitness := protected.Group("/fitness")
		{
			// Member management
			fitness.GET("/members", handlers.ListMembers)
			fitness.GET("/members/:id", handlers.GetMember)
			fitness.POST("/members", middleware.RequireDataEntry(), handlers.CreateMember)
			fitness.PUT("/members/:id", middleware.RequireDataEntry(), handlers.UpdateMember)
			fitness.DELETE("/members/:id", middleware.RequireAdmin(), handlers.DeleteMember)

			// Attendance
			fitness.GET("/attendance", handlers.ListFitnessAttendance)
			fitness.GET("/attendance/:id", handlers.GetFitnessAttendance)
			fitness.POST("/checkin", handlers.CheckIn)
			fitness.POST("/checkout", handlers.CheckOut)
			fitness.DELETE("/attendance/:id", middleware.RequireAdmin(), handlers.DeleteFitnessAttendance)
		}

		// User management routes (admin only)
		users := protected.Group("/users")
		users.Use(middleware.RequireRole(models.RoleAdmin))
		{
			users.GET("", handlers.ListUsers)
			users.GET("/:id", handlers.GetUser)
			users.POST("", handlers.CreateUser)
			users.PUT("/:id", handlers.UpdateUser)
			users.DELETE("/:id", handlers.DeleteUser)
		}

		// Location management routes (admin only)
		locations := protected.Group("/locations")
		locations.Use(middleware.RequireRole(models.RoleAdmin))
		{
			locations.GET("", handlers.ListLocations)
			locations.GET("/:id", handlers.GetLocation)
			locations.POST("", handlers.CreateLocation)
			locations.PUT("/:id", handlers.UpdateLocation)
			locations.DELETE("/:id", handlers.DeleteLocation)
		}
	}
}
