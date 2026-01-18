# Workshop Management System

A production-grade automotive workshop management system built with Angular 17 and Spring Boot 3.

## 🚀 Features

- **Customer Management** - Create, update, and manage customer profiles
- **Vehicle Tracking** - Register vehicles with VIN, make, model, and service history
- **Work Orders** - Create and track repair jobs with status workflow
- **Invoice Generation** - Generate and manage invoices with payment tracking
- **Dashboard** - Real-time metrics and quick actions
- **Authentication** - JWT-based security with role-based access control (Admin, Mechanic, Receptionist)

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 17, TypeScript, Angular Material |
| Backend | Spring Boot 3.2, Java 17, Spring Security |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |
| API Docs | Swagger/OpenAPI |

## 📋 Prerequisites

- Docker & Docker Compose
- (Optional) Java 17 and Node.js 20 for local development

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended - Easiest)

**Prerequisites:**
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Ensure Docker is running

**Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/RahisRazak/Workshop.git
cd Workshop

# 2. Start all services (this will take a few minutes on first run)
docker-compose up --build

# 3. Wait for all services to start (you'll see "Started WorkshopManagementApplication")

# 4. Access the application
# Frontend: http://localhost (or http://localhost:80)
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

**To stop the application:**
```bash
# Press Ctrl+C in the terminal, then run:
docker-compose down
```

### Option 2: Local Development (Frontend + Backend Separately)

**Prerequisites:**
- Java 17 ([Download](https://adoptium.net/))
- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))

#### Step 1: Setup PostgreSQL Database

```bash
# Create database
createdb workshop_db

# Or using psql:
psql -U postgres
CREATE DATABASE workshop_db;
\q
```

#### Step 2: Run Backend

```bash
# Navigate to backend directory
cd backend

# Update application.yml with your PostgreSQL credentials if needed
# File: src/main/resources/application.yml

# Run the application
./mvnw spring-boot:run

# Backend will start on http://localhost:8080
```

#### Step 3: Run Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies (only needed first time)
npm install

# Start development server
npm start

# Frontend will start on http://localhost:4200
```

### Option 3: Docker Backend + Local Frontend (Hybrid)

```bash
# Start only PostgreSQL and Backend with Docker
docker-compose up postgres backend --build

# In another terminal, run frontend locally
cd frontend
npm install
npm start
```

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Mechanic | mechanic | mechanic123 |
| Receptionist | receptionist | receptionist123 |

## 🧪 Running Tests

### Frontend Tests

```bash
cd frontend

# Run tests once
npm test -- --no-watch --browsers=ChromeHeadless

# Run tests in watch mode
npm test
```

### Backend Tests

```bash
cd backend
./mvnw test
```

## 🐛 Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Stop all running containers
docker-compose down

# Check what's using the port
lsof -i :8080  # or :80 for frontend
```

**Database connection errors:**
```bash
# Reset Docker volumes
docker-compose down -v
docker-compose up --build
```

### Local Development Issues

**Backend won't start:**
- Ensure PostgreSQL is running
- Check database credentials in `backend/src/main/resources/application.yml`
- Verify Java 17 is installed: `java -version`

**Frontend won't start:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `rm -rf .angular`
- Verify Node.js version: `node -v` (should be 20+)

## 📁 Project Structure

```
Workshop/
├── backend/                    # Spring Boot application
│   ├── src/main/java/
│   │   └── com/workshop/management/
│   │       ├── config/         # Configuration classes
│   │       ├── controller/     # REST controllers
│   │       ├── dto/            # Data transfer objects
│   │       ├── entity/         # JPA entities
│   │       ├── exception/      # Custom exceptions
│   │       ├── repository/     # Data repositories
│   │       ├── security/       # JWT authentication
│   │       └── service/        # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                   # Angular application
│   ├── src/app/
│   │   ├── core/               # Services, guards, interceptors
│   │   ├── shared/             # Models, components
│   │   └── features/           # Feature modules
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/register` | POST | User registration |
| `/api/customers` | GET/POST | Customer management |
| `/api/vehicles` | GET/POST | Vehicle management |
| `/api/workorders` | GET/POST | Work order management |
| `/api/invoices` | GET/POST | Invoice management |
| `/api/dashboard` | GET | Dashboard metrics |

## 🔧 Local Development

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## 📄 License

MIT License
