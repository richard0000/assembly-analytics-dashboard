import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { FilterParams, AvailableFilters } from "../../types/usage";

const FilterContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  margin-bottom: 30px;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    color: #34495e;
    margin: 0;
    font-size: 1.1rem;
  }
`;

const ToggleButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background: #2980b9;
  }
`;

const FilterGrid = styled.div<{ $isCollapsed: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  transition: max-height 0.3s ease;
  overflow: hidden;
  max-height: ${(props) => (props.$isCollapsed ? "0" : "500px")};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    color: #34495e;
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const SearchInput = styled(Input)`
  grid-column: 1 / -1;
  font-size: 1rem;
  padding: 12px 16px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const MultiSelectContainer = styled.div`
  position: relative;
`;

const MultiSelectButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  max-height: 200px;
  overflow-y: auto;
`;

const DropdownItem = styled.label`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }

  input {
    margin-right: 8px;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: #3498db;
    color: white;
    border-color: #3498db;
    
    &:hover {
      background: #2980b9;
      border-color: #2980b9;
    }
  `
      : `
    background: white;
    color: #7f8c8d;
    border-color: #bdc3c7;
    
    &:hover {
      background: #f8f9fa;
    }
  `}
`;

interface FilterPanelProps {
  filters: FilterParams;
  availableFilters: AvailableFilters;
  onFiltersChange: (filters: FilterParams) => void;
  onExport: (format: "csv" | "json") => void;
  isLoading?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  availableFilters,
  onFiltersChange,
  onExport,
  isLoading = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [eventTypeDropdownOpen, setEventTypeDropdownOpen] = useState(false);

  const handleFilterChange = useCallback(
    (key: keyof FilterParams, value: any) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const handleMultiSelectChange = (
    key: "company_ids" | "event_types",
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[key] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const getMultiSelectDisplay = (
    values: string[] | undefined,
    placeholder: string
  ) => {
    if (!values || values.length === 0) return placeholder;
    if (values.length === 1) return values[0];
    return `${values.length} selected`;
  };

  return (
    <FilterContainer>
      <FilterHeader>
        <h3>🔍 Filters & Search</h3>
        <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? "Show Filters" : "Hide Filters"}
        </ToggleButton>
      </FilterHeader>

      <FilterGrid $isCollapsed={isCollapsed}>
        <FilterGroup style={{ gridColumn: "1 / -1" }}>
          <label>Search Events</label>
          <SearchInput
            type="text"
            placeholder="Search in content, attributes, values, companies..."
            value={filters.search_text || ""}
            onChange={(e) =>
              handleFilterChange("search_text", e.target.value || undefined)
            }
          />
        </FilterGroup>

        <FilterGroup>
          <label>Start Date</label>
          <Input
            type="date"
            value={filters.start_date || ""}
            min={availableFilters.date_range?.min}
            max={availableFilters.date_range?.max}
            onChange={(e) =>
              handleFilterChange("start_date", e.target.value || undefined)
            }
          />
        </FilterGroup>

        <FilterGroup>
          <label>End Date</label>
          <Input
            type="date"
            value={filters.end_date || ""}
            min={availableFilters.date_range?.min}
            max={availableFilters.date_range?.max}
            onChange={(e) =>
              handleFilterChange("end_date", e.target.value || undefined)
            }
          />
        </FilterGroup>

        <FilterGroup>
          <label>Companies</label>
          <MultiSelectContainer>
            <MultiSelectButton
              type="button"
              onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
            >
              {getMultiSelectDisplay(filters.company_ids, "All Companies")} ▼
            </MultiSelectButton>
            <DropdownMenu $isOpen={companyDropdownOpen}>
              {availableFilters.companies?.map((company) => (
                <DropdownItem key={company}>
                  <input
                    type="checkbox"
                    checked={filters.company_ids?.includes(company) || false}
                    onChange={(e) =>
                      handleMultiSelectChange(
                        "company_ids",
                        company,
                        e.target.checked
                      )
                    }
                  />
                  {company}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </MultiSelectContainer>
        </FilterGroup>

        <FilterGroup>
          <label>Event Types</label>
          <MultiSelectContainer>
            <MultiSelectButton
              type="button"
              onClick={() => setEventTypeDropdownOpen(!eventTypeDropdownOpen)}
            >
              {getMultiSelectDisplay(filters.event_types, "All Event Types")} ▼
            </MultiSelectButton>
            <DropdownMenu $isOpen={eventTypeDropdownOpen}>
              {availableFilters.event_types?.map((eventType) => (
                <DropdownItem key={eventType}>
                  <input
                    type="checkbox"
                    checked={filters.event_types?.includes(eventType) || false}
                    onChange={(e) =>
                      handleMultiSelectChange(
                        "event_types",
                        eventType,
                        e.target.checked
                      )
                    }
                  />
                  {eventType}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </MultiSelectContainer>
        </FilterGroup>
      </FilterGrid>

      <FilterActions>
        <ActionButton $variant="secondary" onClick={clearFilters}>
          Clear All
        </ActionButton>
        <ActionButton
          $variant="primary"
          onClick={() => onExport("csv")}
          disabled={isLoading}
        >
          📊 Export CSV
        </ActionButton>
        <ActionButton
          $variant="primary"
          onClick={() => onExport("json")}
          disabled={isLoading}
        >
          📄 Export JSON
        </ActionButton>
      </FilterActions>
    </FilterContainer>
  );
};
