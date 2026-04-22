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

### Demo

![EduMate Demo](./attached_assets/edumate-demo.gif)

### Homepage

![EduMate Banner](./attached_assets/1.png)
![EduMate Banner](./attached_assets/2.png)
![EduMate Banner](./attached_assets/3.png)
![EduMate Banner](./attached_assets/4.png)
![EduMate Banner](./attached_assets/5.png)
![EduMate Banner](./attached_assets/6.png)

### Login

![Login](./attached_assets/7.png)
![Login](./attached_assets/7-2.png)

### Student

![Student Dashboard](./attached_assets/8.png)
![Student Dashboard](./attached_assets/9.png)
![Student Dashboard](./attached_assets/10.png)
![Student Dashboard](./attached_assets/11.png)
![Student Dashboard](./attached_assets/12.png)
![Student Dashboard](./attached_assets/13.png)

### Mentor

![Mentor Chat](./attached_assets/14.png)
![Mentor Chat](./attached_assets/15.png)

### Teacher

![Teacher Overview](./attached_assets/16.png)
![Teacher Overview](./attached_assets/17.png)
![Teacher Overview](./attached_assets/18.png)



## ⚡ Quick Preview

- 🔐 JWT authentication with role-aware navigation
- 🧠 3-level focus engine with adaptive scoring (`consistency + focus quality + recall`)
- 🛡 Session integrity scoring (`0-100`) with anti-cheat confidence controls
- 👁 Eye-health recovery intelligence (mandatory breaks, 20-20-20 reminders, screen-light mode)
- 💬 Mentor/student real-time-style chat experience
- 📚 Study material management for teachers
- 🏆 Leaderboard + intervention-ready teacher analytics
- 🧩 OpenAPI-driven API client + Zod schemas (single source of truth)

---

## ✨ Features

### 👥 Role-Based Experience
- **Student dashboard** with focus metrics, streaks, rank, sessions
- **Mentor dashboard** with student list + chat workflows
- **Teacher dashboard** with leaderboard, student management, materials

### ⏱ Focus & Performance Tracking
- 3-level focus modes: Warm-up, Deep, Mastery
- Per-session transparency with points breakdown history
- Weekly trend charts for points + integrity
- Adaptive level quality formula:

	$$
		ext{levelScore} = 0.4 \cdot \text{consistency} + 0.3 \cdot \text{focusQuality} + 0.3 \cdot \text{recallAccuracy}
	$$

- Reflection notes required for low-integrity sessions

### 🛡 Anti-Cheat & Trust Layer
- Tracks tab switching, window blur, idle bursts, and interaction quality
- Computes `sessionIntegrityScore` (`0-100`)
- Applies integrity multiplier to points for suspicious sessions
- Soft moderation hooks:
	- reflection requirement
	- mentor review flagging
	- anti-cheat telemetry events

### 👁 Recovery Intelligence
- Mandatory post-session break locks
- 20-20-20 eye reminder cycles
- Fatigue risk scoring
- Screen-light day mode (audio-first learning flow)
- Smart suggestions for shorter sessions / longer breaks

### 💬 Learning Collaboration
- Peer/mentor chat by user ID
- Role-aware connect workflows
- Structured API for message retrieval and sending

### 🛠 Teacher Operations
- Update student focus points
- Upload and manage study materials
- Monitor intervention intelligence:
	- at-risk students
	- improving students
	- drifting students (high idle + low recall)
	- stressed students (high pause rate + late-night patterns)

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
- `focus_events`
- `materials`
- `chats`

All schema definitions are managed in `lib/db/src/schema` and shared across workspace packages.

### Session Analytics Captured

`sessions` now stores detailed explainability and quality signals, including:

- points components (`pointsBase`, bonuses, penalties, integrity multiplier)
- focus metrics (`focusScore`, `focusChecks`, `focusedChecks`)
- anti-cheat metrics (`tabSwitchCount`, `windowBlurCount`, `idleIncidentCount`, `idleSeconds`)
- behavior metrics (`mouseMoves`, `scrollEvents`, `keyPresses`, `pauseCount`, `behaviorScore`)
- quality metrics (`sessionIntegrityScore`, `consistencyScore`, `recallAccuracy`, `fatigueRiskScore`)
- moderation flags (`reflectionRequired`, `mentorReviewFlagged`, `reflectionNote`)

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
- For contract/schema changes, regenerate declaration outputs before app typechecks:
	- `pnpm exec tsc -p lib/db/tsconfig.json`
	- `pnpm exec tsc -p lib/api-zod/tsconfig.json`
	- `pnpm exec tsc -p lib/api-client-react/tsconfig.json`
- Apply DB schema updates with:
	- `pnpm --filter @workspace/db run push`

---

## 🗺 Roadmap

- [ ] Add test suite coverage for API and role flows
- [ ] Improve chat UX and live updates
- [x] Add richer focus analytics widgets
- [x] Add session integrity + anti-cheat confidence scoring
- [x] Add teacher intervention intelligence panels
- [x] Add telemetry event schema (`focus_events`)
- [ ] Add background jobs for daily/weekly analytics aggregates
- [ ] Add feature flags for scoring/anti-cheat modes
- [ ] Add rate-limit + abuse detection hardening at edge/proxy layer
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
