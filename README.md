# 🎓 EduMate — AI-Powered Learning Intelligence Platform

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-24+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220.svg)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)
![Stars](https://img.shields.io/github/stars/thiru2935/Edumate?style=social)
![Forks](https://img.shields.io/github/forks/thiru2935/Edumate?style=social)
![Contributors](https://img.shields.io/github/contributors/thiru2935/Edumate)

**A full-stack role-based learning platform with AI-ready architecture, focus analytics, mentoring chat, and teacher-led learning operations.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

## 🌐 Live Demo

> 🚧 Add your deployed URL once available:
>
> `https://your-edumate-demo-url.com`

---

## 📋 Overview

**EduMate** is a modern full-stack monorepo designed to support digital learning journeys for students, mentors, and teachers.

It combines:

- role-based dashboards
- focus session tracking and points
- mentoring chat workflows
- teacher controls for points/materials
- strongly typed API contracts generated from OpenAPI

The project is built for local-first developer experience in VS Code with clean workspace boundaries and reusable shared libraries.

---

## 🖼 Showcase

> Replace these placeholders with your actual screenshots/GIFs.

### Hero Banner

```md
![EduMate Banner](./attached_assets/banner-edumate.png)
```

### Product Screens

```md
![Student Dashboard](./attached_assets/student-dashboard.png)
![Mentor Chat](./attached_assets/mentor-chat.png)
![Teacher Overview](./attached_assets/teacher-overview.png)
```

### Optional Demo GIF

```md
![EduMate Demo](./attached_assets/edumate-demo.gif)
```

---

## ⚡ Quick Preview

- 🔐 JWT authentication with role-aware navigation
- 🧠 Focus session tracking with point rewards
- 💬 Mentor/student real-time-style chat experience
- 📚 Study material management for teachers
- 🏆 Leaderboard + dashboard analytics
- 🧩 OpenAPI-driven API client + Zod schemas (single source of truth)

---

## ✨ Features

### 👥 Role-Based Experience
- **Student dashboard** with focus metrics, streaks, rank, sessions
- **Mentor dashboard** with student list + chat workflows
- **Teacher dashboard** with leaderboard, student management, materials

### ⏱ Focus & Performance Tracking
- Create and list study sessions
- Earn focus points automatically
- Track progress via summary + leaderboard endpoints

### 💬 Learning Collaboration
- Peer/mentor chat by user ID
- Role-aware connect workflows
- Structured API for message retrieval and sending

### 🛠 Teacher Operations
- Update student focus points
- Upload and manage study materials
- Monitor aggregate platform overview

### 🔌 Contract-First API Tooling
- OpenAPI 3.1 spec in `lib/api-spec/openapi.yaml`
- Orval-generated React Query hooks in `lib/api-client-react`
- Orval-generated Zod validators in `lib/api-zod`

---

## 🛠 Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | Express 5 |
| Runtime | Node.js 24+ |
| Language | TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Logging | Pino + pino-http |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Language | TypeScript |
| Routing | Wouter |
| Data Fetching | TanStack Query |
| UI | Tailwind CSS + Radix UI |

### API & Shared Libraries
| Component | Technology |
|-----------|-----------|
| API Spec | OpenAPI 3.1 |
| Codegen | Orval |
| Validation | Zod |
| Monorepo | pnpm workspaces |

---

## 📁 Project Structure

```text
EduMate/
├── artifacts/
│   ├── api-server/          # Express API application
│   ├── edumate/             # Main React web application
│   └── mockup-sandbox/      # Optional UI sandbox app
├── lib/
│   ├── api-spec/            # OpenAPI source + Orval config
│   ├── api-client-react/    # Generated React Query API client
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle schema + db runtime
├── scripts/                 # Utility workspace scripts
├── package.json             # Root scripts (dev/build/typecheck)
├── pnpm-workspace.yaml      # Workspace definitions and catalog
└── tsconfig*.json           # Shared TS configuration
```

---

## 🚀 Installation

### Prerequisites
- Node.js `24+`
- pnpm (`corepack enable` recommended)
- PostgreSQL running locally

### Setup Steps

1. **Clone repository**
	```bash
	git clone https://github.com/thiru2935/Edumate.git
	cd Edumate
	```

2. **Install dependencies**
	```bash
	pnpm install
	```

3. **Configure environment**
	```bash
	cp .env.example .env
	```
	Update values in `.env`:
	```env
	DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/heliumdb
	API_PORT=8080
	SESSION_SECRET=replace-with-a-secure-random-string
	LOG_LEVEL=info
	EDUMATE_PORT=8081
	EDUMATE_BASE_PATH=/
	MOCKUP_PORT=3000
	MOCKUP_BASE_PATH=/
	```

4. **Apply DB schema**
	```bash
	pnpm --filter @workspace/db run push
	```

5. **Run services**
	```bash
	# Terminal 1
	pnpm run dev:api

	# Terminal 2
	pnpm run dev:web
	```

6. **Open application**
	- Frontend: `http://localhost:8081`
	- API health: `http://localhost:8080/api/healthz`

---

## 📖 Usage

### For Students
1. Sign up / log in
2. Start focus sessions and earn points
3. Check rank, streak, and progress stats
4. Connect with mentors and chat

### For Mentors
1. Log in with mentor role
2. Browse students
3. Chat and guide students
4. Monitor leaderboard context

### For Teachers
1. Log in with teacher role
2. Adjust student focus points
3. Upload/manage study materials
4. Track overview analytics and top students

---

## 🔌 API Endpoints (Core)

Base path: `/api`

```http
POST /auth/signup
POST /auth/login
GET  /auth/me

GET  /users
GET  /users/:id
PATCH /users/:id/focus-points

GET  /sessions
POST /sessions

GET  /materials
POST /materials

GET  /chats/:userId
POST /chats/:userId

GET  /dashboard/student-summary
GET  /dashboard/leaderboard
GET  /dashboard/teacher-overview

GET  /healthz
```

---

## 🏗 Architecture

### Data & Contract Flow
1. OpenAPI spec is authored in `lib/api-spec`
2. Orval generates:
	- frontend API hooks (`lib/api-client-react`)
	- runtime validators (`lib/api-zod`)
3. API routes in `artifacts/api-server` use shared validators and DB package
4. Frontend consumes generated hooks for strongly typed API interaction

### DB Domain Models
- `users`
- `sessions`
- `materials`
- `chats`

All schema definitions are managed in `lib/db/src/schema` and shared across workspace packages.

### System Diagram

```mermaid
flowchart LR
	U[Users\nStudent / Mentor / Teacher] --> FE[React App\nartifacts/edumate]
	FE -->|HTTP /api| API[Express API\nartifacts/api-server]
	API --> DB[(PostgreSQL)]
	API --> Z[Zod Schemas\nlib/api-zod]
	FE --> C[Generated Client\nlib/api-client-react]
	C -. generated from .-> OAS[OpenAPI Spec\nlib/api-spec/openapi.yaml]
	API --> D[Drizzle ORM\nlib/db]
```

---

## 📜 Scripts

```bash
pnpm run dev:api        # run API server
pnpm run dev:web        # run main web app
pnpm run dev:mockup     # run sandbox app
pnpm run typecheck      # full workspace typecheck
pnpm run build          # workspace build pipeline

pnpm --filter @workspace/db run push           # apply DB schema
pnpm --filter @workspace/api-spec run codegen  # regenerate API client + zod
```

---

## 🔐 Demo Accounts

Password for all demo users: `password123`

- `alex@edumate.app` — Student
- `sarah@edumate.app` — Mentor
- `james@edumate.app` — Teacher

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Commit with clear messages
4. Open a pull request

### Development Notes
- Keep workspace boundaries clean
- Run `pnpm run typecheck` before PR
- Update API spec + regenerate client/zod when changing endpoint contracts

---

## 🗺 Roadmap

- [ ] Add test suite coverage for API and role flows
- [ ] Improve chat UX and live updates
- [ ] Add richer analytics widgets
- [ ] Add production deployment docs
- [ ] Expand teacher workflow automation

---

## 📝 License

MIT

---

## 💬 Support

- 📧 Email: `thiru291435@gmail.com`
- 🐛 Issues: https://github.com/thiru2935/Edumate/issues

---

<div align="center">

**Built with ❤️ by Thirunavukarasu**

[⬆ Back to top](#-edumate--ai-powered-learning-intelligence-platform)

</div>
