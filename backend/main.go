package main

import (
	"digital-logbook/database"
	"digital-logbook/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	if err := database.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create Gin router
	router := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://10.32.10.153:3001", "http://10.32.10.153:3000"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	router.Use(cors.New(config))

	// Setup routes
	routes.SetupRoutes(router)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Digital Logbook API is running",
		})
	})

	// Start server
	log.Println("🚀 Server starting on http://localhost:8080")
	log.Println("📝 Default Admin Credentials: username=admin, password=admin123")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
