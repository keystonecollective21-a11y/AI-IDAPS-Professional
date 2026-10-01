import { useEffect, useState } from "react";
import axios from "axios";
import {
  Shield,
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  RefreshCw,
  Play,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://127.0.0.1:8000/ws";
  
function App() {

  const [stats, setStats] = useState({
    events: 0,
    attacks: 0,
    blocked: 0,
    traffic_bytes: 0,
  });

  const [events, setEvents] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [backendOnline, setBackendOnline] =
    useState(false);

  const [wsConnected, setWsConnected] =
    useState(false);

  const [lastLiveEvent, setLastLiveEvent] =
    useState(null);


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = async () => {

    try {

      const [
        health,
        statsResponse,
        eventsResponse
      ] = await Promise.all([

        axios.get(
          `${API}/api/health`
        ),

        axios.get(
          `${API}/api/stats`
        ),

        axios.get(
          `${API}/api/events?limit=50`
        ),

      ]);


      setBackendOnline(
        health.data.status === "online"
      );


      setStats(
        statsResponse.data
      );


      setEvents(
        eventsResponse.data
      );


    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

      setBackendOnline(false);

    }

  };


  // ============================================================
  // LIVE WEBSOCKET MONITORING
  // ============================================================

  useEffect(() => {

    let socket = null;

    let reconnectTimer = null;

    let heartbeatTimer = null;

    let manuallyClosed = false;


    const connectWebSocket = () => {

      if (manuallyClosed) {
        return;
      }


      console.log(
        "Connecting to AI-IDAPS WebSocket..."
      );


      socket = new WebSocket(
        WS_URL
      );


      // --------------------------------------------------------
      // CONNECTED
      // --------------------------------------------------------

      socket.onopen = () => {

        console.log(
          "AI-IDAPS WebSocket connected"
        );


        setWsConnected(true);


        // Heartbeat
        heartbeatTimer =
          setInterval(() => {

            if (
              socket &&
              socket.readyState ===
                WebSocket.OPEN
            ) {

              socket.send("ping");

            }

          }, 15000);

      };


      // --------------------------------------------------------
      // REAL-TIME MESSAGE
      // --------------------------------------------------------

      socket.onmessage = (message) => {

        try {

          const payload =
            JSON.parse(
              message.data
            );


          console.log(
            "⚡ REAL-TIME SECURITY EVENT:",
            payload
          );


          // ----------------------------------------------------
          // SECURITY EVENT
          // ----------------------------------------------------

          if (
            payload.type ===
            "security_event"
          ) {

            const incomingEvent =
              payload.data;


            if (!incomingEvent) {
              return;
            }


            // --------------------------------------------------
            // SHOW LAST LIVE EVENT
            // --------------------------------------------------

            setLastLiveEvent(
              new Date().toLocaleTimeString()
            );


            // --------------------------------------------------
            // INSERT EVENT IMMEDIATELY
            // --------------------------------------------------

            setEvents(
              (previous) => {

                const incomingId =
                  incomingEvent.id;


                // If database ID exists,
                // prevent duplicate events.
                if (incomingId) {

                  const alreadyExists =
                    previous.some(
                      (event) =>
                        event.id ===
                        incomingId
                    );


                  if (alreadyExists) {

                    return previous;

                  }

                }


                return [
                  incomingEvent,
                  ...previous
                ].slice(0, 50);

              }
            );


            // --------------------------------------------------
            // UPDATE STATISTICS
            // --------------------------------------------------

            axios
              .get(
                `${API}/api/stats`
              )
              .then(
                (response) => {

                  setStats(
                    response.data
                  );

                }
              )
              .catch(
                (error) => {

                  console.error(
                    "Stats update error:",
                    error
                  );

                }
              );

          }


          // ----------------------------------------------------
          // WEBSOCKET PONG
          // ----------------------------------------------------

          if (
            payload.type ===
            "pong"
          ) {

            console.log(
              "WebSocket heartbeat OK"
            );

          }


          // ----------------------------------------------------
          // SIMULATION STATUS
          // ----------------------------------------------------

          if (
            payload.type ===
            "simulation_status"
          ) {

            console.log(
              "Simulation status:",
              payload
            );

          }

        } catch (error) {

          console.error(
            "WebSocket message error:",
            error
          );

        }

      };


      // --------------------------------------------------------
      // DISCONNECTED
      // --------------------------------------------------------

      socket.onclose = () => {

        console.log(
          "AI-IDAPS WebSocket disconnected"
        );


        setWsConnected(false);


        if (heartbeatTimer) {

          clearInterval(
            heartbeatTimer
          );

          heartbeatTimer = null;

        }


        if (!manuallyClosed) {

          reconnectTimer =
            setTimeout(
              connectWebSocket,
              2000
            );

        }

      };


      // --------------------------------------------------------
      // ERROR
      // --------------------------------------------------------

      socket.onerror = (error) => {

        console.error(
          "WebSocket error:",
          error
        );

        setWsConnected(false);

      };

    };


    connectWebSocket();


    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {

      manuallyClosed = true;


      if (reconnectTimer) {

        clearTimeout(
          reconnectTimer
        );

      }


      if (heartbeatTimer) {

        clearInterval(
          heartbeatTimer
        );

      }


      if (socket) {

        socket.close();

      }

    };

  }, []);


  // ============================================================
  // INITIAL DASHBOARD
  // ============================================================

  useEffect(() => {

    loadDashboard();


    // Backup polling.
    // WebSocket remains the primary real-time mechanism.

    const interval =
      setInterval(
        loadDashboard,
        15000
      );


    return () =>
      clearInterval(
        interval
      );

  }, []);


  // ============================================================
  // BUILT-IN PROJECT 1 SIMULATION
  // ============================================================

  const simulateAttack = async () => {

    setLoading(true);


    try {

      await axios.post(
        `${API}/api/simulate`
      );


      // WebSocket normally updates
      // the table automatically.

      await loadDashboard();


    } catch (error) {

      console.error(
        "Simulation error:",
        error
      );


      alert(
        "Could not connect to AI-IDAPS backend."
      );


    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // STATISTICS
  // ============================================================

  const trafficKB =
    (
      Number(
        stats.traffic_bytes || 0
      ) / 1024
    ).toFixed(1);


  // ============================================================
  // CHART
  // ============================================================

  const chartData =
    events
      .slice(0, 10)
      .reverse()
      .map(
        (event, index) => ({

          name:
            index + 1,

          confidence:
            Number(
              event.confidence || 0
            ),

        })
      );


  // ============================================================
  // ATTACK TYPE DISPLAY
  // ============================================================

  const getAttackLabel = (
    event
  ) => {

    return (
      event.event_type ||
      event.attack_type ||
      "Unknown"
    );

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-800 bg-slate-900/80">

        <div className="flex items-center justify-between px-8 py-5">


          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-blue-600 p-3">

              <Shield size={28} />

            </div>


            <div>

              <h1 className="text-2xl font-bold">

                AI-IDAPS

              </h1>


              <p className="text-sm text-slate-400">

                Intelligent Intrusion Detection & Automated Prevention

              </p>

            </div>

          </div>


          <div className="flex items-center gap-5">


            {/* WebSocket status */}

            <div className="flex items-center gap-2 text-sm">

              <span
                className={`h-3 w-3 rounded-full ${
                  wsConnected
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />


              {wsConnected
                ? "LIVE MONITORING"
                : "CONNECTING..."}

            </div>


            {/* Last live event */}

            {lastLiveEvent && (

              <div className="text-xs text-green-400">

                Last event:
                {" "}
                {lastLiveEvent}

              </div>

            )}


            {/* Backend status */}

            <div className="flex items-center gap-2 text-sm">

              <span
                className={`h-3 w-3 rounded-full ${
                  backendOnline
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />


              {backendOnline
                ? "SYSTEM ONLINE"
                : "BACKEND OFFLINE"}

            </div>


            <button
              onClick={loadDashboard}
              className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
              title="Refresh"
            >

              <RefreshCw size={18} />

            </button>

          </div>

        </div>

      </header>


      <main className="p-8">


        {/* ====================================================
            PAGE HEADING
        ==================================================== */}

        <div className="mb-8 flex items-center justify-between">


          <div>

            <h2 className="text-3xl font-bold">

              Security Overview

            </h2>


            <p className="mt-1 text-slate-400">

              Real-time AI-powered network threat monitoring

            </p>

          </div>


          <button
            onClick={simulateAttack}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >

            <Play size={18} />


            {loading
              ? "Simulating..."
              : "Simulate Threats"}

          </button>

        </div>


        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">


          <StatCard
            title="Total Events"
            value={stats.events}
            icon={<Activity />}
            description="Network events detected"
          />


          <StatCard
            title="Threats Detected"
            value={stats.attacks}
            icon={<AlertTriangle />}
            description="Intrusion events"
          />


          <StatCard
            title="Blocked"
            value={stats.blocked}
            icon={<Ban />}
            description="Automatically prevented"
          />


          <StatCard
            title="Traffic"
            value={`${trafficKB} KB`}
            icon={<Activity />}
            description="Total monitored traffic"
          />

        </div>


        {/* ====================================================
            ANALYTICS
        ==================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">


          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">


            <div className="mb-6">

              <h3 className="text-lg font-semibold">

                Detection Confidence

              </h3>


              <p className="text-sm text-slate-400">

                ML detection confidence for recent events

              </p>

            </div>


            <div className="h-72">


              {chartData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={chartData}
                  >

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                    />

                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748b"
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="confidence"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />

                  </AreaChart>

                </ResponsiveContainer>

              ) : (

                <div className="flex h-full items-center justify-center text-slate-500">

                  No detection data available

                </div>

              )}

            </div>

          </div>


          {/* ==================================================
              SYSTEM STATUS
          ================================================== */}

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">


            <h3 className="text-lg font-semibold">

              AI-IDAPS Components

            </h3>


            <div className="mt-6 space-y-4">


              <StatusRow
                name="FastAPI Backend"
                status={backendOnline}
              />


              <StatusRow
                name="ML Detection Engine"
                status={backendOnline}
              />


              <StatusRow
                name="Automated Prevention"
                status={backendOnline}
              />


              <StatusRow
                name="Groq AI Analyst"
                status={backendOnline}
              />


              <StatusRow
                name="Neon PostgreSQL"
                status={backendOnline}
              />


              <StatusRow
                name="WebSocket Monitoring"
                status={wsConnected}
              />

            </div>

          </div>

        </div>


        {/* ====================================================
            RECENT SECURITY EVENTS
        ==================================================== */}

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900">


          <div className="border-b border-slate-800 p-6">

            <h3 className="text-lg font-semibold">

              Recent Security Events

            </h3>


            <p className="text-sm text-slate-400">

              Live events from AI-IDAPS and Attack Simulation Console

            </p>

          </div>


          <div className="overflow-x-auto">


            <table className="w-full text-left">


              <thead className="bg-slate-800/50 text-sm text-slate-400">

                <tr>

                  <th className="px-6 py-4">
                    Source
                  </th>

                  <th className="px-6 py-4">
                    Destination
                  </th>

                  <th className="px-6 py-4">
                    Attack
                  </th>

                  <th className="px-6 py-4">
                    Confidence
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>


                {events.map(
                  (event, index) => (

                    <tr
                      key={
                        event.id ||
                        `${event.timestamp}-${index}`
                      }

                      onClick={() =>
                        setSelectedEvent(
                          event
                        )
                      }

                      className="cursor-pointer border-t border-slate-800 hover:bg-slate-800/50"
                    >


                      <td className="px-6 py-4 font-mono text-sm">

                        {event.source_ip || "-"}

                      </td>


                      <td className="px-6 py-4 font-mono text-sm">

                        {event.destination_ip ||
                          event.target ||
                          "-"}

                        {event.destination_port
                          ? `:${event.destination_port}`
                          : ""}

                      </td>


                      <td className="px-6 py-4">


                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            getAttackLabel(event) ===
                            "Normal"

                              ? "bg-green-500/10 text-green-400"

                              : "bg-red-500/10 text-red-400"
                          }`}
                        >

                          {getAttackLabel(event)}

                        </span>

                      </td>


                      <td className="px-6 py-4">

                        {Number(
                          event.confidence || 0
                        ).toFixed(1)}

                        %

                      </td>


                      <td className="px-6 py-4 font-mono text-xs">

                        {event.action ||
                          "ALERT_ONLY"}

                      </td>


                      <td className="px-6 py-4">


                        {event.status ===
                        "BLOCKED" ? (

                          <span className="flex items-center gap-2 text-red-400">

                            <Ban size={16} />

                            BLOCKED

                          </span>

                        ) : (

                          <span className="flex items-center gap-2 text-green-400">

                            <CheckCircle size={16} />

                            {event.status ||
                              "ALLOWED"}

                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {events.length === 0 && (

              <div className="p-10 text-center text-slate-500">

                No security events found.

              </div>

            )}

          </div>

        </div>

      </main>


      {/* ======================================================
          EVENT DETAILS MODAL
      ====================================================== */}

      {selectedEvent && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"

          onClick={() =>
            setSelectedEvent(null)
          }
        >


          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-7"

            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="flex items-start justify-between">


              <div>

                <h2 className="text-2xl font-bold">

                  Security Event #
                  {selectedEvent.id ||
                    "LIVE"}

                </h2>


                <p className="mt-1 text-slate-400">

                  {selectedEvent.timestamp}

                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedEvent(null)
                }

                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >

                ✕

              </button>

            </div>


            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">


              <Info
                label="Event Type"
                value={
                  selectedEvent.event_type ||
                  selectedEvent.attack_type ||
                  "Unknown"
                }
              />


              <Info
                label="ML Classification"
                value={
                  selectedEvent.ml_attack_type ||
                  selectedEvent.attack_type ||
                  "Unknown"
                }
              />


              <Info
                label="Confidence"
                value={`${selectedEvent.confidence || 0}%`}
              />


              <Info
                label="Status"
                value={
                  selectedEvent.status ||
                  "UNKNOWN"
                }
              />

            </div>


            <div className="mt-6 grid grid-cols-2 gap-4">


              <Info
                label="Source IP"
                value={
                  selectedEvent.source_ip ||
                  "-"
                }
              />


              <Info
                label="Target"
                value={
                  selectedEvent.target ||
                  selectedEvent.destination_ip ||
                  "-"
                }
              />


              <Info
                label="MITRE Technique"
                value={
                  selectedEvent.mitre_technique ||
                  "-"
                }
              />


              <Info
                label="Risk Score"
                value={
                  selectedEvent.risk_score ??
                  "-"
                }
              />

            </div>


            <div className="mt-6 rounded-lg bg-slate-950 p-5">


              <h3 className="mb-3 font-semibold text-blue-400">

                🤖 Groq AI Security Analysis

              </h3>


              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">

                {selectedEvent.ai_analysis ||
                  "AI analysis is not available for this event."}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  icon,
  description
}) {

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">


      <div className="flex items-center justify-between">


        <div>

          <p className="text-sm text-slate-400">

            {title}

          </p>


          <p className="mt-2 text-3xl font-bold">

            {value}

          </p>


          <p className="mt-1 text-xs text-slate-500">

            {description}

          </p>

        </div>


        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">

          {icon}

        </div>

      </div>

    </div>

  );

}


// ============================================================
// STATUS ROW
// ============================================================

function StatusRow({
  name,
  status
}) {

  return (

    <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4">


      <span className="text-sm">

        {name}

      </span>


      <span className="flex items-center gap-2 text-xs">


        <span
          className={`h-2.5 w-2.5 rounded-full ${
            status
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        />


        {status
          ? "ONLINE"
          : "OFFLINE"}

      </span>

    </div>

  );

}


// ============================================================
// INFO
// ============================================================

function Info({
  label,
  value
}) {

  return (

    <div className="rounded-lg bg-slate-800 p-4">


      <p className="text-xs text-slate-400">

        {label}

      </p>


      <p className="mt-1 font-semibold">

        {value}

      </p>

    </div>

  );

}


export default App;