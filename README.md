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

### Using Docker Compose (Recommended)

```bash
# Clone and navigate to project
cd Workshop

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Mechanic | mechanic | mechanic123 |
| Receptionist | receptionist | receptionist123 |

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
