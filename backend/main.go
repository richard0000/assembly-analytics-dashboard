package main

import (
	"assembly-dashboard-backend/internal/config"
	"assembly-dashboard-backend/internal/handlers"
	"assembly-dashboard-backend/internal/services"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()
	gin.SetMode(cfg.GinMode)

	// Initialize services
	analyticsService := services.NewAnalyticsService()

	// Initialize data loading
	if err := analyticsService.Initialize(cfg.DataPath); err != nil {
		log.Printf("Warning: Failed to load CSV data: %v", err)
		log.Println("Dashboard will use mock data")
	}

	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// Initialize Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Routes
	api := router.Group("/api/v1")
	{
		api.GET("/health", analyticsHandler.HealthCheck)
		api.GET("/dashboard/summary", analyticsHandler.GetDashboardSummary)
	}

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(router.Run(":" + cfg.Port))
}
