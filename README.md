# Digital Factory — Project & Internship Management

A full-stack application for organizing projects, coordinating supervisors and interns, and following work from assignment to review. Digital Factory brings role-specific dashboards, task discussions, deliverable links, live notifications, and AI-assisted project planning into one workspace.

## Features

| Role | Workspace capabilities |
| --- | --- |
| Super admin | Manage users and projects, assign supervisors, view dashboard statistics and recent activity, and generate project drafts with AI. |
| Supervisor | View assigned projects, create and assign tasks, track progress, discuss work, and browse the team directory. |
| Intern | View assigned tasks, update progress, submit deliverable links, participate in task discussions, and track work from a personal dashboard. |

- **Task workflow:** `TODO` → `IN_PROGRESS` → `IN_REVIEW` → `COMPLETED`.
- **AI-assisted planning:** turn a project idea into a draft with suggested tasks, then review and confirm it before saving.
- **Live notifications:** STOMP over WebSocket, with unread notification retrieval and mark-as-read actions.
- **Authentication:** JWT-based login, BCrypt password hashing, and role-based API access.
- **Delivery pipeline:** Jenkins builds, dependency and image scans, SonarQube analysis, and Docker deployment.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Axios |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA, Lombok |
| Database | PostgreSQL; H2 for the Spring context test |
| Real-time messaging | Spring WebSocket, STOMP |
| AI integration | Configurable chat-completions HTTP endpoint |
| Build and delivery | pnpm, Maven, Docker, Nginx, Jenkins |
| Quality tooling | Oxlint, JaCoCo, SonarQube, OWASP Dependency-Check, Gitleaks, Trivy |

Dependency versions are defined in [frontend/package.json](frontend/package.json) and [backend/pom.xml](backend/pom.xml).

## Repository structure

```text
backend/
  src/main/java/com/digitalfactory/platform/
    config/         Spring, security, and WebSocket configuration
    controller/     REST endpoints
    dto/            Request and response models
    model/          Persistence entities and enums
    repository/     Database access
    security/       JWT authentication
    service/        Application logic
  src/main/resources/application.yml
  src/test/         Spring application-context test
  Dockerfile
  pom.xml
frontend/
  src/
    components/     Shared UI components
    context/        Notification context
    lib/            API client and shared utilities
    pages/          Admin, supervisor, intern, and login screens
    store/          Client state
    types/          TypeScript models
  Dockerfile
  nginx.conf
  package.json
Jenkinsfile
```

## Run locally

### Prerequisites

- JDK 21, with `JAVA_HOME` pointing to that installation.
- Node.js 22.12 or newer and pnpm installed.
- PostgreSQL running locally, with a database and user you can access.
- Maven, or the included Maven wrapper.
- An accessible chat-completions endpoint and its credentials to use AI drafting.

### 1. Get the code and create the database

```sh
git clone https://github.com/Nyckboy/digitalfactory-RAM.git
cd digitalfactory-RAM
```

In PostgreSQL, create a database using your database administration tool or SQL console:

```sql
CREATE DATABASE digitalfactory;
```

The configured database user needs permission to create and update tables in this database. The development configuration uses Hibernate's `ddl-auto: update` to manage tables when the backend starts.

### 2. Configure the backend

The tracked [application.yml](backend/src/main/resources/application.yml) activates the `local` profile by default. Create `backend/src/main/resources/application-local.yml`, which is excluded from Git, with your local values:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/digitalfactory
    username: "YOUR_DATABASE_USER"
    password: "YOUR_DATABASE_PASSWORD"

application:
  security:
    jwt:
      secret-key: "YOUR_BASE64_ENCODED_RANDOM_SECRET"

ai:
  api:
    url: "http://localhost:3002/v1/chat/completions"
    key: "YOUR_AI_API_KEY"
  model: "YOUR_MODEL_NAME"
```

Generate a JWT secret containing 32 random bytes, encoded as Base64, with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Use the output for `secret-key`. Replace the AI URL, key, and model with values for your provider. These AI configuration properties must be present for application startup; the provider is contacted when an AI action is invoked. The example endpoint is not included in this repository.

The shared configuration sets token expiry to 24 hours. A standalone `backend/.env` file is not automatically loaded by the tracked configuration.

### 3. Start the backend

From `backend/`, on Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS or Linux:

```sh
sh ./mvnw spring-boot:run
```

Alternatively, use `mvn spring-boot:run` with an installed Maven. The backend listens on `http://localhost:8080` by default.

### 4. Provision the first admin

There is no public registration endpoint or automatic admin seed. A fresh database needs an initial active user with role `SUPER_ADMIN` before you can sign in and create additional users through the admin interface.

After the backend has created the tables, provision that user in the `users` table using your database administration tool. Supply a UUID, first and last name, email, a **BCrypt-encoded password** in `password_hash`, role `SUPER_ADMIN`, and `is_active = true`. Do not store a plaintext password. Use Spring Security's `BCryptPasswordEncoder` or a trusted local BCrypt tool to generate the hash.

### 5. Start the frontend

In a second terminal, from the repository root:

```sh
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173` and sign in with the account you provisioned.

The frontend defaults to the local backend. To override its addresses, create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_SOCKET_URL=ws://localhost:8080/ws/websocket
```

Restart Vite after changing these values. They are embedded at build time for a production build. Keep credentials out of `VITE_*` variables because those values are exposed to the browser.

The backend's current CORS configuration allows `http://localhost:5173`. If Vite selects another port, free port 5173 or update the allowed origin in `SecurityConfig.java`.

## Typical workflow

1. An admin creates supervisor and intern accounts.
2. The admin creates a project and assigns a supervisor, optionally starting from an AI-generated draft.
3. The supervisor creates tasks and assigns them to interns.
4. Interns update their tasks, discuss work, and attach deliverable URLs for review.
5. Supervisors follow progress and review work; dashboards and notifications help participants keep track of changes.

## API overview

| Route | Purpose | Access |
| --- | --- | --- |
| `POST /api/auth/login` | Authenticate and receive a JWT | Public |
| `/api/admin/**` | Users, projects, statistics, activity, and AI drafting | `SUPER_ADMIN` |
| `/api/supervisor/**` | Assigned projects, task management, comments, and team overview | `SUPERVISOR` |
| `/api/intern/**` | Assigned tasks, progress updates, comments, and dashboard | `INTERN` |
| `/api/notifications/**` | Unread notifications and read status | Authenticated users |
| `/ws` | WebSocket/SockJS endpoint for STOMP messaging | See WebSocket configuration |

Authenticated REST requests use `Authorization: Bearer <token>`. Endpoint definitions live in the [controllers](backend/src/main/java/com/digitalfactory/platform/controller).

## Build and checks

Run these commands from the corresponding directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `frontend/` | `pnpm lint` | Run Oxlint |
| `frontend/` | `pnpm build` | Type-check and build into `dist/` |
| `frontend/` | `pnpm preview` | Preview the built frontend locally |
| `backend/` | `mvn clean compile` | Compile the backend from scratch |
| `backend/` | `mvn test` | Run the application-context test and JaCoCo reporting |
| `backend/` | `mvn package` | Run tests and create the application JAR in `target/` |
| `backend/` | `mvn verify` | Also run the bound OWASP dependency check |

You can substitute the Maven wrapper for `mvn`. Use JDK 21 for the project toolchain. The current backend test checks Spring context startup with an H2 replacement database; it does not provide comprehensive feature coverage. Dependency scanning may require network access and vulnerability database configuration.

## Deployment

Both Dockerfiles package **existing build outputs**: build the backend JAR and frontend `dist/` directory before building images. The frontend is served by Nginx, whose configuration proxies `/api/` requests to `backend:8080`.

For the backend's `prod` profile, configure:

| Variable | Purpose |
| --- | --- |
| `SPRING_PROFILES_ACTIVE=prod` | Activate production configuration |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL location and database |
| `DB_USER`, `DB_PASSWORD` | Database credentials |
| `JWT_SECRET` | Base64-encoded signing secret |
| `AI_API_URL`, `AI_API_KEY` | AI endpoint and credentials |
| `AI_MODEL` | Override the configured model when required |

Set frontend API and WebSocket URLs before building. The included Nginx configuration only proxies the REST API; WebSocket connectivity needs a separately reachable backend URL or an added WebSocket proxy.

The [Jenkins pipeline](Jenkinsfile) includes build/test stages, Gitleaks, dependency scans, SonarQube, Docker image builds, Trivy scans, and deployment. It references environment-specific tool installations, credentials, network settings, and addresses that must be adapted for another deployment.

This repository currently contains the full application. A restricted portfolio demo is not implemented yet.
