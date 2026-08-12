# DepGraph

<div align="center">

### Graph-powered dependency risk visibility for engineering teams

Track vulnerable packages, trace transitive dependency paths, and understand project blast radius in one clean dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![Neo4j Driver](https://img.shields.io/badge/Neo4j_Driver-6.2.0-4581C3?logo=neo4j&logoColor=white)](https://www.npmjs.com/package/neo4j-driver)
[![License](https://img.shields.io/badge/License-MIT-informational)](#license)

</div>

---

## ✨ Overview

**DepGraph** is a security-focused dependency analysis interface built with **Next.js + React** and backed by a **graph database (CognoDB/Neo4j protocol)**.

It helps you:

- View vulnerabilities with severity and affected project count.
- Inspect projects and quickly see inherited risks.
- Open detailed impact analysis modals to trace dependency paths.
- Understand direct + transitive dependency relationships visually.

The app is designed to answer one question fast:

> **If a package is vulnerable, which projects are impacted and through what path?**

---

## 🖼️ Screenshots

> Add these files to your repo (recommended path: `docs/images/`) and keep the same names used below.

### Vulnerabilities view

![DepGraph Vulnerabilities View](docs/images/depgraph-vulnerabilities.png)

### Vulnerabilities (alternate capture)

![DepGraph Vulnerabilities Alt](docs/images/depgraph-vulnerabilities-2.png)

### Projects view

![DepGraph Projects View](docs/images/depgraph-projects.png)

---

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + CSS Modules + Global CSS
- **Icons:** lucide-react
- **Data Layer:** Neo4j-compatible driver (`neo4j-driver`) for CognoDB
- **Config/Env:** dotenv (for seeding script)

Language composition:

- **CSS:** 50.6%
- **JavaScript:** 49.4%

---

## 📁 Repository Structure

```text
depgraph/
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   └── seed.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── page.module.css
│   └── lib/
│       └── db.js
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
└── README.md
```

---

## 🔍 Code & Architecture Analysis

### 1) Frontend flow (`src/app/page.js`)

The main dashboard component:

- Uses `useEffect` to fetch initial datasets from:
  - `GET /api/projects`
  - `GET /api/vulnerabilities`
- Maintains UI state for:
  - active tab (`vulnerabilities` / `projects`)
  - loading + error handling
  - selected card modal
  - modal dependency impact results
- Supports two modal drill-downs:
  - CVE → impacted projects via `/api/impact?cve_id=...`
  - Project → inherited vulnerabilities via `/api/projects/:id`

This gives a simple but powerful exploratory workflow for security triage.

### 2) Styling system (`src/app/page.module.css`, `src/app/globals.css`)

- Dark, modern, glass-like UI design.
- Card-based information hierarchy for fast scanning.
- Severity badges (Critical / High / Medium / etc.) visually communicate risk.
- Responsive layout and modal overlays improve detail inspection.

### 3) App shell (`src/app/layout.js`)

- Central metadata definition for title/description.
- Root HTML/body wrapper for all routes.

### 4) Database connectivity (`src/lib/db.js`)

- Centralized graph DB connection logic (Neo4j-compatible driver).
- Designed to support API route queries for dependencies and vulnerability mapping.

### 5) Seed script (`scripts/seed.js`)

The script initializes full demo graph data by:

- Clearing current graph (`MATCH (n) DETACH DELETE n`).
- Creating node sets:
  - `Project`
  - `Package`
  - `Vulnerability`
- Creating relationships:
  - `(:Project)-[:DEPENDS_ON]->(:Package)`
  - `(:Package)-[:DEPENDS_ON]->(:Package)` (transitive)
  - `(:Package)-[:HAS_VULNERABILITY]->(:Vulnerability)`

Included sample CVEs:

- `CVE-2021-44228` (Log4Shell)
- `CVE-2023-45857` (Axios SSRF)
- `CVE-2021-23337` (lodash.template)

This data model is ideal for path traversal queries and blast-radius analysis.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm
- Access to a Neo4j-compatible endpoint (CognoDB)

### 1) Clone & install

```bash
git clone https://github.com/SAKMOTO/depgraph.git
cd depgraph
npm install
```

### 2) Configure environment

Create `.env.local` in the project root:

```env
COGNO_URI=your_database_uri
COGNO_PASSWORD=your_database_password
```

> The seed script uses `cognodb` as the username and reads URI/password from env vars.

### 3) Seed the graph data

```bash
node scripts/seed.js
```

### 4) Run locally

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## 🧪 Available Scripts

From `package.json`:

- `npm run dev` → start development server
- `npm run build` → production build
- `npm run start` → run production server
- `npm run lint` → run ESLint

---

## 🔌 API Surface (used by UI)

The UI currently depends on these endpoints under `src/app/api/`:

- `GET /api/projects`
- `GET /api/vulnerabilities`
- `GET /api/impact?cve_id=<id>`
- `GET /api/projects/:id`

These endpoints provide the data contracts consumed by dashboard cards and modal drill-downs.

---

## 🚀 Why Graph Modeling Works Here

Dependency risk is naturally graph-shaped:

- Projects connect to many packages.
- Packages depend on other packages.
- Vulnerabilities can appear at any depth.

Using a graph model makes **path tracing**, **impact analysis**, and **blast-radius reporting** efficient and explainable.

---

## 🛠️ Improvement Ideas

- Add authentication + role-based views.
- Add CVSS scoring and sorting.
- Add timeline/history of vulnerability ingestion.
- Export impact reports (CSV/PDF).
- Add automated ingestion from advisories (GitHub Advisory DB, osv.dev).

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## 📄 License

MIT License (recommended). Add a `LICENSE` file if you want this badge to represent an explicit license in-repo.
