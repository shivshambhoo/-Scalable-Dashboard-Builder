# Scalable Dashboard Builder POC

A high-grade, fully decoupled, and schema-enforced Dashboard Builder Proof of Concept. Built with a responsive **Bento Grid Design System**, this application showcases advanced architectural patterns in React, Express, Zustand, and TanStack React Query.

---

## 🛠️ Folder Architecture
The codebase is strictly separated into client-side application logic and backend host services to maintain clean architectural boundaries:

```bash
├── server/                    # 🟢 HOST & BACKEND DATA SEEDING SERVICE
│   ├── controllers/           # Parameter validation & response orchestrators
│   ├── mock-data/             # Dataset generation algorithms (Categorical, Temporal, Hierarchical, Relational)
│   ├── routes/                # Clean Express REST routers
│   ├── schemas/               # Shared transactional Zod schema assertions
│   └── services/              # Schema engines executing strict server-side validation
├── src/                       # 🔵 DECOUPLED FRONTEND APPLICATION
│   ├── components/            # Layout shells & dynamic frame cells (e.g., WidgetCell)
│   ├── hooks/                 # TanStack React Query adapters for async pipeline
│   ├── registry/              # Centralized widget registry singleton
│   ├── store/                 # Zustand coordinate, state & config persistence engine
│   ├── types/                 # Standard typescript definitions & contract interfaces
│   ├── utils/                 # Data transformers translating API results to charts
│   └── widgets/               # Pure chart preview rendering components (ECharts-driven)
├── server.ts                  # express unified backend bootstrapper with Vite Dev Middleware
├── Dockerfile                 # Docker container assembly blueprint
└── package.json               # Full-stack dependencies & esbuild compilation configurationses
```

---

## 🚀 Local Running Instructions (Docker Preferred)

To spin up the scalable dashboard builder container instantly:

### Method 1: Using Docker (Recommended)
1. Ensure Docker is installed and running on your system.
2. Build the Docker image:
   ```bash
   docker build -t scalable-dashboard-builder .
   ```
3. Run the container map to port `3000`:
   ```bash
   docker run -p 3000:3000 scalable-dashboard-builder
   ```
4. Open your browser and navigate to `http://localhost:3000` to interact with the system.

### Method 2: Manual Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch the Development Server (with dynamic hot-swapping):
   ```bash
   npm run dev
   ```
3. Compile for production:
   ```bash
   npm run build
   ```
4. Start the production Node server:
   ```bash
   npm run start
   ```

---

## 📑 Architectural Decision Record (ADR)

### ADR-01: State Management Selection
*   **Decision**: **Zustand** combined with client-side **TanStack React Query**.
*   **Rationale**:
    *   **Zustand** provides a slice-oriented, highly performant state container without the boilerplate of Redux or the context-invalidation issues of standard React Context. It is used exclusively for *local UI/UI-Grid coordinates, current layout persistence, active configurations*, and *interactive configurations (such as custom colors and bounds)*.
    *   **React Query** is used for handling *server-side dynamic state, fetching queues, automatic query caching, query invalidation, and asynchronous caching*. This cleanly separates server-retrieved data arrays from active UI parameters.
    *   This combination achieves **maximum performance**: coordinates updates do not re-trigger data fetches, and asset-fetch states do not thrash grid coordinates.

### ADR-02: Charting Engine Selection
*   **Decision**: **Apache ECharts** (`echarts`).
*   **Rationale**:
    *   Unlike high-level wrappers like Recharts or Chart.js which introduce custom high-friction JSX trees, ECharts accepts standard JSON configuration structures directly.
    *   This allows the **Dynamic Registry** to work with 100% decoupling: the Registry doesn't need to wrap custom markup—it simply registers a component and defines a standard pure transformer function `(rawJson) => chartOption`. This maximizes extensibility for adding new chart types.

---

## 📈 Handling Data Drift in Live Production Streams

When connected to real-time pipelines, the structure, frequency, and statistical boundaries of streaming metrics will shift (Data Drift / Schema Drift). We address this across three architectural tiers:

### 1. Hard Schema Guardians (Zod Schema Validation)
*   Our API endpoints run deep Zod assertions (`BarChartDataSchema.parse(raw)`) before serving. If fields are omitted, string datatypes fail, or arrays mismatch, the system catches it at the controller level instead of propagating corrupt visual layout parameters to the user UI.

### 2. Resiliency & Graceful Degradation (Circuit-Breaking)
*   If a single stream drifts outside structural limits, standard React Error Boundaries catch the failure inside the specific `WidgetCell` itself. Rather than crashing the whole dashboard, the cell goes into a "Resilient State," prompting the engineer with diagnostic error logs while keeping the other 3 streams active and running safely.

### 3. Drift Identification Pipeline (Analytical Approach)
For streaming telemetry, we would implement an asynchronous cron worker performing structural evaluation:
*   **Population Stability Index (PSI)** tracking on continuous numerical datasets (like latency plots) comparing baseline distributions vs 1-hour windows.
*   **Circuit-Breaker triggers**: If PSI > 0.25 (indicating significant drift), the service fires slack/alerter warnings and marks the dashboard dataset version as `stale` to invoke fallback parameters automatically.
