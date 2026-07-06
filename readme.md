# Dockerized Todo Application

This is a fullstack Todo application consisting of a React frontend (Vite), Node.js/Express backend, and a PostgreSQL database. The entire environment is containerized and orchestrated using Docker Compose.

## Project Structure

```text
├── backend/               # Express API and Database connection logic
├── frontend/              # React (Vite) User Interface
├── docker-compose.yml     # Docker Compose orchestration config
├── .env.example           # Template for environment variables
└── .gitignore             # Root gitignore rules
```

## Prerequisites

Make sure you have the following installed on your machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

Follow these steps to run the application locally:

### 1. Configure Environment Variables

Copy the template `.env.example` to `.env` in the root folder:

```bash
cp .env.example .env
```

Open the newly created `.env` file and configure your database credentials and ports as desired.

### 2. Run the Application

Start all services (frontend, backend, postgres) in detached mode and build the container images:

```bash
docker compose up -d --build
```

Docker Compose will handle the service dependencies:
- **Postgres** starts first.
- **Backend** waits until Postgres is healthy and ready to accept connections (healthcheck validated).
- **Frontend** starts.

### 3. Access the Services

Once the containers are running and healthy, you can access them at:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/db-test](http://localhost:5000/db-test)

### 4. Stopping the Services

To stop and remove the containers, run:

```bash
docker compose down
```
