from __future__ import annotations

from collections import Counter

import networkx as nx


class GraphService:
    def __init__(self, driver) -> None:
        self.driver = driver

    def _run(self, query: str, **params):
        with self.driver.session() as session:
            return [record.data() for record in session.run(query, **params)]

    def _fetch_graph(self) -> tuple[list[dict], list[dict]]:
        places = self._run(
            """
            MATCH (p:Place)
            RETURN p.node_id AS node_id,
                   p.place_id AS place_id,
                   p.name AS name,
                   p.taluk AS taluk,
                   p.category AS category,
                   p.latitude AS latitude,
                   p.longitude AS longitude,
                   p.rating AS rating,
                   p.popularity AS popularity,
                   p.address AS address,
                   p.photo_url AS photo_url,
                   p.description AS description
            ORDER BY p.taluk, p.name
            """
        )
        edges = self._run(
            """
            MATCH (a:Place)-[r:CONNECTED_TO]->(b:Place)
            RETURN r.edge_id AS edge_id,
                   a.node_id AS source,
                   b.node_id AS target,
                   a.name AS source_name,
                   b.name AS target_name,
                   r.distance_km AS distance_km,
                   r.time_car AS time_car,
                   r.time_bus AS time_bus,
                   r.time_2w AS time_2w,
                   r.time_cycle AS time_cycle,
                   r.time_walk AS time_walk,
                   r.weight_car AS weight_car,
                   r.weight_bus AS weight_bus,
                   r.weight_2w AS weight_2w,
                   r.weight_cycle AS weight_cycle,
                   r.weight_walk AS weight_walk,
                   r.strength AS strength,
                   r.same_taluk AS same_taluk,
                   r.connection_type AS connection_type,
                   a.taluk AS source_taluk,
                   b.taluk AS target_taluk
            """
        )
        return places, edges

    def _build_graph(self) -> tuple[nx.Graph, dict[str, dict], list[dict]]:
        places, edges = self._fetch_graph()
        graph = nx.Graph()
        place_index = {place["node_id"]: place for place in places}

        for place in places:
            graph.add_node(place["node_id"], **place)

        for edge in edges:
            edge_payload = dict(edge)
            edge_payload["distance_km"] = float(edge.get("distance_km") or 0.0)
            edge_payload["weight_car"] = float(edge.get("weight_car") or 0.0)
            edge_payload["weight_bus"] = float(edge.get("weight_bus") or 0.0)
            edge_payload["weight_2w"] = float(edge.get("weight_2w") or 0.0)
            edge_payload["weight_cycle"] = float(edge.get("weight_cycle") or 0.0)
            edge_payload["weight_walk"] = float(edge.get("weight_walk") or 0.0)
            graph.add_edge(
                edge["source"],
                edge["target"],
                **edge_payload,
            )

        return graph, place_index, edges

    def get_summary(self) -> dict:
        graph, _, edges = self._build_graph()
        distances = [float(edge.get("distance_km") or 0.0) for edge in edges]
        strength_counts = Counter((edge.get("strength") or "unknown") for edge in edges)
        taluk_counts = Counter(data.get("taluk", "Unknown") for _, data in graph.nodes(data=True))

        return {
            "places": graph.number_of_nodes(),
            "edges": graph.number_of_edges(),
            "components": nx.number_connected_components(graph) if graph.number_of_nodes() else 0,
            "isolated_places": len(list(nx.isolates(graph))),
            "avg_distance_km": round(sum(distances) / len(distances), 2) if distances else 0,
            "strong_edges": strength_counts.get("strong", 0),
            "medium_edges": strength_counts.get("medium", 0),
            "weak_edges": strength_counts.get("weak", 0),
            "taluks_covered": len(taluk_counts),
            "top_taluks": [
                {"taluk": taluk, "places": count}
                for taluk, count in taluk_counts.most_common(5)
            ],
        }

    def get_top_hubs(self, limit: int = 10) -> list[dict]:
        graph, _, _ = self._build_graph()
        degree_centrality = nx.degree_centrality(graph) if graph.number_of_nodes() else {}
        pagerank = (
            nx.pagerank(graph, weight="weight_car")
            if graph.number_of_nodes() and graph.number_of_edges()
            else {}
        )

        hubs = []
        for node_id, degree in sorted(graph.degree(), key=lambda item: item[1], reverse=True)[:limit]:
            node = graph.nodes[node_id]
            hubs.append(
                {
                    "node_id": node_id,
                    "name": node["name"],
                    "taluk": node["taluk"],
                    "category": node.get("category"),
                    "photo_url": node.get("photo_url"),
                    "degree": degree,
                    "degree_centrality": round(degree_centrality.get(node_id, 0.0), 4),
                    "pagerank": round(pagerank.get(node_id, 0.0), 4),
                    "popularity": node.get("popularity"),
                    "rating": node.get("rating"),
                }
            )
        return hubs

    def get_isolated_places(self) -> list[dict]:
        graph, _, _ = self._build_graph()
        isolated = []
        for node_id in nx.isolates(graph):
            node = graph.nodes[node_id]
            isolated.append(
                {
                    "node_id": node_id,
                    "name": node["name"],
                    "taluk": node["taluk"],
                    "category": node.get("category"),
                    "popularity": node.get("popularity"),
                }
            )
        return isolated

    def get_taluk_summary(self) -> list[dict]:
        graph, _, _ = self._build_graph()
        summary = []
        for taluk in sorted({data.get("taluk", "Unknown") for _, data in graph.nodes(data=True)}):
            members = [node_id for node_id, data in graph.nodes(data=True) if data.get("taluk") == taluk]
            subgraph = graph.subgraph(members)
            summary.append(
                {
                    "taluk": taluk,
                    "places": len(members),
                    "internal_edges": subgraph.number_of_edges(),
                    "avg_degree": round(
                        sum(dict(subgraph.degree()).values()) / len(members), 2
                    ) if members else 0,
                }
            )
        return sorted(summary, key=lambda item: item["places"], reverse=True)

    def get_cross_taluk_links(self) -> list[dict]:
        _, _, edges = self._build_graph()
        counter = Counter()
        for edge in edges:
            if edge.get("same_taluk"):
                continue
            pair = tuple(sorted((edge["source_taluk"], edge["target_taluk"])))
            counter[pair] += 1
        return [
            {
                "from_taluk": pair[0],
                "to_taluk": pair[1],
                "connections": count,
            }
            for pair, count in counter.most_common()
        ]

    def get_places(self, search: str | None = None, taluk: str | None = None, limit: int = 60) -> list[dict]:
        graph, _, _ = self._build_graph()
        places = []
        search_value = search.casefold() if search else None
        taluk_value = taluk.casefold() if taluk else None

        for node_id, data in graph.nodes(data=True):
            if search_value and search_value not in data["name"].casefold():
                continue
            if taluk_value and taluk_value != data["taluk"].casefold():
                continue
            places.append(
                {
                    "node_id": node_id,
                    "name": data["name"],
                    "taluk": data["taluk"],
                    "category": data.get("category"),
                    "popularity": data.get("popularity"),
                    "rating": data.get("rating"),
                    "latitude": data.get("latitude"),
                    "longitude": data.get("longitude"),
                    "photo_url": data.get("photo_url"),
                    "address": data.get("address"),
                }
            )
        places.sort(key=lambda item: (item["taluk"], item["name"]))
        return places[:limit]

    def get_place_detail(self, node_id: str) -> dict | None:
        graph, _, _ = self._build_graph()
        if node_id not in graph:
            return None

        node = dict(graph.nodes[node_id])
        nearby = []
        for neighbor in graph.neighbors(node_id):
            edge = graph.get_edge_data(node_id, neighbor)
            neighbor_data = graph.nodes[neighbor]
            nearby.append(
                {
                    "node_id": neighbor,
                    "name": neighbor_data["name"],
                    "taluk": neighbor_data["taluk"],
                    "category": neighbor_data.get("category"),
                    "photo_url": neighbor_data.get("photo_url"),
                    "distance_km": edge.get("distance_km"),
                    "time_car": edge.get("time_car"),
                    "time_bus": edge.get("time_bus"),
                    "time_2w": edge.get("time_2w"),
                    "time_cycle": edge.get("time_cycle"),
                    "time_walk": edge.get("time_walk"),
                }
            )
        nearby.sort(key=lambda item: item["distance_km"])
        node["nearby_places"] = nearby[:8]
        node["degree"] = graph.degree(node_id)
        return node

    def get_recommendations(self, node_id: str, transport: str = "car", limit: int = 6) -> list[dict]:
        graph, _, _ = self._build_graph()
        if node_id not in graph:
            return []

        transport_field = {
            "car": "time_car",
            "bus": "time_bus",
            "2w": "time_2w",
            "cycle": "time_cycle",
            "walk": "time_walk",
        }.get(transport, "time_car")

        recommendations = []
        for neighbor in graph.neighbors(node_id):
            edge = graph.get_edge_data(node_id, neighbor)
            target = graph.nodes[neighbor]
            recommendations.append(
                {
                    "node_id": neighbor,
                    "name": target["name"],
                    "taluk": target["taluk"],
                    "category": target.get("category"),
                    "photo_url": target.get("photo_url"),
                    "distance_km": edge.get("distance_km"),
                    "travel_time": edge.get(transport_field),
                    "transport": transport,
                    "strength": edge.get("strength"),
                }
            )
        recommendations.sort(key=lambda item: (item["travel_time"], item["distance_km"]))
        return recommendations[:limit]

    def get_category_summary(self) -> list[dict]:
        graph, _, _ = self._build_graph()
        category_counts = Counter(
            (data.get("category") or "Other")
            for _, data in graph.nodes(data=True)
        )
        return [
            {"category": category, "places": count}
            for category, count in category_counts.most_common()
        ]

    def get_metrics(self) -> dict:
        graph, _, _ = self._build_graph()
        if not graph.number_of_nodes():
            return {
                "top_degree": [],
                "top_betweenness": [],
                "top_closeness": [],
                "top_pagerank": [],
            }

        degree_centrality = nx.degree_centrality(graph)
        betweenness = nx.betweenness_centrality(graph, weight="distance_km")
        closeness = nx.closeness_centrality(graph, distance="distance_km")
        pagerank = nx.pagerank(graph, weight="weight_car")

        def top_scores(score_map: dict[str, float], label: str) -> list[dict]:
            items = []
            for node_id, score in sorted(score_map.items(), key=lambda item: item[1], reverse=True)[:10]:
                node = graph.nodes[node_id]
                items.append(
                    {
                        "node_id": node_id,
                        "name": node["name"],
                        "taluk": node["taluk"],
                        label: round(score, 4),
                    }
                )
            return items

        return {
            "top_degree": top_scores(degree_centrality, "score"),
            "top_betweenness": top_scores(betweenness, "score"),
            "top_closeness": top_scores(closeness, "score"),
            "top_pagerank": top_scores(pagerank, "score"),
        }

    def get_network_preview(self, limit: int = 80) -> dict:
        graph, _, edges = self._build_graph()
        ranked = sorted(graph.degree(), key=lambda item: item[1], reverse=True)
        chosen_nodes = {node_id for node_id, _ in ranked[:limit]}

        nodes = []
        for node_id in chosen_nodes:
            node = graph.nodes[node_id]
            nodes.append(
                {
                    "id": node_id,
                    "name": node["name"],
                    "taluk": node["taluk"],
                    "category": node.get("category"),
                    "popularity": node.get("popularity") or 0,
                    "degree": graph.degree(node_id),
                    "latitude": node.get("latitude"),
                    "longitude": node.get("longitude"),
                    "photo_url": node.get("photo_url"),
                }
            )

        links = []
        for edge in edges:
            if edge["source"] in chosen_nodes and edge["target"] in chosen_nodes:
                links.append(
                    {
                        "source": edge["source"],
                        "target": edge["target"],
                        "distance_km": edge["distance_km"],
                        "strength": edge["strength"],
                    }
                )

        return {"nodes": nodes, "links": links}
