package services

import (
	"assembly-dashboard-backend/internal/models"
	"fmt"
	"sort"
	"time"
)

type AnalyticsService struct {
	csvParser *CSVParserService
	events    []models.UsageEvent
	lastLoad  time.Time
}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

func (s *AnalyticsService) Initialize(dataPath string) error {
	s.csvParser = NewCSVParserService(dataPath)
	return s.loadData()
}

func (s *AnalyticsService) loadData() error {
	events, err := s.csvParser.ParseAllCSVFiles()
	if err != nil {
		return fmt.Errorf("failed to load CSV data: %w", err)
	}

	s.events = events
	s.lastLoad = time.Now()
	fmt.Printf("Loaded %d events from CSV files\n", len(events))

	return nil
}

func (s *AnalyticsService) GetDashboardSummary() *models.DashboardSummary {
	// If no data is loaded, return mock data
	if len(s.events) == 0 {
		return s.getMockSummary()
	}

	summary := &models.DashboardSummary{
		TotalEvents:     len(s.events),
		UniqueCompanies: s.getUniqueCompanyCount(),
		EventTypes:      s.getEventTypeBreakdown(),
		RecentEvents:    s.getRecentEvents(10),
		TimeRange:       s.getTimeRange(),
		TimeSeriesData:  s.getTimeSeriesData(),
		TopCompanies:    s.getTopCompanies(5),
		DailyTrends:     s.getDailyTrends(),
	}

	return summary
}

func (s *AnalyticsService) getUniqueCompanyCount() int {
	companies := make(map[string]bool)
	for _, event := range s.events {
		if event.CompanyID != "" {
			companies[event.CompanyID] = true
		}
	}
	return len(companies)
}

func (s *AnalyticsService) getEventTypeBreakdown() map[string]int {
	breakdown := make(map[string]int)
	for _, event := range s.events {
		if event.Type != "" {
			breakdown[event.Type]++
		}
	}
	return breakdown
}

func (s *AnalyticsService) getRecentEvents(limit int) []models.UsageEvent {
	if len(s.events) == 0 {
		return []models.UsageEvent{}
	}

	// Sort events by created_at descending
	sortedEvents := make([]models.UsageEvent, len(s.events))
	copy(sortedEvents, s.events)

	sort.Slice(sortedEvents, func(i, j int) bool {
		return sortedEvents[i].CreatedAt.After(sortedEvents[j].CreatedAt)
	})

	if len(sortedEvents) > limit {
		return sortedEvents[:limit]
	}
	return sortedEvents
}

func (s *AnalyticsService) getTimeRange() map[string]interface{} {
	if len(s.events) == 0 {
		now := time.Now()
		return map[string]interface{}{
			"start": now.AddDate(0, -1, 0),
			"end":   now,
		}
	}

	minTime := s.events[0].CreatedAt
	maxTime := s.events[0].CreatedAt

	for _, event := range s.events {
		if event.CreatedAt.Before(minTime) {
			minTime = event.CreatedAt
		}
		if event.CreatedAt.After(maxTime) {
			maxTime = event.CreatedAt
		}
	}

	return map[string]interface{}{
		"start": minTime,
		"end":   maxTime,
	}
}

func (s *AnalyticsService) getTimeSeriesData() []models.TimeSeriesPoint {
	if len(s.events) == 0 {
		return []models.TimeSeriesPoint{}
	}

	// Group events by date
	dailyCounts := make(map[string]int)

	for _, event := range s.events {
		date := event.CreatedAt.Format("2006-01-02")
		dailyCounts[date]++
	}

	// Convert to time series points
	var points []models.TimeSeriesPoint
	for date, count := range dailyCounts {
		points = append(points, models.TimeSeriesPoint{
			Date:  date,
			Count: count,
		})
	}

	// Sort by date
	sort.Slice(points, func(i, j int) bool {
		return points[i].Date < points[j].Date
	})

	return points
}

func (s *AnalyticsService) getTopCompanies(limit int) []models.CompanyAnalytics {
	if len(s.events) == 0 {
		return []models.CompanyAnalytics{}
	}

	companyStats := make(map[string]*models.CompanyAnalytics)

	for _, event := range s.events {
		if event.CompanyID == "" {
			continue
		}

		if _, exists := companyStats[event.CompanyID]; !exists {
			companyStats[event.CompanyID] = &models.CompanyAnalytics{
				CompanyID:  event.CompanyID,
				EventTypes: make(map[string]int),
			}
		}

		stats := companyStats[event.CompanyID]
		stats.EventCount++

		if event.Type != "" {
			stats.EventTypes[event.Type]++
		}

		// Update last activity
		if stats.LastActivity == "" || event.CreatedAt.Format(time.RFC3339) > stats.LastActivity {
			stats.LastActivity = event.CreatedAt.Format(time.RFC3339)
		}
	}

	// Convert to slice and sort by event count
	var companies []models.CompanyAnalytics
	for _, stats := range companyStats {
		companies = append(companies, *stats)
	}

	sort.Slice(companies, func(i, j int) bool {
		return companies[i].EventCount > companies[j].EventCount
	})

	if len(companies) > limit {
		return companies[:limit]
	}
	return companies
}

func (s *AnalyticsService) getDailyTrends() map[string][]models.TimeSeriesPoint {
	trends := make(map[string][]models.TimeSeriesPoint)

	if len(s.events) == 0 {
		return trends
	}

	// Group by event type and date
	typeDateCounts := make(map[string]map[string]int)

	for _, event := range s.events {
		eventType := event.Type
		if eventType == "" {
			eventType = "Unknown"
		}

		date := event.CreatedAt.Format("2006-01-02")

		if _, exists := typeDateCounts[eventType]; !exists {
			typeDateCounts[eventType] = make(map[string]int)
		}

		typeDateCounts[eventType][date]++
	}

	// Convert to time series format
	for eventType, dateCounts := range typeDateCounts {
		var points []models.TimeSeriesPoint

		for date, count := range dateCounts {
			points = append(points, models.TimeSeriesPoint{
				Date:  date,
				Count: count,
			})
		}

		// Sort by date
		sort.Slice(points, func(i, j int) bool {
			return points[i].Date < points[j].Date
		})

		trends[eventType] = points
	}

	return trends
}

func (s *AnalyticsService) getMockSummary() *models.DashboardSummary {
	// Fallback mock data if CSV loading fails
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
		TimeSeriesData: []models.TimeSeriesPoint{
			{Date: "2025-05-20", Count: 23},
			{Date: "2025-05-21", Count: 31},
			{Date: "2025-05-22", Count: 28},
		},
		TopCompanies: []models.CompanyAnalytics{
			{
				CompanyID:    "company-1",
				EventCount:   45,
				LastActivity: time.Now().Format(time.RFC3339),
				EventTypes:   map[string]int{"Action": 25, "Metric": 20},
			},
		},
		DailyTrends: map[string][]models.TimeSeriesPoint{
			"Action": {
				{Date: "2025-05-20", Count: 15},
				{Date: "2025-05-21", Count: 18},
				{Date: "2025-05-22", Count: 12},
			},
		},
	}
}
