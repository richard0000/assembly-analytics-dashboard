package services

import (
	"assembly-dashboard-backend/internal/models"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"strings"
	"time"
)

type CSVParserService struct {
	dataPath string
}

func NewCSVParserService(dataPath string) *CSVParserService {
	return &CSVParserService{dataPath: dataPath}
}

func (s *CSVParserService) ParseAllCSVFiles() ([]models.UsageEvent, error) {
	var allEvents []models.UsageEvent

	// List of CSV files to process
	csvFiles := []string{
		"assembly-takehome1.shortened.csv",
		"assembly-takehome2.shortened.csv",
	}

	for _, filename := range csvFiles {
		filePath := fmt.Sprintf("%s/%s", s.dataPath, filename)
		events, err := s.parseCSVFile(filePath)
		if err != nil {
			fmt.Printf("Warning: Could not parse %s: %v\n", filename, err)
			continue
		}
		allEvents = append(allEvents, events...)
	}

	if len(allEvents) == 0 {
		return nil, fmt.Errorf("no valid CSV data found in %s", s.dataPath)
	}

	return allEvents, nil
}

func (s *CSVParserService) parseCSVFile(filePath string) ([]models.UsageEvent, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %w", filePath, err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	// Read header to determine structure
	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}

	// Clean and normalize headers
	for i, h := range header {
		header[i] = strings.TrimSpace(h)
	}

	var events []models.UsageEvent
	lineNumber := 1

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			fmt.Printf("Warning: Error reading line %d: %v\n", lineNumber+1, err)
			lineNumber++
			continue
		}

		// Skip empty records
		if len(record) == 0 || (len(record) == 1 && strings.TrimSpace(record[0]) == "") {
			lineNumber++
			continue
		}

		event, err := s.parseRecord(header, record)
		if err != nil {
			fmt.Printf("Warning: Error parsing line %d: %v\n", lineNumber+1, err)
			lineNumber++
			continue
		}

		events = append(events, event)
		lineNumber++
	}

	return events, nil
}

func (s *CSVParserService) parseRecord(header, record []string) (models.UsageEvent, error) {
	// Create a map for easier field access
	fieldMap := make(map[string]string)
	for i, value := range record {
		if i < len(header) {
			fieldMap[strings.ToLower(header[i])] = strings.TrimSpace(value)
		}
	}

	event := models.UsageEvent{}

	// Parse required fields with fallbacks
	event.ID = s.getField(fieldMap, []string{"id"})
	event.CompanyID = s.getField(fieldMap, []string{"company_id"})
	event.Type = s.getField(fieldMap, []string{"type"})
	event.Content = s.getField(fieldMap, []string{"content"})
	event.Attribute = s.getField(fieldMap, []string{"attribute"})
	event.Value = s.getField(fieldMap, []string{"value"})

	// Parse timestamps
	var err error
	event.CreatedAt, err = s.parseTimestamp(s.getField(fieldMap, []string{"created_at"}))
	if err != nil {
		event.CreatedAt = time.Now()
	}

	event.UpdatedAt, err = s.parseTimestamp(s.getField(fieldMap, []string{"updated_at"}))
	if err != nil {
		event.UpdatedAt = event.CreatedAt
	}

	event.OriginalTimestamp, err = s.parseTimestamp(s.getField(fieldMap, []string{"original_timestamp"}))
	if err != nil {
		event.OriginalTimestamp = event.CreatedAt
	}

	return event, nil
}

func (s *CSVParserService) getField(fieldMap map[string]string, possibleNames []string) string {
	for _, name := range possibleNames {
		if value, exists := fieldMap[name]; exists && value != "" {
			return value
		}
	}
	return ""
}

func (s *CSVParserService) parseTimestamp(timeStr string) (time.Time, error) {
	if timeStr == "" {
		return time.Time{}, fmt.Errorf("empty timestamp")
	}

	// Try different timestamp formats
	formats := []string{
		"2006-01-02 15:04:05.999999-07:00",
		"2006-01-02 15:04:05.999999+00:00",
		"2006-01-02 15:04:05.999999+00",
		"2006-01-02 15:04:05.999999",
		"2006-01-02 15:04:05",
		"2006-01-02",
		time.RFC3339,
		time.RFC3339Nano,
	}

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("could not parse timestamp: %s", timeStr)
}
