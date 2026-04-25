# Virudhunagar Tourism SNA App

Tourism discovery and analysis portal for Virudhunagar district using:

- `Neo4j` for graph storage
- `FastAPI` for backend services
- `NetworkX` for SNA metrics
- `React + Vite` for the frontend experience

## What This App Shows

- district-level tourism network summary
- top tourism hubs
- degree, betweenness, closeness, and PageRank rankings
- taluk-wise attraction concentration
- nearest connected attractions by transport mode
- a network preview for live demo storytelling

## Project Structure

```text
sna-app/
├── backend/
├── data/
├── frontend/
└── README.md
```

## Before Running

Make sure:

1. Neo4j Desktop is running
2. your `Place` nodes and `CONNECTED_TO` edges are already imported
3. Neo4j is available at `bolt://127.0.0.1:7687`

## Backend Setup

Open a terminal inside `backend/`:

```powershell
pip install -r requirements.txt
$env:NEO4J_URI="bolt://127.0.0.1:7687"
$env:NEO4J_USER="neo4j"
$env:NEO4J_PASSWORD="your_neo4j_password"
uvicorn app.main:app --reload
```

Backend will run at:

`http://127.0.0.1:8000`

Useful endpoints:

- `GET /api/summary`
- `GET /api/top-hubs`
- `GET /api/metrics`
- `GET /api/taluk-summary`
- `GET /api/places`
- `GET /api/places/{node_id}`
- `GET /api/places/{node_id}/recommendations?transport=car`

## Frontend Setup

Open another terminal inside `frontend/`:

```powershell
npm install
$env:VITE_API_BASE="http://127.0.0.1:8000/api"
npm run dev
```

Frontend will run at:

`http://127.0.0.1:5173`

## Demo Flow For Faculty

1. Open the homepage and explain that each tourist place is a node and each travel connection is an edge.
2. Show the summary cards: total places, edges, components, and average edge distance.
3. Scroll to the network preview and explain that larger nodes behave as stronger hubs.
4. Show the top hub list and explain degree plus PageRank.
5. Show the SNA metric columns:
   - Degree Centrality = local importance
   - Betweenness Centrality = bridge places
   - Closeness Centrality = quickly reachable places
   - PageRank = globally influential destinations
6. Use the trip planner to select one place and switch transport mode to show nearby recommendations.
7. End with taluk-wise distribution and explain how the graph can help tourists plan multi-stop visits.

## Notes

- The backend computes metrics from graph data stored in Neo4j.
- The frontend consumes only backend APIs.
- `data/` contains the current dataset snapshot used during app development.
