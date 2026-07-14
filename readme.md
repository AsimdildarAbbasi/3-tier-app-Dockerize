# 🚀 Production-Ready 3-Tier Todo Application & CI/CD Pipeline

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/asimabbasi1029/todo-app/buil.yaml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=CI%2FCD%20Pipeline)](https://github.com/asimabbasi1029/todo-app/actions)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-Repository-blue?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/u/asimabbasi1029)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Postgres-orange?style=for-the-badge&logo=react&logoColor=white)](https://github.com/asimabbasi1029/todo-app)
[![AWS EC2](https://img.shields.io/badge/AWS-EC2%20Deployment-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](http://13.235.94.22:3000)

A enterprise-grade, fully containerized **3-Tier Task Management System** featuring a high-performance **React (Vite)** frontend, a robust **Node.js/Express** REST API backend, and a transactional **PostgreSQL** database. 

The repository includes a production-ready, fully automated **CI/CD Pipeline** built via GitHub Actions that handles compilation, automated quality checks, multi-architecture Docker image builds, automated publishing to Docker Hub, and seamless zero-downtime deployments to **AWS EC2**.

---

## 🗺️ System & Network Architecture

The application is orchestrated locally using Docker Compose networks to isolate container communication, exposing only the necessary ports to the outside world.


## 🛠️ CI/CD GitOps Pipeline Flow

The GitHub Actions workflow automates the entire delivery process upon a push to the `main` branch.

```mermaid
flowchart TD
    Developer([💻 Dev Push to Main]) --> Git[🐙 GitHub Repository]
    
    subgraph GitHub Actions Runner (Build & Test)
        Git -->|Triggers| CI[🚀 CI Workflow]
        CI --> Checkout[📥 Checkout Repository]
        Checkout --> SetupNode[🟢 Setup Node.js v22]
        SetupNode --> InstFE[📦 Install & Build Frontend]
        InstFE --> InstBE[📦 Install Backend Dependencies]
        InstBE --> DockerBuild[🐳 Build Docker Images]
        DockerBuild --> DockerLogin[🔑 Login to Docker Hub]
        DockerLogin --> DockerPush[📤 Push Images to Registry]
    end

    subgraph Target Host (AWS EC2)
        DockerPush -->|Triggers CD| SSH[🔑 SSH via Appleboy Action]
        SSH --> Pull[📥 Pull New Images]
        Pull --> Redeploy[🔄 Graceful Container Restart]
        Redeploy --> Prune[🧹 Cleanup Idle Images]
    end

    classDef build fill:#1a73e8,stroke:#fff,stroke-width:1px,color:#fff;
    classDef target fill:#ff9900,stroke:#fff,stroke-width:1px,color:#fff;
    class Checkout,SetupNode,InstFE,InstBE,DockerBuild,DockerLogin,DockerPush build;
    class SSH,Pull,Redeploy,Prune target;
```

---

## 📁 Repository Structure

```text
├── .github/
│   └── workflows/
│       └── buil.yaml               # CI/CD Workflow configuration (Build, Push & Deploy)
├── backend/
│   ├── db.js                       # PostgreSQL client pool & automatic schema setup
│   ├── server.js                   # Node.js/Express API server & CORS configurations
│   ├── Dockerfile                  # Lightweight Alpine-based Node.js runtime Dockerfile
│   ├── package.json
│   └── .env.example                # Template environment variables for Backend
├── frontend/
│   └── @latest/                    # Vite React SPA Root
│       ├── src/                    # App source code (Components, Styles, State)
│       ├── Dockerfile              # Multi-stage/Build preview container runner
│       ├── package.json
│       └── vite.config.js          # Vite build configurations
├── docker-compose.yml              # Local Development build & run orchestrator
├── docker-compose-prod.yml         # Production Registry-oriented orchestration
├── .env.example                    # Global environment variables template
└── readme.md                       # Comprehensive project documentation
```

---

## 🔑 Environment Variables Configuration

To run the application, create a `.env` file in the project root directory. Here is an overview of the required environment configuration parameters:

| Variable | Default Value | Purpose / Description |
| :--- | :--- | :--- |
| `DB_USER` | `postgres` | Username for database administrator access |
| `DB_PASSWORD` | `your_secure_password` | Master password for PostgreSQL credentials authorization |
| `DB_NAME` | `postgres` | Target schema database name created on database startup |
| `DB_PORT` | `5432` | Internal database server interface communication port |
| `DB_HOST` | `postgres` | Host address (`postgres` container service alias within Docker network) |
| `DB_SSL` | `false` | Enables secure SSL encrypted connection configurations |
| `PORT` | `3000` | The backend Express application inner interface port |

---

## 💻 Local Development Setup

### Prerequisites

Ensure you have the following software suites installed on your machine:
* **Docker Engine** (v20.10.0 or higher)
* **Docker Compose** (v2.0.0 or higher)
* **Node.js** (v20+ if executing locally outside containers)

### Quick Start Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/asimabbasi1029/todo-app.git
   cd todo-app
   ```

2. **Initialize Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to supply your desired database password and port mappings.*

3. **Orchestrate Local Stack**
   ```bash
   docker compose up -d --build
   ```
   *This command installs dependencies internally, builds local Dockerfiles, provisions the database storage volume, and brings up the services.*

4. **Verify Application Functionality**
   * **Frontend App UI**: [http://localhost:3000](http://localhost:3000)
   * **Express API Server**: [http://localhost:5000](http://localhost:5000)
   * **Database Health-Check**: [http://localhost:5000/db-test](http://localhost:5000/db-test)

5. **Stop Local Environment**
   ```bash
   docker compose down -v
   ```
   *The `-v` flag tears down containers and removes ephemeral database volumes to start with a clean state.*

---

## 🚀 Production Deployment & CI/CD Pipeline

The production pipeline utilizes **GitHub Actions** for CI/CD and deploys code changes straight to **AWS EC2**.

### 1. Required GitHub Actions Secrets

To enable the pipeline, configure the following secrets in your repository settings (**Settings > Secrets and variables > Actions**):

| Secret Name | Value Example | Description |
| :--- | :--- | :--- |
| `DOCKERHUB_USERNAME` | `asimabbasi1029` | Your Docker Hub account ID |
| `DOCKERHUB_TOKEN` | `dckr_pat_...` | Docker Hub Personal Access Token (PAT) with write permissions |
| `EC2_HOST` | `13.235.94.22` | Public IPv4 Address or DNS name of your AWS EC2 instance |
| `EC2_USER` | `ubuntu` | SSH administrative login user (e.g., `ubuntu` or `ec2-user`) |
| `EC2_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Private Key file (`.pem`) used to authenticate SSH connection |

### 2. CI/CD Pipeline Execution Walkthrough

Upon any `git push` to the `main` branch, the workflow automates the following steps:

#### **Stage 1: Build & Package** (`build`)
1. **Repository Checkout**: Imports the latest codebase using `actions/checkout@v4`.
2. **Environment Initialization**: Installs Node.js runtime environment (v22).
3. **Dependency Compilation**: Compiles the frontend assets to Static HTML/JS.
4. **Container Image Generation**:
   * Generates the React production image tagged as `todo-frontend:latest`.
   * Generates the Express API image tagged as `todo-backend:latest`.
5. **Registry Deployment**: Authenticates against Docker Hub using the configured secrets and pushes both production images to your Docker registry.

#### **Stage 2: Target Deploy** (`deploy`)
1. **EC2 Shell Connection**: Connects to the host using SSH keys (`appleboy/ssh-action`).
2. **Pull Registry Updates**: Navigates to the app directory (`~/todo-app`) and pulls the newly uploaded Docker images using `docker-compose-prod.yml`.
3. **Zero-Downtime Recreation**: Re-runs container orchestration. The service runs without losing databases since Postgres storage volume is persistent.
4. **Environment Sanitation**: Automatically prunes outdated, untagged, and orphaned images using `docker image prune -f` to optimize host disk usage.

---

## 🛠️ Diagnostics & Operations Cheat Sheet

Use these operations commands to manage and debug the deployment:

### Check Container Status
```bash
# Check status of local containers
docker compose ps

# Check status of production containers on the EC2 server
docker compose -f docker-compose-prod.yml ps
```

### Inspect Application Logs
```bash
# Follow real-time backend API logs
docker compose logs -f backend

# View Postgres Database engine logs
docker compose logs -f postgres
```

### Manually Access PostgreSQL DB inside Container
```bash
# Execute psql CLI tool directly in postgres container
docker exec -it postgres psql -U postgres -d postgres

# Query existing tasks to verify database transaction integration
SELECT id, title, completed, created_at FROM todos;
```

---

## 👨‍💻 Developer & Author

* **Created by**: Asim Abbasi
* **Role**: Cloud & DevOps Engineer
* **GitHub**: [@asimabbasi1029](https://github.com/asimabbasi1029)
* **Status**: Production Deployment Live & Monitored
