import os

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured in .env"
    )


def connect():
    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row
    )


def init_db():

    with connect() as c:

        c.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,

                timestamp TEXT,

                source_ip TEXT,
                destination_ip TEXT,

                source_port INTEGER,
                destination_port INTEGER,

                protocol TEXT,

                attack_type TEXT,
                confidence DOUBLE PRECISION,

                action TEXT,
                status TEXT,

                duration DOUBLE PRECISION,
                packets INTEGER,
                bytes_transferred BIGINT,

                ai_analysis TEXT,

                event_type TEXT,
                severity TEXT,
                target TEXT,

                mitre_technique TEXT,

                risk_score INTEGER,

                simulation BOOLEAN DEFAULT FALSE,

                source TEXT,

                simulation_id TEXT,

                ai_status TEXT
            )
        """)

        # ----------------------------------------------------
        # Existing database compatibility
        # ----------------------------------------------------

        columns = [

            ("ai_analysis", "TEXT"),

            ("event_type", "TEXT"),

            ("severity", "TEXT"),

            ("target", "TEXT"),

            ("mitre_technique", "TEXT"),

            ("risk_score", "INTEGER"),

            ("simulation", "BOOLEAN DEFAULT FALSE"),

            ("source", "TEXT"),

            ("simulation_id", "TEXT"),

            ("ai_status", "TEXT")
        ]

        for column, data_type in columns:

            c.execute(
                f"""
                ALTER TABLE events
                ADD COLUMN IF NOT EXISTS
                {column} {data_type}
                """
            )

        # ----------------------------------------------------
        # Useful indexes for real-time SOC queries
        # ----------------------------------------------------

        c.execute("""
            CREATE INDEX IF NOT EXISTS
            idx_events_timestamp
            ON events(timestamp)
        """)

        c.execute("""
            CREATE INDEX IF NOT EXISTS
            idx_events_attack_type
            ON events(attack_type)
        """)

        c.execute("""
            CREATE INDEX IF NOT EXISTS
            idx_events_simulation_id
            ON events(simulation_id)
        """)

        c.execute("""
            CREATE INDEX IF NOT EXISTS
            idx_events_source_ip
            ON events(source_ip)
        """)


def add_event(e):

    with connect() as c:

        c.execute(
            """
            INSERT INTO events (

                timestamp,

                source_ip,
                destination_ip,

                source_port,
                destination_port,

                protocol,

                attack_type,
                confidence,

                action,
                status,

                duration,
                packets,
                bytes_transferred,

                ai_analysis,

                event_type,
                severity,
                target,

                mitre_technique,

                risk_score,

                simulation,

                source,

                simulation_id,

                ai_status
            )

            VALUES (

                %(timestamp)s,

                %(source_ip)s,
                %(destination_ip)s,

                %(source_port)s,
                %(destination_port)s,

                %(protocol)s,

                %(attack_type)s,
                %(confidence)s,

                %(action)s,
                %(status)s,

                %(duration)s,
                %(packets)s,
                %(bytes_transferred)s,

                %(ai_analysis)s,

                %(event_type)s,
                %(severity)s,
                %(target)s,

                %(mitre_technique)s,

                %(risk_score)s,

                %(simulation)s,

                %(source)s,

                %(simulation_id)s,

                %(ai_status)s
            )
            """,

            {
                **e,

                # Safe defaults for events coming from
                # either Project 1 or Project 2.

                "event_type":
                    e.get(
                        "event_type",
                        e.get("attack_type")
                    ),

                "severity":
                    e.get(
                        "severity",
                        "UNKNOWN"
                    ),

                "target":
                    e.get(
                        "target",
                        e.get("destination_ip")
                    ),

                "mitre_technique":
                    e.get("mitre_technique"),

                "risk_score":
                    e.get(
                        "risk_score",
                        0
                    ),

                "simulation":
                    e.get(
                        "simulation",
                        False
                    ),

                "source":
                    e.get(
                        "source",
                        "AI-IDAPS"
                    ),

                "simulation_id":
                    e.get("simulation_id"),

                "ai_status":
                    e.get("ai_status"),

                "ai_analysis":
                    e.get("ai_analysis")
            }
        )


def get_events(limit=50):

    with connect() as c:

        rows = c.execute(
            """
            SELECT *
            FROM events

            ORDER BY id DESC

            LIMIT %s
            """,
            (limit,)
        ).fetchall()

    return rows


def get_stats():

    with connect() as c:

        events = c.execute(
            """
            SELECT COUNT(*) AS c
            FROM events
            """
        ).fetchone()["c"]

        attacks = c.execute(
            """
            SELECT COUNT(*) AS c
            FROM events
            WHERE attack_type != 'Normal'
            """
        ).fetchone()["c"]

        blocked = c.execute(
            """
            SELECT COUNT(*) AS c
            FROM events
            WHERE status = 'BLOCKED'
            """
        ).fetchone()["c"]

        traffic = c.execute(
            """
            SELECT COALESCE(
                SUM(bytes_transferred),
                0
            ) AS c

            FROM events
            """
        ).fetchone()["c"]

    return {

        "events": events,

        "attacks": attacks,

        "blocked": blocked,

        "traffic_bytes": traffic
    }