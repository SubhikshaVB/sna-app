import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { api } from "./lib/api";
import AnalyticsPage from "./pages/AnalyticsPage";
import ExplorePage from "./pages/ExplorePage";
import GraphPage from "./pages/GraphPage";
import HomePage from "./pages/HomePage";
import JourneysPage from "./pages/JourneysPage";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [network, setNetwork] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [placeDetail, setPlaceDetail] = useState(null);
  const [transport, setTransport] = useState("car");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          summaryData,
          hubData,
          talukData,
          categoryData,
          metricData,
          networkData,
          placeData,
        ] = await Promise.all([
          api.summary(),
          api.topHubs(),
          api.talukSummary(),
          api.categorySummary(),
          api.metrics(),
          api.networkPreview(),
          api.places(),
        ]);

        setSummary(summaryData);
        setHubs(hubData);
        setTaluks(talukData);
        setCategories(categoryData);
        setMetrics(metricData);
        setNetwork(networkData);
        setPlaces(placeData);
        if (placeData.length > 0) {
          setSelectedPlace(placeData[0].node_id);
        }
      } catch (err) {
        setError("Could not load the tourism network. Make sure the FastAPI backend is running.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadPlace() {
      if (!selectedPlace) {
        return;
      }
      try {
        const [detailData, recommendationData] = await Promise.all([
          api.placeDetail(selectedPlace),
          api.recommendations(selectedPlace, transport),
        ]);
        setPlaceDetail(detailData);
        setRecommendations(recommendationData);
      } catch (err) {
        setError("Could not load place details or recommendations.");
      }
    }

    loadPlace();
  }, [selectedPlace, transport]);

  if (loading) {
    return (
      <main className="shell">
        <section className="hero">
          <h1>Loading tourism intelligence...</h1>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shell">
        <section className="hero">
          <h1>{error}</h1>
        </section>
      </main>
    );
  }

  const featuredPlaces = [...places]
    .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0))
    .slice(0, 6);

  return (
    <BrowserRouter>
      <Layout>
        <main className="shell">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  summary={summary}
                  hubs={hubs}
                  network={network}
                  taluks={taluks}
                  categories={categories}
                  featuredPlaces={featuredPlaces}
                />
              }
            />
            <Route
              path="/explore"
              element={
                <ExplorePage
                  places={places}
                  selectedPlace={selectedPlace}
                  setSelectedPlace={setSelectedPlace}
                  transport={transport}
                  setTransport={setTransport}
                  placeDetail={placeDetail}
                  recommendations={recommendations}
                />
              }
            />
            <Route
              path="/graph"
              element={
                <GraphPage
                  network={network}
                  places={places}
                  selectedPlace={selectedPlace}
                  setSelectedPlace={setSelectedPlace}
                  placeDetail={placeDetail}
                />
              }
            />
            <Route path="/journeys" element={<JourneysPage places={places} />} />
            <Route
              path="/analytics"
              element={
                <AnalyticsPage
                  summary={summary}
                  metrics={metrics}
                  hubs={hubs}
                  taluks={taluks}
                />
              }
            />
          </Routes>
        </main>
      </Layout>
    </BrowserRouter>
  );
}
