import asyncio
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import (
    init_db,
    add_event,
    get_events,
    get_stats
)

from .detector import detector
from .prevention import prevention
from .groq_ai import analyze_threat


# ============================================================
# TIME
# ============================================================

def get_ist_time():
    return (
        datetime.now(timezone.utc)
        + timedelta(hours=5, minutes=30)
    )


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="AI-IDAPS API",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# WEBSOCKET CONNECTION MANAGER
# ============================================================

class ConnectionManager:

    def __init__(self):
        self.connections = []

    async def connect(
        self,
        websocket: WebSocket
    ):
        await websocket.accept()

        if websocket not in self.connections:
            self.connections.append(websocket)

        print(
            f"[WEBSOCKET] Client connected | "
            f"Active clients: {len(self.connections)}"
        )

    def disconnect(
        self,
        websocket: WebSocket
    ):
        if websocket in self.connections:
            self.connections.remove(websocket)

        print(
            f"[WEBSOCKET] Client disconnected | "
            f"Active clients: {len(self.connections)}"
        )

    async def broadcast(
        self,
        message: dict
    ):
        if not self.connections:
            print(
                "[WEBSOCKET] No connected clients"
            )
            return

        disconnected = []

        for websocket in list(self.connections):

            try:

                await websocket.send_json(
                    message
                )

            except Exception as exc:

                print(
                    "[WEBSOCKET] Send error:",
                    exc
                )

                disconnected.append(
                    websocket
                )

        for websocket in disconnected:
            self.disconnect(websocket)

        print(
            f"[WEBSOCKET] Broadcast complete | "
            f"Clients: {len(self.connections)}"
        )


manager = ConnectionManager()


# ============================================================
# NETWORK FLOW MODEL
# ============================================================

class Flow(BaseModel):

    source_ip: str

    destination_ip: str

    source_port: int = Field(
        ge=0,
        le=65535
    )

    destination_port: int = Field(
        ge=0,
        le=65535
    )

    protocol: str

    duration: float = Field(
        ge=0
    )

    packets: int = Field(
        ge=0
    )

    bytes_transferred: int = Field(
        ge=0
    )

    syn_count: int = Field(
        ge=0
    )

    failed_connections: int = Field(
        ge=0
    )


# ============================================================
# PROJECT 2 SECURITY EVENT
# ============================================================

class SecurityEvent(BaseModel):

    timestamp: str | None = None

    event_type: str

    severity: str

    source_ip: str

    target: str

    mitre_technique: str | None = None

    risk_score: int = Field(
        ge=0,
        le=100
    )

    details: dict = {}

    simulation: bool = False

    source: str | None = None

    simulation_id: str | None = None

    ai_status: str | None = None

    simulation_attack_type: str | None = None

    # --------------------------------------------------------
    # Network-flow features
    # --------------------------------------------------------

    source_port: int = Field(
        default=0,
        ge=0,
        le=65535
    )

    destination_port: int = Field(
        default=0,
        ge=0,
        le=65535
    )

    protocol: str = "TCP"

    duration: float = Field(
        default=0,
        ge=0
    )

    packets: int = Field(
        default=0,
        ge=0
    )

    bytes_transferred: int = Field(
        default=0,
        ge=0
    )

    syn_count: int = Field(
        default=0,
        ge=0
    )

    failed_connections: int = Field(
        default=0,
        ge=0
    )


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup():

    print("=" * 60)
    print("AI-IDAPS BACKEND STARTING")
    print("=" * 60)

    init_db()

    detector.ensure_model()

    print("[SYSTEM] Database initialized")
    print("[SYSTEM] ML model ready")
    print("[SYSTEM] WebSocket real-time monitoring ready")
    print("=" * 60)


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "online",
        "service": "AI-IDAPS",
        "ai": "Groq",
        "database": "Neon PostgreSQL",
        "realtime": "WebSocket",
        "integration": "Project 2 enabled"
    }


# ============================================================
# STATISTICS
# ============================================================

@app.get("/api/stats")
def stats():

    return get_stats()


# ============================================================
# EVENTS
# ============================================================

@app.get("/api/events")
def events(
    limit: int = 50
):

    return get_events(
        min(
            max(
                limit,
                1
            ),
            200
        )
    )


# ============================================================
# COMMON AI-IDAPS PROCESSOR
# ============================================================

def process_security_event(event: dict):

    # --------------------------------------------------------
    # ORIGINAL PROJECT 2 EVENT TYPE
    # --------------------------------------------------------

    original_event_type = event.get(
        "event_type",
        "Unknown"
    )

    # --------------------------------------------------------
    # NETWORK FLOW
    # --------------------------------------------------------

    flow = {

        "source_ip": event.get(
            "source_ip",
            "0.0.0.0"
        ),

        "destination_ip": event.get(
            "destination_ip",
            event.get(
                "target",
                "0.0.0.0"
            )
        ),

        "source_port": event.get(
            "source_port",
            0
        ),

        "destination_port": event.get(
            "destination_port",
            0
        ),

        "protocol": event.get(
            "protocol",
            "TCP"
        ),

        "duration": event.get(
            "duration",
            0
        ),

        "packets": event.get(
            "packets",
            0
        ),

        "bytes_transferred": event.get(
            "bytes_transferred",
            0
        ),

        "syn_count": event.get(
            "syn_count",
            0
        ),

        "failed_connections": event.get(
            "failed_connections",
            0
        )
    }

    # --------------------------------------------------------
    # ML DETECTION
    #
    # Official ML classes:
    # Normal
    # DoS
    # Brute Force
    # --------------------------------------------------------

    detection = detector.predict(
        flow
    )

    ml_attack_type = detection[
        "attack_type"
    ]

    ml_confidence = detection[
        "confidence"
    ]

    # --------------------------------------------------------
    # MONITORING ATTACK TYPE
    #
    # Project 2 has six simulation types:
    #
    # Port Scan
    # Brute Force
    # Traffic Anomaly
    # IOC Detection
    # Authentication Abuse
    # DoS
    #
    # Preserve the original Project 2 event_type.
    #
    # ML classification remains independent.
    # --------------------------------------------------------

    if original_event_type in [
        "DoS",
        "Brute Force"
    ]:

        attack_type = ml_attack_type

    else:

        attack_type = original_event_type

    # --------------------------------------------------------
    # PREVENTION
    # --------------------------------------------------------

    prevention_input = {

        "attack_type":
            attack_type,

        "confidence":
            ml_confidence
    }

    prevention_result = prevention.decide(
        prevention_input
    )

    # --------------------------------------------------------
    # FINAL EVENT
    # --------------------------------------------------------

    result = {

        **event,

        **flow,

        # Original Project 2 event
        "event_type":
            original_event_type,

        # Monitoring classification
        "attack_type":
            attack_type,

        # Actual ML prediction
        "ml_attack_type":
            ml_attack_type,

        # ML confidence
        "confidence":
            ml_confidence,

        # Prevention
        "action":
            prevention_result[
                "action"
            ],

        "status":
            prevention_result[
                "status"
            ],

        # Timestamp
        "timestamp":
            event.get(
                "timestamp"
            )
            or get_ist_time().isoformat(),

        # Preserve simulation type
        "simulation_attack_type":
            event.get(
                "simulation_attack_type"
            )
            or event.get(
                "event_type"
            )
    }

    # --------------------------------------------------------
    # GROQ AI
    # --------------------------------------------------------

    try:

        result[
            "ai_analysis"
        ] = analyze_threat(
            result
        )

        result[
            "ai_status"
        ] = "ANALYZED"

    except Exception as exc:

        result[
            "ai_analysis"
        ] = (
            "AI analysis unavailable: "
            f"{str(exc)}"
        )

        result[
            "ai_status"
        ] = "AI_UNAVAILABLE"

    # --------------------------------------------------------
    # DATABASE
    # --------------------------------------------------------

    add_event(
        result
    )

    return result


# ============================================================
# NORMAL ML PREDICTION
# ============================================================

@app.post("/api/predict")
async def predict(
    flow: Flow
):

    event = flow.model_dump()

    # Run blocking ML/database/Groq work
    # outside the FastAPI event loop.
    result = await asyncio.to_thread(
        process_security_event,
        event
    )

    # Immediately broadcast processed event.
    await manager.broadcast({

        "type":
            "security_event",

        "source":
            "AI-IDAPS",

        "data":
            result
    })

    return result


# ============================================================
# PROJECT 2 → PROJECT 1
# SECURITY EVENT INGESTION
# ============================================================

@app.post("/api/security/events")
async def receive_security_event(
    event: SecurityEvent
):

    incoming = event.model_dump()

    # --------------------------------------------------------
    # Preserve Project 2 metadata
    # --------------------------------------------------------

    incoming[
        "simulation"
    ] = True

    incoming[
        "source"
    ] = (
        incoming.get(
            "source"
        )
        or
        "AI-IDAPS-Attack-Simulation-Console"
    )

    # --------------------------------------------------------
    # PROCESS EVENT
    #
    # process_security_event contains blocking
    # Groq/database work.
    #
    # Run it in a worker thread so that the
    # FastAPI event loop remains responsive.
    # --------------------------------------------------------

    result = await asyncio.to_thread(
        process_security_event,
        incoming
    )

    # --------------------------------------------------------
    # REAL-TIME BROADCAST
    # --------------------------------------------------------

    await manager.broadcast({

        "type":
            "security_event",

        "source":
            "AI-IDAPS-Attack-Simulation-Console",

        "data":
            result
    })

    print(
        f"[REALTIME] Event broadcast | "
        f"Type: {result.get('event_type')} | "
        f"Source: {result.get('source_ip')}"
    )

    # --------------------------------------------------------
    # AUTHORITATIVE RESPONSE
    # --------------------------------------------------------

    return {

        "success":
            True,

        "message":
            "Security event received, analyzed and stored",

        "event":
            result
    }


# ============================================================
# WEBSOCKET
# ============================================================

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
):

    await manager.connect(
        websocket
    )

    try:

        while True:

            message = (
                await websocket.receive_text()
            )

            # Optional heartbeat
            if message == "ping":

                await websocket.send_json({
                    "type": "pong"
                })

    except WebSocketDisconnect:

        manager.disconnect(
            websocket
        )

    except Exception as exc:

        print(
            "[WEBSOCKET] Connection error:",
            exc
        )

        manager.disconnect(
            websocket
        )


# ============================================================
# BUILT-IN DEMO SIMULATION
# ============================================================

@app.post("/api/simulate")
async def simulate():

    synthetic_flows = [

        {
            "event_type":
                "DoS",

            "severity":
                "CRITICAL",

            "source_ip":
                "192.0.2.42",

            "target":
                "192.0.2.10",

            "mitre_technique":
                "T1498",

            "risk_score":
                95,

            "source_port":
                51520,

            "destination_port":
                80,

            "protocol":
                "TCP",

            "duration":
                1.2,

            "packets":
                940,

            "bytes_transferred":
                84200,

            "syn_count":
                810,

            "failed_connections":
                18,

            "simulation":
                True,

            "source":
                "AI-IDAPS-Built-In-Simulation"
        },

        {
            "event_type":
                "Brute Force",

            "severity":
                "HIGH",

            "source_ip":
                "192.0.2.77",

            "target":
                "192.0.2.10",

            "mitre_technique":
                "T1110",

            "risk_score":
                90,

            "source_port":
                43800,

            "destination_port":
                22,

            "protocol":
                "TCP",

            "duration":
                15.2,

            "packets":
                150,

            "bytes_transferred":
                22000,

            "syn_count":
                14,

            "failed_connections":
                46,

            "simulation":
                True,

            "source":
                "AI-IDAPS-Built-In-Simulation"
        },

        {
            "event_type":
                "Normal",

            "severity":
                "LOW",

            "source_ip":
                "192.0.2.15",

            "target":
                "192.0.2.20",

            "mitre_technique":
                None,

            "risk_score":
                5,

            "source_port":
                53000,

            "destination_port":
                443,

            "protocol":
                "TCP",

            "duration":
                8.4,

            "packets":
                44,

            "bytes_transferred":
                18400,

            "syn_count":
                1,

            "failed_connections":
                0,

            "simulation":
                True,

            "source":
                "AI-IDAPS-Built-In-Simulation"
        }
    ]

    results = []

    for flow in synthetic_flows:

        # Run blocking processing outside
        # the FastAPI event loop.
        result = await asyncio.to_thread(
            process_security_event,
            flow
        )

        results.append(
            result
        )

        # Real-time broadcast
        await manager.broadcast({

            "type":
                "security_event",

            "source":
                "AI-IDAPS",

            "data":
                result
        })

    return {

        "created":
            results,

        "count":
            len(results)
    }