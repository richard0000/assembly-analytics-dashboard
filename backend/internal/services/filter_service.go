package services

import (
	"assembly-dashboard-backend/internal/models"
	"strings"
	"time"
)

type FilterService struct{}

func NewFilterService() *FilterService {
	return &FilterService{}
}

func (s *FilterService) ApplyFilters(events []models.UsageEvent, filters models.FilterParams) models.FilteredResults {
	filtered := make([]models.UsageEvent, 0, len(events))

	for _, event := range events {
		if s.matchesFilters(event, filters) {
			filtered = append(filtered, event)
		}
	}

	// Apply pagination
	start := filters.Offset
	if start > len(filtered) {
		start = len(filtered)
	}

	end := start + filters.Limit
	if filters.Limit <= 0 || end > len(filtered) {
		end = len(filtered)
	}

	var paginatedEvents []models.UsageEvent
	if start < end {
		paginatedEvents = filtered[start:end]
	} else {
		paginatedEvents = []models.UsageEvent{}
	}

	return models.FilteredResults{
		Events:        paginatedEvents,
		TotalCount:    len(events),
		FilteredCount: len(filtered),
	}
}

func (s *FilterService) matchesFilters(event models.UsageEvent, filters models.FilterParams) bool {
	// Date range filter
	if filters.StartDate != nil && event.CreatedAt.Before(*filters.StartDate) {
		return false
	}
	if filters.EndDate != nil && event.CreatedAt.After(*filters.EndDate) {
		return false
	}

	// Company filter
	if len(filters.CompanyIDs) > 0 {
		found := false
		for _, companyID := range filters.CompanyIDs {
			if event.CompanyID == companyID {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}

	// Event type filter
	if len(filters.EventTypes) > 0 {
		found := false
		for _, eventType := range filters.EventTypes {
			if event.Type == eventType {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}

	// Text search filter
	if filters.SearchText != "" {
		searchText := strings.ToLower(filters.SearchText)
		searchableContent := strings.ToLower(
			event.Content + " " +
				event.Attribute + " " +
				event.Value + " " +
				event.CompanyID,
		)
		if !strings.Contains(searchableContent, searchText) {
			return false
		}
	}

	return true
}

func (s *FilterService) GetAvailableFilters(events []models.UsageEvent) models.AvailableFilters {
	companies := make(map[string]bool)
	eventTypes := make(map[string]bool)
	var minDate, maxDate time.Time

	for i, event := range events {
		// Collect unique companies
		if event.CompanyID != "" {
			companies[event.CompanyID] = true
		}

		// Collect unique event types
		if event.Type != "" {
			eventTypes[event.Type] = true
		}

		// Track date range
		if i == 0 {
			minDate = event.CreatedAt
			maxDate = event.CreatedAt
		} else {
			if event.CreatedAt.Before(minDate) {
				minDate = event.CreatedAt
			}
			if event.CreatedAt.After(maxDate) {
				maxDate = event.CreatedAt
			}
		}
	}

	// Convert maps to slices
	companyList := make([]string, 0, len(companies))
	for company := range companies {
		companyList = append(companyList, company)
	}

	eventTypeList := make([]string, 0, len(eventTypes))
	for eventType := range eventTypes {
		eventTypeList = append(eventTypeList, eventType)
	}

	filters := models.AvailableFilters{
		Companies:  companyList,
		EventTypes: eventTypeList,
	}

	if !minDate.IsZero() && !maxDate.IsZero() {
		filters.DateRange.Min = minDate.Format("2006-01-02")
		filters.DateRange.Max = maxDate.Format("2006-01-02")
	}

	return filters
}
