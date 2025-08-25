package services

import (
	"assembly-dashboard-backend/internal/models"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type ExportService struct {
	filterService *FilterService
}

func NewExportService(filterService *FilterService) *ExportService {
	return &ExportService{
		filterService: filterService,
	}
}

func (s *ExportService) ExportData(events []models.UsageEvent, request models.ExportRequest) ([]byte, string, error) {
	// Apply filters
	filtered := s.filterService.ApplyFilters(events, request.Filters)

	switch strings.ToLower(request.Format) {
	case "csv":
		return s.exportCSV(filtered.Events)
	case "json":
		return s.exportJSON(filtered.Events)
	default:
		return nil, "", fmt.Errorf("unsupported export format: %s", request.Format)
	}
}

func (s *ExportService) exportCSV(events []models.UsageEvent) ([]byte, string, error) {
	var output strings.Builder
	writer := csv.NewWriter(&output)

	// Write header
	header := []string{
		"ID", "Created At", "Company ID", "Type", "Content",
		"Attribute", "Updated At", "Original Timestamp", "Value",
	}
	if err := writer.Write(header); err != nil {
		return nil, "", fmt.Errorf("failed to write CSV header: %w", err)
	}

	// Write data rows
	for _, event := range events {
		row := []string{
			event.ID,
			event.CreatedAt.Format(time.RFC3339),
			event.CompanyID,
			event.Type,
			event.Content,
			event.Attribute,
			event.UpdatedAt.Format(time.RFC3339),
			event.OriginalTimestamp.Format(time.RFC3339),
			event.Value,
		}
		if err := writer.Write(row); err != nil {
			return nil, "", fmt.Errorf("failed to write CSV row: %w", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, "", fmt.Errorf("failed to flush CSV writer: %w", err)
	}

	return []byte(output.String()), "text/csv", nil
}

func (s *ExportService) exportJSON(events []models.UsageEvent) ([]byte, string, error) {
	data, err := json.MarshalIndent(events, "", "  ")
	if err != nil {
		return nil, "", fmt.Errorf("failed to marshal JSON: %w", err)
	}

	return data, "application/json", nil
}

func (s *ExportService) GetFilename(format string, filters models.FilterParams) string {
	timestamp := time.Now().Format("20060102_150405")

	var filterSuffix string
	if filters.SearchText != "" {
		filterSuffix += "_search"
	}
	if len(filters.CompanyIDs) > 0 {
		filterSuffix += "_filtered"
	}

	return fmt.Sprintf("assembly_analytics_%s%s.%s", timestamp, filterSuffix, format)
}
