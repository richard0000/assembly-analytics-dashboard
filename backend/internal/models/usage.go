package models

import (
	"time"
)

type UsageEvent struct {
	ID                string    `json:"id"`
	CreatedAt         time.Time `json:"created_at"`
	CompanyID         string    `json:"company_id"`
	Type              string    `json:"type"`
	Content           string    `json:"content"`
	Attribute         string    `json:"attribute"`
	UpdatedAt         time.Time `json:"updated_at"`
	OriginalTimestamp time.Time `json:"original_timestamp"`
	Value             string    `json:"value"`
}

type FilterParams struct {
	StartDate  *time.Time `json:"start_date,omitempty"`
	EndDate    *time.Time `json:"end_date,omitempty"`
	CompanyIDs []string   `json:"company_ids,omitempty"`
	EventTypes []string   `json:"event_types,omitempty"`
	SearchText string     `json:"search_text,omitempty"`
	Limit      int        `json:"limit,omitempty"`
	Offset     int        `json:"offset,omitempty"`
}

type FilteredResults struct {
	Events        []UsageEvent `json:"events"`
	TotalCount    int          `json:"total_count"`
	FilteredCount int          `json:"filtered_count"`
}

type ExportRequest struct {
	Format  string       `json:"format"` // "csv" or "json"
	Filters FilterParams `json:"filters"`
}

type TimeSeriesPoint struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Value string `json:"value,omitempty"`
}

type CompanyAnalytics struct {
	CompanyID    string         `json:"company_id"`
	EventCount   int            `json:"event_count"`
	LastActivity string         `json:"last_activity"`
	EventTypes   map[string]int `json:"event_types"`
}

type DashboardSummary struct {
	TotalEvents      int                          `json:"total_events"`
	UniqueCompanies  int                          `json:"unique_companies"`
	EventTypes       map[string]int               `json:"event_types"`
	RecentEvents     []UsageEvent                 `json:"recent_events"`
	TimeRange        map[string]interface{}       `json:"time_range"`
	TimeSeriesData   []TimeSeriesPoint            `json:"time_series_data"`
	TopCompanies     []CompanyAnalytics           `json:"top_companies"`
	DailyTrends      map[string][]TimeSeriesPoint `json:"daily_trends"`
	AvailableFilters AvailableFilters             `json:"available_filters"`
}

type AvailableFilters struct {
	Companies  []string `json:"companies"`
	EventTypes []string `json:"event_types"`
	DateRange  struct {
		Min string `json:"min"`
		Max string `json:"max"`
	} `json:"date_range"`
}

type CSVRecord struct {
	ID                string
	CreatedAt         string
	CompanyID         string
	Type              string
	Content           string
	Attribute         string
	UpdatedAt         string
	OriginalTimestamp string
	Value             string
}
