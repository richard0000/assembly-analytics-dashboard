package services

import (
	"assembly-dashboard-backend/internal/models"
	"time"
)

type AnalyticsService struct {
	// This will later hold data repositories
}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

func (s *AnalyticsService) GetDashboardSummary() *models.DashboardSummary {
	// Boilerplate data. Will replace at some point with real data... or not, hahaha
	mockEvents := []models.UsageEvent{
		{
			ID:        "mock-1",
			CreatedAt: time.Now().Add(-2 * time.Hour),
			CompanyID: "company-1",
			Type:      "Action",
			Content:   "User login - Sample Company",
			Attribute: "UserLogin",
			UpdatedAt: time.Now().Add(-2 * time.Hour),
			Value:     "",
		},
		{
			ID:        "mock-2",
			CreatedAt: time.Now().Add(-1 * time.Hour),
			CompanyID: "company-1",
			Type:      "CumulativeMetric",
			Content:   "Bank Balance Check",
			Attribute: "BankBalance",
			UpdatedAt: time.Now().Add(-1 * time.Hour),
			Value:     "$50,000.00",
		},
	}

	return &models.DashboardSummary{
		TotalEvents:     157,
		UniqueCompanies: 3,
		EventTypes: map[string]int{
			"Action":           89,
			"CumulativeMetric": 45,
			"Metric":           23,
		},
		RecentEvents: mockEvents,
		TimeRange: map[string]interface{}{
			"start": time.Now().AddDate(0, -1, 0),
			"end":   time.Now(),
		},
	}
}
