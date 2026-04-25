from __future__ import annotations

from neo4j import GraphDatabase

from .config import settings


class Neo4jConnection:
    def __init__(self) -> None:
        self._driver = None

    def driver(self):
        if self._driver is None:
            if not settings.neo4j_password:
                raise RuntimeError("NEO4J_PASSWORD is not set.")
            self._driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
            )
        return self._driver

    def close(self) -> None:
        if self._driver is not None:
            self._driver.close()
            self._driver = None


neo4j_connection = Neo4jConnection()

