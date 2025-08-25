package handlers

import (
	"assembly-dashboard-backend/internal/models"
	"assembly-dashboard-backend/internal/services"
	"assembly-dashboard-backend/pkg/utils"
	"net/http"
	"strconv"
	"strings"
	"time"

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

func (h *AnalyticsHandler) SearchEvents(c *gin.Context) {
	filters, err := h.parseFilterParams(c)
	if err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid filter parameters", gin.H{"error": err.Error()})
		return
	}

	results := h.service.SearchEvents(filters)
	utils.JSONResponse(c, http.StatusOK, "success", results)
}

func (h *AnalyticsHandler) ExportData(c *gin.Context) {
	var request models.ExportRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid export request", gin.H{"error": err.Error()})
		return
	}

	// Validate format
	if request.Format != "csv" && request.Format != "json" {
		utils.JSONResponse(c, http.StatusBadRequest, "Invalid export format", gin.H{
			"error": "Format must be 'csv' or 'json'",
		})
		return
	}

	data, contentType, filename, err := h.service.ExportData(request)
	if err != nil {
		utils.JSONResponse(c, http.StatusInternalServerError, "Export failed", gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")
	c.Data(http.StatusOK, contentType, data)
}

func (h *AnalyticsHandler) HealthCheck(c *gin.Context) {
	utils.JSONResponse(c, http.StatusOK, "healthy", gin.H{
		"service":  "assembly-analytics-api",
		"version":  "1.0.0",
		"features": []string{"filtering", "search", "export"},
	})
}

func (h *AnalyticsHandler) parseFilterParams(c *gin.Context) (models.FilterParams, error) {
	filters := models.FilterParams{}

	// Parse date range
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filters.StartDate = &startDate
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			// Set to end of day
			endDate = endDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			filters.EndDate = &endDate
		}
	}

	// Parse company IDs
	if companyIDsStr := c.Query("company_ids"); companyIDsStr != "" {
		filters.CompanyIDs = strings.Split(companyIDsStr, ",")
		// Clean up whitespace
		for i, id := range filters.CompanyIDs {
			filters.CompanyIDs[i] = strings.TrimSpace(id)
		}
	}

	// Parse event types
	if eventTypesStr := c.Query("event_types"); eventTypesStr != "" {
		filters.EventTypes = strings.Split(eventTypesStr, ",")
		// Clean up whitespace
		for i, eventType := range filters.EventTypes {
			filters.EventTypes[i] = strings.TrimSpace(eventType)
		}
	}

	// Parse search text
	filters.SearchText = strings.TrimSpace(c.Query("search"))

	// Parse pagination
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filters.Limit = limit
		}
	}
	if filters.Limit <= 0 {
		filters.Limit = 50 // Default limit
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filters.Offset = offset
		}
	}

	return filters, nil
}
