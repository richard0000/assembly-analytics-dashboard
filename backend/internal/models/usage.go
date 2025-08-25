package models

import "time"

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

type DashboardSummary struct {
	TotalEvents     int                    `json:"total_events"`
	UniqueCompanies int                    `json:"unique_companies"`
	EventTypes      map[string]int         `json:"event_types"`
	RecentEvents    []UsageEvent           `json:"recent_events"`
	TimeRange       map[string]interface{} `json:"time_range"`
}
