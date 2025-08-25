# Assembly Analytics Dashboard

A modern, full-stack usage analytics dashboard built for Assembly's customer success teams. This application processes CSV usage data and provides interactive visalizations and insights.

## 🏗️ Architecture

### Backend (Go)
- **Architecture**: Layered design with clear separation of concerns
- **Repository Pattern**: Abstracted data access for easy testing and extension  
- **Service Layer**: Business logic separated from HTTP concerns
- **Dependency Injection**: Loosely coupled components
- **CSV Processing**: Parsing with multiple format support
- **RESTful API**: Well-structured endpoints with proper error handling

### Frontend (React + TypeScript)
- **Component-Based**: Small, focused components for maintainability
- **Styled Components**: CSS-in-JS for component-scoped styling
- **Chart Integration**: Recharts for interactive data visualization
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with CSS Grid

## 🛠️ Tech Stack

- **Backend**: Go 1.21, Gin Web Framework
- **Frontend**: React 18, TypeScript, Styled Components
- **Charts**: Recharts (built on D3.js)
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload, CORS configured

## 📊 Data Processing

The dashboard currently processes two types of usage data:

1. **Actions**: User interactions (logins, page visits, feature usage)
2. **Metrics**: Quantitative measurements (bank balances, transaction counts)
3. **Cumulative Metrics**: Aggregated values over time periods

### Supported CSV Formats
- Flexible header detection and normalization
- Mutiple timestamp format parsing
- Support for different CSV structures across files

## 🚦 Getting Started

### Prerequisites
- Docker & Docker Compose
- Your CSV data files

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd assembly-dashboard
