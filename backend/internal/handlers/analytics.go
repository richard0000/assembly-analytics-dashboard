package handlers

import (
	"assembly-dashboard-backend/internal/services"
	"assembly-dashboard-backend/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	service *services.AnalyticsService
}

func NewAnalyticsHandler(service *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

func (h *AnalyticsHandler) GetDashboardSummary(c *gin.Context) {
	summary := h.service.GetDashboardSummary()
	utils.JSONResponse(c, http.StatusOK, "success", summary)
}

func (h *AnalyticsHandler) HealthCheck(c *gin.Context) {
	utils.JSONResponse(c, http.StatusOK, "healthy", gin.H{
		"service": "assembly-analytics-api",
		"version": "1.0.0",
	})
}
