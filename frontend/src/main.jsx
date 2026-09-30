import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  ShieldCheck,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Ban,
  Brain,
  Network,
  Database,
  Settings,
  FileText,
  Bell,
  Search,
  RefreshCw,
  Play,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  Server,
  Cpu,
  Menu,
  X,
  Eye,
  Clock,
  Globe,
  Lock,
  Zap,
  BarChart3,
} from "lucide-react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./index.css";

const API_URL = import.meta.env.VITE_API_URL;


/* =========================================================
   HELPERS
========================================================= */

function attackName(event) {
  return String(event.attack_type || "Unknown");
}

function eventStatus(event) {
  return String(event.status || "UNKNOWN").toUpperCase();
}

function confidence(event) {
  return Number(event.confidence || 0);
}

function threatEvent(event) {
  return attackName(event).toLowerCase() !== "normal";
}

function timeOnly(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return "-";
  }
}

function fullTime(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}


/* =========================================================
   STATUS
========================================================= */

function StatusDot({ online = true }) {
  return (
    <span
      className={
        online
          ? "inline-block w-2 h-2 rounded-full bg-emerald-400"
          : "inline-block w-2 h-2 rounded-full bg-red-400"
      }
    />
  );
}


/* =========================================================
   BADGES
========================================================= */

function ThreatBadge({ event }) {

  const name = attackName(event);

  const normal =
    name.toLowerCase() === "normal";

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold " +
        (normal
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border-red-500/20")
      }
    >
      {normal ? (
        <CircleCheck size={12} />
      ) : (
        <ShieldAlert size={12} />
      )}

      {name}
    </span>
  );
}


function ActionBadge({ event }) {

  const blocked =
    eventStatus(event) === "BLOCKED";

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold " +
        (blocked
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")
      }
    >
      {blocked ? (
        <Ban size={12} />
      ) : (
        <CircleCheck size={12} />
      )}

      {event.action || "ALLOW"}
    </span>
  );
}


/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  active,
  setActive,
  mobileOpen,
  setMobileOpen,
}) {

  const groups = [
    {
      title: "MONITORING",
      items: [
        {
          id: "overview",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          id: "monitoring",
          label: "Live Monitoring",
          icon: Activity,
        },
      ],
    },

    {
      title: "SECURITY",
      items: [
        {
          id: "threats",
          label: "Threat Detection",
          icon: ShieldAlert,
        },
        {
          id: "prevention",
          label: "Prevention",
          icon: Ban,
        },
        {
          id: "ai",
          label: "AI Analysis",
          icon: Brain,
        },
      ],
    },

    {
      title: "OPERATIONS",
      items: [
        {
          id: "network",
          label: "Network Traffic",
          icon: Network,
        },
        {
          id: "events",
          label: "Security Events",
          icon: FileText,
        },
        {
          id: "reports",
          label: "Reports",
          icon: FileText,
        },
      ],
    },

    {
      title: "SYSTEM",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={
          "fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 z-50 transition-transform lg:translate-x-0 " +
          (mobileOpen
            ? "translate-x-0"
            : "-translate-x-full")
        }
      >

        <div className="h-full flex flex-col">

          {/* BRAND */}

          <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800">

            <div className="flex items-center gap-3">

              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">

                <ShieldCheck
                  size={25}
                  className="text-blue-400"
                />

              </div>

              <div>

                <h1 className="font-bold text-white">
                  AI-IDAPS
                </h1>

                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Security Platform
                </p>

              </div>

            </div>

            <button
              className="lg:hidden text-slate-400"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              <X size={20} />
            </button>

          </div>


          {/* NAVIGATION */}

          <nav className="flex-1 overflow-y-auto px-3 py-5">

            {groups.map((group) => (

              <div
                key={group.title}
                className="mb-6"
              >

                <p className="px-3 mb-2 text-[10px] font-bold tracking-widest text-slate-600">
                  {group.title}
                </p>

                <div className="space-y-1">

                  {group.items.map((item) => {

                    const Icon = item.icon;

                    const selected =
                      active === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActive(item.id);
                          setMobileOpen(false);
                        }}
                        className={
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition " +
                          (selected
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                            : "text-slate-400 hover:text-white hover:bg-slate-900")
                        }
                      >

                        <Icon size={17} />

                        <span>
                          {item.label}
                        </span>

                        {selected && (
                          <ChevronRight
                            size={14}
                            className="ml-auto"
                          />
                        )}

                      </button>
                    );

                  })}

                </div>

              </div>

            ))}

          </nav>


          {/* SYSTEM */}

          <div className="p-4 border-t border-slate-800">

            <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3">

              <div className="flex items-center gap-2">

                <StatusDot />

                <span className="text-xs font-semibold text-emerald-400">
                  SYSTEM ONLINE
                </span>

              </div>

              <p className="text-[10px] text-slate-500 mt-2">
                AI-IDAPS Core Services
              </p>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}


/* =========================================================
   HEADER
========================================================= */

function Header({
  title,
  setMobileOpen,
  refresh,
  loading,
  simulate,
}) {

  return (
    <header className="h-20 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl sticky top-0 z-30">

      <div className="h-full px-5 lg:px-8 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <button
            className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu size={20} />
          </button>

          <div>

            <p className="text-xs text-slate-500">
              Security Operations Center
            </p>

            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

          </div>

        </div>


        <div className="flex items-center gap-2">

          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">

            <StatusDot />

            <span className="text-[11px] text-emerald-400 font-semibold">
              SYSTEM ONLINE
            </span>

          </div>


          <button
            onClick={refresh}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >

            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

          </button>


          <button
            className="relative p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
          >

            <Bell size={17} />

            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-400" />

          </button>


          <button
            onClick={simulate}
            disabled={loading}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold"
          >

            <Play size={15} />

            Simulate

          </button>

        </div>

      </div>

    </header>
  );
}


/* =========================================================
   KPI
========================================================= */

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}) {

  return (
    <div className="glass rounded-2xl border border-slate-800/60 p-5 hover:border-slate-700 transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {value}
          </h2>

          <p className="text-xs text-slate-500 mt-2">
            {subtitle}
          </p>

        </div>

        <div
          className={
            "p-3 rounded-xl bg-slate-900 " +
            iconClass
          }
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PLATFORM SERVICE
========================================================= */

function Service({
  name,
  description,
  icon,
}) {

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">

      <div className="p-2 rounded-lg bg-slate-900">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm font-semibold text-white">
          {name}
        </p>

        <p className="text-[11px] text-slate-500">
          {description}
        </p>

      </div>

      <div className="flex items-center gap-1.5">

        <StatusDot />

        <span className="text-[10px] text-emerald-400">
          Operational
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   OVERVIEW PAGE
========================================================= */

function Overview({
  stats,
  events,
  refresh,
}) {

  const trafficMB =
    Number(stats.traffic_bytes || 0) /
    (1024 * 1024);


  const chartData =
    events
      .slice()
      .reverse()
      .map((event, index) => ({
        name: String(index + 1),
        confidence: confidence(event),
      }));


  return (
    <div className="space-y-6">

      {/* TITLE */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">

        <div>

          <div className="flex items-center gap-2">

            <StatusDot />

            <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
              Security Monitoring Active
            </span>

          </div>

          <h1 className="text-2xl font-bold text-white mt-2">
            Security Overview
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            AI-powered intrusion detection and automated prevention
          </p>

        </div>

        <p className="text-xs text-slate-600">
          Auto-refresh: 4 seconds
        </p>

      </div>


      {/* KPIs */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <KpiCard
          title="Total Events"
          value={stats.events || 0}
          subtitle="Network flows analyzed"
          icon={<Activity size={21} />}
          iconClass="text-blue-400"
        />

        <KpiCard
          title="Threats Detected"
          value={stats.attacks || 0}
          subtitle="Suspicious network activity"
          icon={<ShieldAlert size={21} />}
          iconClass="text-red-400"
        />

        <KpiCard
          title="Threats Blocked"
          value={stats.blocked || 0}
          subtitle="Automated prevention"
          icon={<Ban size={21} />}
          iconClass="text-orange-400"
        />

        <KpiCard
          title="Traffic Processed"
          value={
            trafficMB.toFixed(2) +
            " MB"
          }
          subtitle="Total observed traffic"
          icon={<Network size={21} />}
          iconClass="text-emerald-400"
        />

      </div>


      {/* ANALYTICS */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* CHART */}

        <div className="xl:col-span-2 glass rounded-2xl border border-slate-800/60 p-5">

          <div className="flex items-start justify-between mb-5">

            <div>

              <h2 className="font-semibold text-white">
                Detection Confidence
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                ML confidence across recent network events
              </p>

            </div>

            <BarChart3
              size={19}
              className="text-blue-400"
            />

          </div>


          <div className="h-72">

            {chartData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart data={chartData}>

                  <defs>

                    <linearGradient
                      id="overviewConfidence"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="100%"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.08}
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    fontSize={10}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="#60a5fa"
                    fill="url(#overviewConfidence)"
                    strokeWidth={2}
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-600">
                No detection data available
              </div>

            )}

          </div>

        </div>


        {/* SERVICES */}

        <div className="glass rounded-2xl border border-slate-800/60 p-5">

          <h2 className="font-semibold text-white">
            Platform Services
          </h2>

          <p className="text-xs text-slate-500 mt-1 mb-5">
            AI-IDAPS infrastructure
          </p>

          <div className="space-y-3">

            <Service
              name="Groq AI"
              description="AI security analysis"
              icon={
                <Brain
                  size={18}
                  className="text-purple-400"
                />
              }
            />

            <Service
              name="ML Detector"
              description="Threat classification"
              icon={
                <Cpu
                  size={18}
                  className="text-blue-400"
                />
              }
            />

            <Service
              name="Neon PostgreSQL"
              description="Security event storage"
              icon={
                <Database
                  size={18}
                  className="text-cyan-400"
                />
              }
            />

            <Service
              name="FastAPI"
              description="Backend API service"
              icon={
                <Server
                  size={18}
                  className="text-emerald-400"
                />
              }
            />

          </div>

        </div>

      </div>


      {/* RECENT EVENTS */}

      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">

          <div>

            <h2 className="font-semibold text-white">
              Recent Security Events
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Latest activity detected by AI-IDAPS
            </p>

          </div>

          <button
            onClick={refresh}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >

            <RefreshCw size={13} />

            Refresh

          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>

              <tr className="bg-slate-950/70">

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Time
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Source
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Detection
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Confidence
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Response
                </th>

              </tr>

            </thead>


            <tbody>

              {events.slice(0, 8).map((event) => (

                <tr
                  key={event.id}
                  className="border-t border-slate-800/50 hover:bg-slate-900/40 transition"
                >

                  <td className="px-5 py-4 text-xs text-slate-400">
                    {timeOnly(
                      event.timestamp
                    )}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-slate-300">
                    {event.source_ip}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-slate-300">
                    {event.destination_ip}
                  </td>

                  <td className="px-5 py-4">
                    <ThreatBadge
                      event={event}
                    />
                  </td>

                  <td className="px-5 py-4 text-xs font-semibold">
                    {confidence(event).toFixed(1)}%
                  </td>

                  <td className="px-5 py-4">
                    <ActionBadge
                      event={event}
                    />
                  </td>

                </tr>

              ))}

              {events.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="py-12 text-center text-sm text-slate-600"
                  >
                    No security events found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* PIPELINE */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <h2 className="font-semibold text-white">
          AI-IDAPS Security Pipeline
        </h2>

        <p className="text-xs text-slate-500 mt-1 mb-5">
          End-to-end intelligent security processing
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <Pipeline
            number="01"
            title="Network Flow"
            text="Traffic input"
            icon={<Network size={18} />}
          />

          <Pipeline
            number="02"
            title="ML Detection"
            text="Classification"
            icon={<Cpu size={18} />}
          />

          <Pipeline
            number="03"
            title="Prevention"
            text="Automated response"
            icon={<Ban size={18} />}
          />

          <Pipeline
            number="04"
            title="Groq AI"
            text="Threat analysis"
            icon={<Brain size={18} />}
          />

          <Pipeline
            number="05"
            title="Neon DB"
            text="Audit storage"
            icon={<Database size={18} />}
          />

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   PIPELINE
========================================================= */

function Pipeline({
  number,
  title,
  text,
  icon,
}) {

  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

      <div className="flex items-center justify-between">

        <span className="text-[10px] text-slate-600 font-bold">
          {number}
        </span>

        <span className="text-blue-400">
          {icon}
        </span>

      </div>

      <h3 className="text-sm font-semibold text-white mt-4">
        {title}
      </h3>

      <p className="text-[11px] text-slate-500 mt-1">
        {text}
      </p>

    </div>
  );
}
/* =========================================================
   THREAT DETECTION
========================================================= */

function ThreatDetection({ events }) {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const threats = events.filter(threatEvent);

  const filtered = useMemo(() => {

    const query = search.toLowerCase().trim();

    return threats.filter((event) => {

      const attack =
        attackName(event).toLowerCase();

      const source =
        String(event.source_ip || "").toLowerCase();

      const destination =
        String(event.destination_ip || "").toLowerCase();

      const status =
        eventStatus(event);

      const c =
        confidence(event);

      if (filter === "CRITICAL" && c < 95) {
        return false;
      }

      if (
        filter === "HIGH" &&
        (c < 80 || c >= 95)
      ) {
        return false;
      }

      if (
        filter === "MEDIUM" &&
        (c < 50 || c >= 80)
      ) {
        return false;
      }

      if (
        filter === "BLOCKED" &&
        status !== "BLOCKED"
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        attack.includes(query) ||
        source.includes(query) ||
        destination.includes(query)
      );

    });

  }, [events, search, filter]);


  const critical =
    threats.filter(
      (event) => confidence(event) >= 95
    ).length;

  const high =
    threats.filter(
      (event) =>
        confidence(event) >= 80 &&
        confidence(event) < 95
    ).length;

  const medium =
    threats.filter(
      (event) =>
        confidence(event) >= 50 &&
        confidence(event) < 80
    ).length;

  const blocked =
    threats.filter(
      (event) =>
        eventStatus(event) === "BLOCKED"
    ).length;


  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div>

        <div className="flex items-center gap-2">

          <StatusDot />

          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            Threat Detection Engine Active
          </span>

        </div>

        <h1 className="text-2xl font-bold text-white mt-2">
          Threat Detection
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Machine-learning based identification and investigation of
          suspicious network activity
        </p>

      </div>


      {/* THREAT STATISTICS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <ThreatStat
          title="Total Threats"
          value={threats.length}
          icon={<ShieldAlert size={20} />}
          iconClass="text-red-400"
        />

        <ThreatStat
          title="Critical"
          value={critical}
          icon={<Zap size={20} />}
          iconClass="text-red-400"
        />

        <ThreatStat
          title="High"
          value={high}
          icon={<CircleAlert size={20} />}
          iconClass="text-orange-400"
        />

        <ThreatStat
          title="Blocked"
          value={blocked}
          icon={<Ban size={20} />}
          iconClass="text-purple-400"
        />

      </div>


      {/* DETECTION ENGINE */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">

              <Cpu
                size={22}
                className="text-blue-400"
              />

            </div>

            <div>

              <h2 className="font-semibold text-white">
                AI Threat Detection Engine
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Network flow classification and confidence analysis
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <StatusDot />

            <span className="text-xs text-emerald-400 font-semibold">
              OPERATIONAL
            </span>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Detection
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              ML Classification
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Input
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Network Flow
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Prevention
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Automated Response
            </p>

          </div>

        </div>

      </div>


      {/* FILTERS */}

      <div className="glass rounded-xl border border-slate-800/60 p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search attack type or IP address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 text-slate-200"
            />

          </div>


          <div className="flex gap-2 flex-wrap">

            {[
              "ALL",
              "CRITICAL",
              "HIGH",
              "MEDIUM",
              "BLOCKED",
            ].map((item) => (

              <button
                key={item}
                onClick={() =>
                  setFilter(item)
                }
                className={
                  "px-3 py-2 rounded-lg text-[11px] font-semibold border " +
                  (
                    filter === item
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-slate-950 text-slate-500 border-slate-800 hover:text-white"
                  )
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </div>


      {/* THREAT TABLE */}

      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-white">
                Detected Threats
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {filtered.length} threat events displayed
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />

              <span className="text-[10px] text-red-400 uppercase font-semibold">
                Monitoring
              </span>

            </div>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr className="bg-slate-950/70">

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Time
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Threat
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Source
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Confidence
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Action
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Investigation
                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.map((event) => {

                const c =
                  confidence(event);

                return (

                  <tr
                    key={event.id}
                    className="border-t border-slate-800/50 hover:bg-slate-900/50 transition"
                  >

                    {/* TIME */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <Clock
                          size={13}
                          className="text-slate-600"
                        />

                        <span className="text-xs text-slate-400">
                          {timeOnly(event.timestamp)}
                        </span>

                      </div>

                    </td>


                    {/* THREAT */}

                    <td className="px-5 py-4">

                      <ThreatBadge
                        event={event}
                      />

                    </td>


                    {/* SOURCE */}

                    <td className="px-5 py-4">

                      <div>

                        <p className="font-mono text-xs text-slate-200">
                          {event.source_ip}
                        </p>

                        <p className="text-[10px] text-slate-600 mt-1">
                          Port {event.source_port}
                        </p>

                      </div>

                    </td>


                    {/* DESTINATION */}

                    <td className="px-5 py-4">

                      <div>

                        <p className="font-mono text-xs text-slate-200">
                          {event.destination_ip}
                        </p>

                        <p className="text-[10px] text-slate-600 mt-1">
                          Port {event.destination_port}
                        </p>

                      </div>

                    </td>


                    {/* CONFIDENCE */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className={
                              "h-full " +
                              (
                                c >= 95
                                  ? "bg-red-500"
                                  : c >= 80
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                              )
                            }
                            style={{
                              width:
                                Math.min(c, 100) +
                                "%",
                            }}
                          />

                        </div>

                        <span className="text-xs font-semibold text-slate-300">
                          {c.toFixed(1)}%
                        </span>

                      </div>

                    </td>


                    {/* ACTION */}

                    <td className="px-5 py-4">

                      <ActionBadge
                        event={event}
                      />

                    </td>


                    {/* INVESTIGATE */}

                    <td className="px-5 py-4">

                      <button
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition"
                      >

                        <Eye size={14} />

                        Investigate

                      </button>

                    </td>

                  </tr>

                );

              })}


              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="py-14 text-center"
                  >

                    <CircleCheck
                      size={32}
                      className="mx-auto text-emerald-400"
                    />

                    <p className="text-sm text-slate-400 mt-3">
                      No threats found
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Try another filter or run the simulation
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* THREAT BREAKDOWN */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="glass rounded-2xl border border-slate-800/60 p-5">

          <h2 className="font-semibold text-white">
            Attack Classification
          </h2>

          <p className="text-xs text-slate-500 mt-1 mb-5">
            Threat categories identified by the ML detector
          </p>


          <div className="space-y-3">

            {Object.entries(
              threats.reduce((result, event) => {

                const name =
                  attackName(event);

                result[name] =
                  (result[name] || 0) + 1;

                return result;

              }, {})
            ).map(([name, count]) => (

              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
              >

                <div className="flex items-center gap-3">

                  <ShieldAlert
                    size={17}
                    className="text-red-400"
                  />

                  <span className="text-sm text-slate-300">
                    {name}
                  </span>

                </div>

                <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {count}
                </span>

              </div>

            ))}


            {threats.length === 0 && (

              <p className="text-sm text-slate-600 text-center py-8">
                No attack classifications available
              </p>

            )}

          </div>

        </div>


        {/* DETECTION PIPELINE */}

        <div className="glass rounded-2xl border border-slate-800/60 p-5">

          <h2 className="font-semibold text-white">
            Threat Detection Pipeline
          </h2>

          <p className="text-xs text-slate-500 mt-1 mb-5">
            Processing path for every network event
          </p>


          <div className="space-y-3">

            <ThreatPipeline
              number="01"
              title="Network Flow"
              description="Traffic metadata received"
              icon={<Network size={16} />}
            />

            <ThreatPipeline
              number="02"
              title="Feature Analysis"
              description="Traffic characteristics evaluated"
              icon={<BarChart3 size={16} />}
            />

            <ThreatPipeline
              number="03"
              title="ML Detection"
              description="Attack classification performed"
              icon={<Cpu size={16} />}
            />

            <ThreatPipeline
              number="04"
              title="Confidence Score"
              description="Threat confidence calculated"
              icon={<Zap size={16} />}
            />

            <ThreatPipeline
              number="05"
              title="Automated Prevention"
              description="Response decision generated"
              icon={<Ban size={16} />}
            />

          </div>

        </div>

      </div>


      {/* INVESTIGATION */}

      {selectedEvent && (

        <Investigation
          event={selectedEvent}
          close={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>
  );
}


/* =========================================================
   THREAT STAT
========================================================= */

function ThreatStat({
  title,
  value,
  icon,
  iconClass,
}) {

  return (

    <div className="glass rounded-2xl border border-slate-800/60 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-white mt-2">
            {value}
          </p>

        </div>

        <div
          className={
            "p-3 rounded-xl bg-slate-900 " +
            iconClass
          }
        >
          {icon}
        </div>

      </div>

    </div>

  );
}


/* =========================================================
   THREAT PIPELINE
========================================================= */

function ThreatPipeline({
  number,
  title,
  description,
  icon,
}) {

  return (

    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">

      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">

        <div className="flex items-center gap-2">

          <span className="text-[9px] text-slate-600 font-bold">
            {number}
          </span>

          <span className="text-sm font-semibold text-white">
            {title}
          </span>

        </div>

        <p className="text-[10px] text-slate-500 mt-1">
          {description}
        </p>

      </div>

      <CircleCheck
        size={15}
        className="text-emerald-400"
      />

    </div>

  );
}


/* =========================================================
   LIVE MONITORING
========================================================= */

function LiveMonitoring({
  events,
}) {

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [selectedEvent, setSelectedEvent] =
    useState(null);


  const filtered = useMemo(() => {

    const query =
      search.toLowerCase().trim();

    return events.filter((event) => {

      const attack =
        attackName(event).toLowerCase();

      const source =
        String(
          event.source_ip || ""
        ).toLowerCase();

      const destination =
        String(
          event.destination_ip || ""
        ).toLowerCase();

      const protocol =
        String(
          event.protocol || ""
        ).toLowerCase();

      const status =
        eventStatus(event);

      if (
        filter === "THREATS" &&
        !threatEvent(event)
      ) {
        return false;
      }

      if (
        filter === "BLOCKED" &&
        status !== "BLOCKED"
      ) {
        return false;
      }

      if (
        filter === "ALLOWED" &&
        status === "BLOCKED"
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        attack.includes(query) ||
        source.includes(query) ||
        destination.includes(query) ||
        protocol.includes(query)
      );

    });

  }, [events, search, filter]);


  const threatCount =
    events.filter(threatEvent).length;

  const blockedCount =
    events.filter(
      (event) =>
        eventStatus(event) ===
        "BLOCKED"
    ).length;

  const average =
    events.length
      ? events.reduce(
          (sum, event) =>
            sum + confidence(event),
          0
        ) / events.length
      : 0;


  return (
    <div className="space-y-6">

      <div>

        <div className="flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            Real-Time Monitoring
          </span>

        </div>

        <h1 className="text-2xl font-bold text-white mt-2">
          Network Security Monitor
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Continuous monitoring of AI-detected network activity
        </p>

      </div>


      {/* MONITOR STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <MiniStat
          title="Events"
          value={events.length}
          icon={<Activity size={18} />}
        />

        <MiniStat
          title="Threats"
          value={threatCount}
          icon={<ShieldAlert size={18} />}
        />

        <MiniStat
          title="Blocked"
          value={blockedCount}
          icon={<Ban size={18} />}
        />

        <MiniStat
          title="Avg Confidence"
          value={
            average.toFixed(1) +
            "%"
          }
          icon={<Brain size={18} />}
        />

      </div>


      {/* SEARCH */}

      <div className="glass rounded-xl border border-slate-800/60 p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search IP, protocol or attack type..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 text-slate-200"
            />

          </div>


          <div className="flex gap-2">

            {[
              "ALL",
              "THREATS",
              "BLOCKED",
              "ALLOWED",
            ].map((item) => (

              <button
                key={item}
                onClick={() =>
                  setFilter(item)
                }
                className={
                  "px-3 py-2 rounded-lg text-[11px] font-semibold border " +
                  (filter === item
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-slate-950 text-slate-500 border-slate-800")
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </div>


      {/* TABLE */}

      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60">

          <h2 className="font-semibold text-white">
            Live Security Events
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {filtered.length} events displayed
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1150px]">

            <thead>

              <tr className="bg-slate-950/70">

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Time
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Source
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Protocol
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Detection
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Confidence
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Response
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase text-slate-500">
                  Inspect
                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.map((event) => (

                <tr
                  key={event.id}
                  className="border-t border-slate-800/50 hover:bg-slate-900/50"
                >

                  <td className="px-5 py-4 text-xs text-slate-400">
                    {timeOnly(
                      event.timestamp
                    )}
                  </td>

                  <td className="px-5 py-4">

                    <p className="font-mono text-xs text-slate-200">
                      {event.source_ip}
                    </p>

                    <p className="text-[10px] text-slate-600 mt-1">
                      Port {event.source_port}
                    </p>

                  </td>

                  <td className="px-5 py-4">

                    <p className="font-mono text-xs text-slate-200">
                      {event.destination_ip}
                    </p>

                    <p className="text-[10px] text-slate-600 mt-1">
                      Port {event.destination_port}
                    </p>

                  </td>

                  <td className="px-5 py-4">

                    <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                      {event.protocol}
                    </span>

                  </td>

                  <td className="px-5 py-4">
                    <ThreatBadge
                      event={event}
                    />
                  </td>

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width:
                              Math.min(
                                confidence(
                                  event
                                ),
                                100
                              ) + "%",
                          }}
                        />

                      </div>

                      <span className="text-xs font-semibold">
                        {confidence(
                          event
                        ).toFixed(1)}
                        %
                      </span>

                    </div>

                  </td>

                  <td className="px-5 py-4">
                    <ActionBadge
                      event={event}
                    />
                  </td>

                  <td className="px-5 py-4">

                    <button
                      onClick={() =>
                        setSelectedEvent(
                          event
                        )
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400"
                    >
                      <Eye size={15} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {selectedEvent && (
        <Investigation
          event={selectedEvent}
          close={() =>
            setSelectedEvent(
              null
            )
          }
        />
      )}

    </div>
  );
}


/* =========================================================
   MONITOR STAT
========================================================= */

function MiniStat({
  title,
  value,
  icon,
}) {

  return (
    <div className="glass rounded-xl border border-slate-800/60 p-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-white mt-1">
            {value}
          </p>

        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 text-blue-400">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   INVESTIGATION
========================================================= */

function Investigation({
  event,
  close,
}) {

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={close}
    >

      <div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="p-2 rounded-lg bg-red-500/10">
              <ShieldAlert
                size={20}
                className="text-red-400"
              />
            </div>

            <div>

              <h2 className="font-bold text-white">
                Security Event Investigation
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Event #{event.id}
              </p>

            </div>

          </div>

          <button
            onClick={close}
            className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>


        <div className="p-6 space-y-6">

          {/* Summary */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            <InfoBox
              label="Detection"
              value={
                event.attack_type
              }
            />

            <InfoBox
              label="Confidence"
              value={
                confidence(event).toFixed(
                  2
                ) + "%"
              }
            />

            <InfoBox
              label="Action"
              value={
                event.action ||
                "ALLOW"
              }
            />

            <InfoBox
              label="Status"
              value={
                eventStatus(event)
              }
            />

          </div>


          {/* Flow */}

          <div>

            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">

              <Network
                size={17}
                className="text-blue-400"
              />

              Network Flow

            </h3>


            <div className="grid md:grid-cols-2 gap-4">

              <Flow
                title="Source"
                ip={event.source_ip}
                port={event.source_port}
              />

              <Flow
                title="Destination"
                ip={event.destination_ip}
                port={
                  event.destination_port
                }
              />

            </div>

          </div>


          {/* Metrics */}

          <div>

            <h3 className="font-semibold text-white mb-3">
              Traffic Metrics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              <Metric
                label="Protocol"
                value={
                  event.protocol
                }
              />

              <Metric
                label="Duration"
                value={
                  String(
                    event.duration ??
                      "-"
                  ) + " sec"
                }
              />

              <Metric
                label="Packets"
                value={
                  event.packets ??
                  "-"
                }
              />

              <Metric
                label="Bytes"
                value={
                  event.bytes_transferred ??
                  "-"
                }
              />

            </div>

          </div>


          {/* ML + Prevention */}

          <div className="grid md:grid-cols-2 gap-5">

            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">

              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">

                <Cpu
                  size={17}
                  className="text-blue-400"
                />

                ML Detection

              </h3>

              <div className="space-y-3">

                <Row
                  label="Attack Type"
                  value={
                    event.attack_type
                  }
                />

                <Row
                  label="Confidence"
                  value={
                    confidence(
                      event
                    ).toFixed(2) +
                    "%"
                  }
                />

                <Row
                  label="SYN Count"
                  value={
                    event.syn_count ??
                    "-"
                  }
                />

                <Row
                  label="Failed Connections"
                  value={
                    event.failed_connections ??
                    "-"
                  }
                />

              </div>

            </div>


            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">

              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">

                <Ban
                  size={17}
                  className="text-red-400"
                />

                Prevention Engine

              </h3>

              <div className="space-y-3">

                <Row
                  label="Action"
                  value={
                    event.action
                  }
                />

                <Row
                  label="Status"
                  value={
                    eventStatus(event)
                  }
                />

                <Row
                  label="Timestamp"
                  value={
                    fullTime(
                      event.timestamp
                    )
                  }
                />

              </div>

            </div>

          </div>


          {/* AI */}

          <div className="rounded-xl bg-purple-500/[0.035] border border-purple-500/15 p-5">

            <h3 className="font-semibold text-white flex items-center gap-2">

              <Brain
                size={18}
                className="text-purple-400"
              />

              Groq AI Security Analysis

            </h3>

            <p className="text-[11px] text-slate-500 mt-1 mb-4">
              AI-assisted cybersecurity analysis
            </p>

            <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-4">

              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-7">

                {event.ai_analysis ||
                  "AI analysis is not available."}

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   INVESTIGATION HELPERS
========================================================= */

function InfoBox({
  label,
  value,
}) {

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">

      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="text-sm font-bold text-white mt-2">
        {value || "-"}
      </p>

    </div>
  );
}


function Flow({
  title,
  ip,
  port,
}) {

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">

      <div className="flex items-center gap-2 text-slate-500 text-xs uppercase">
        <Globe size={14} />
        {title}
      </div>

      <p className="font-mono text-lg text-white mt-3">
        {ip || "-"}
      </p>

      <p className="text-xs text-slate-500 mt-1">
        Port {port ?? "-"}
      </p>

    </div>
  );
}


function Metric({
  label,
  value,
}) {

  return (
    <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">

      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-300 mt-1">
        {value}
      </p>

    </div>
  );
}


function Row({
  label,
  value,
}) {

  return (
    <div className="flex justify-between gap-4 border-b border-slate-800/60 pb-2 last:border-0">

      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs text-slate-300 text-right">
        {value || "-"}
      </span>

    </div>
  );
}


/* =========================================================
   PLACEHOLDER
========================================================= */

function PlaceholderPage({
  title,
  description,
  icon,
}) {

  return (
    <div className="min-h-[600px] glass rounded-2xl border border-slate-800/60 flex items-center justify-center">

      <div className="text-center max-w-md px-6">

        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">

          {icon}

        </div>

        <h1 className="text-2xl font-bold text-white mt-5">
          {title}
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          {description}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-500">

          <CircleAlert size={14} />

          Module scheduled for next development stage

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SECURITY EVENTS
========================================================= */

function SecurityEvents({ events }) {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);


  /* =======================================================
     EVENT COUNTS
  ======================================================= */

  const threats =
    events.filter(threatEvent).length;

  const blocked =
    events.filter(
      (event) =>
        eventStatus(event) === "BLOCKED"
    ).length;

  const allowed =
    events.filter(
      (event) =>
        eventStatus(event) !== "BLOCKED"
    ).length;


  /* =======================================================
     FILTER EVENTS
  ======================================================= */

  const filtered = useMemo(() => {

    const query =
      search.toLowerCase().trim();

    return events.filter((event) => {

      const attack =
        attackName(event).toLowerCase();

      const source =
        String(
          event.source_ip || ""
        ).toLowerCase();

      const destination =
        String(
          event.destination_ip || ""
        ).toLowerCase();

      const protocol =
        String(
          event.protocol || ""
        ).toLowerCase();

      const status =
        eventStatus(event);


      if (
        filter === "THREATS" &&
        !threatEvent(event)
      ) {
        return false;
      }


      if (
        filter === "BLOCKED" &&
        status !== "BLOCKED"
      ) {
        return false;
      }


      if (
        filter === "ALLOWED" &&
        status === "BLOCKED"
      ) {
        return false;
      }


      if (!query) {
        return true;
      }


      return (
        attack.includes(query) ||
        source.includes(query) ||
        destination.includes(query) ||
        protocol.includes(query)
      );

    });

  }, [
    events,
    search,
    filter,
  ]);


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <div className="flex items-center gap-2">

          <StatusDot />

          <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
            Security Event Logging Active
          </span>

        </div>

        <h1 className="text-2xl font-bold text-white mt-2">
          Security Events
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Centralized security event monitoring and audit management
        </p>

      </div>


      {/* EVENT STATISTICS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <EventStat
          title="Total Events"
          value={events.length}
          icon={<FileText size={20} />}
          iconClass="text-blue-400"
        />

        <EventStat
          title="Threat Events"
          value={threats}
          icon={<ShieldAlert size={20} />}
          iconClass="text-red-400"
        />

        <EventStat
          title="Blocked"
          value={blocked}
          icon={<Ban size={20} />}
          iconClass="text-orange-400"
        />

        <EventStat
          title="Allowed"
          value={allowed}
          icon={<CircleCheck size={20} />}
          iconClass="text-emerald-400"
        />

      </div>


      {/* EVENT LOGGER */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">

              <FileText
                size={22}
                className="text-blue-400"
              />

            </div>

            <div>

              <h2 className="font-semibold text-white">
                Security Event Logger
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Centralized event collection and audit trail
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <StatusDot />

            <span className="text-xs text-emerald-400 font-semibold">
              LOGGING ACTIVE
            </span>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Storage
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Neon PostgreSQL
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              API
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              FastAPI
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Retention
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Event History
            </p>

          </div>

        </div>

      </div>


      {/* SEARCH / FILTER */}

      <div className="glass rounded-xl border border-slate-800/60 p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search event, IP address, protocol or attack..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 text-slate-200"
            />

          </div>


          <div className="flex gap-2 flex-wrap">

            {[
              "ALL",
              "THREATS",
              "BLOCKED",
              "ALLOWED",
            ].map((item) => (

              <button
                key={item}
                onClick={() =>
                  setFilter(item)
                }
                className={
                  "px-3 py-2 rounded-lg text-[11px] font-semibold border " +
                  (
                    filter === item
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-slate-950 text-slate-500 border-slate-800 hover:text-white"
                  )
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </div>


      {/* AUDIT TABLE */}

      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">

          <div>

            <h2 className="font-semibold text-white">
              Security Event Audit Log
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {filtered.length} events displayed
            </p>

          </div>

          <div className="hidden sm:flex items-center gap-2">

            <Database
              size={14}
              className="text-cyan-400"
            />

            <span className="text-[10px] text-slate-500">
              PostgreSQL
            </span>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1250px]">

            <thead>

              <tr className="bg-slate-950/70">

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Event ID
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Timestamp
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Source
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Protocol
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Detection
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Confidence
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Action
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Inspect
                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.map((event) => (

                <tr
                  key={event.id}
                  className="border-t border-slate-800/50 hover:bg-slate-900/50 transition"
                >

                  {/* EVENT ID */}

                  <td className="px-5 py-4">

                    <span className="font-mono text-xs text-blue-400">
                      #{event.id}
                    </span>

                  </td>


                  {/* TIMESTAMP */}

                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <Clock
                        size={13}
                        className="text-slate-600"
                      />

                      <span className="text-xs text-slate-400">
                        {fullTime(event.timestamp)}
                      </span>

                    </div>

                  </td>


                  {/* SOURCE */}

                  <td className="px-5 py-4">

                    <div>

                      <p className="font-mono text-xs text-slate-200">
                        {event.source_ip}
                      </p>

                      <p className="text-[10px] text-slate-600 mt-1">
                        Port {event.source_port}
                      </p>

                    </div>

                  </td>


                  {/* DESTINATION */}

                  <td className="px-5 py-4">

                    <div>

                      <p className="font-mono text-xs text-slate-200">
                        {event.destination_ip}
                      </p>

                      <p className="text-[10px] text-slate-600 mt-1">
                        Port {event.destination_port}
                      </p>

                    </div>

                  </td>


                  {/* PROTOCOL */}

                  <td className="px-5 py-4">

                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                      {event.protocol || "-"}
                    </span>

                  </td>


                  {/* DETECTION */}

                  <td className="px-5 py-4">

                    <ThreatBadge
                      event={event}
                    />

                  </td>


                  {/* CONFIDENCE */}

                  <td className="px-5 py-4">

                    <span className="text-xs font-semibold text-slate-300">
                      {confidence(event).toFixed(1)}%
                    </span>

                  </td>


                  {/* ACTION */}

                  <td className="px-5 py-4">

                    <ActionBadge
                      event={event}
                    />

                  </td>


                  {/* INSPECT */}

                  <td className="px-5 py-4">

                    <button
                      onClick={() =>
                        setSelectedEvent(event)
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition"
                    >

                      <Eye size={15} />

                    </button>

                  </td>

                </tr>

              ))}


              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan="9"
                    className="py-14 text-center"
                  >

                    <FileText
                      size={32}
                      className="mx-auto text-slate-600"
                    />

                    <p className="text-sm text-slate-400 mt-3">
                      No security events found
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Run a simulation to generate events
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* EVENT PIPELINE */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <h2 className="font-semibold text-white">
          Security Event Lifecycle
        </h2>

        <p className="text-xs text-slate-500 mt-1 mb-5">
          End-to-end security event audit workflow
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <Pipeline
            number="01"
            title="Network"
            text="Traffic observed"
            icon={<Network size={18} />}
          />

          <Pipeline
            number="02"
            title="Detection"
            text="Threat classified"
            icon={<ShieldAlert size={18} />}
          />

          <Pipeline
            number="03"
            title="Prevention"
            text="Response generated"
            icon={<Ban size={18} />}
          />

          <Pipeline
            number="04"
            title="AI Analysis"
            text="Security analysis"
            icon={<Brain size={18} />}
          />

          <Pipeline
            number="05"
            title="Audit"
            text="Event stored"
            icon={<Database size={18} />}
          />

        </div>

      </div>


      {/* INVESTIGATION */}

      {selectedEvent && (

        <Investigation
          event={selectedEvent}
          close={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>
  );
}

/* =========================================================
   SETING PAGE
========================================================= */
function SystemStatus({ title, status = "online", description }) {
  const isOnline = String(status).toLowerCase() === "online";

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isOnline ? "bg-emerald-400" : "bg-red-400"
            }`}
          />

          <span
            className={`text-xs font-medium ${
              isOnline ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </div>
  );
}
function SettingsPage({ events = [], stats = {} }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoPrevention, setAutoPrevention] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  const totalEvents = events.length;

  const threatEvents = events.filter(
    (event) => String(event.attack_type || "").toLowerCase() !== "normal"
  ).length;

  const blockedEvents = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() === "BLOCKED"
  ).length;

  const allowedEvents = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() === "ALLOWED"
  ).length;

  const Toggle = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-emerald-500" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  const SettingRow = ({
    title,
    description,
    enabled,
    onChange,
  }) => (
    <div className="flex items-center justify-between gap-6 border-b border-slate-800 py-5 last:border-b-0">
      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
      />
    </div>
  );

  const StatusCard = ({ title, value, description }) => (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>

      <p className="mt-4 text-xl font-bold text-emerald-400">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          System Settings
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Configure AI-IDAPS detection, prevention and monitoring behavior.
        </p>
      </div>

      {/* System Status */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          System Status
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            title="Backend API"
            value="ONLINE"
            description="FastAPI service is running"
          />

          <StatusCard
            title="Database"
            value="CONNECTED"
            description="Neon PostgreSQL"
          />

          <StatusCard
            title="AI Engine"
            value="ONLINE"
            description="Groq AI analysis available"
          />
        </div>
      </div>

      {/* Detection */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-white">
            Detection Configuration
          </h2>

          <p className="text-xs text-slate-400">
            Configure how the intrusion detection system operates.
          </p>
        </div>

        <SettingRow
          title="Automatic Refresh"
          description="Automatically refresh security events and dashboard data."
          enabled={autoRefresh}
          onChange={setAutoRefresh}
        />

        <div className="border-b border-slate-800 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                AI Confidence Threshold
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Minimum confidence required to classify an event as a threat.
              </p>
            </div>

            <span className="rounded-lg bg-slate-800 px-3 py-1 text-sm font-semibold text-cyan-400">
              {confidenceThreshold}%
            </span>
          </div>

          <input
            type="range"
            min="50"
            max="100"
            value={confidenceThreshold}
            onChange={(e) =>
              setConfidenceThreshold(Number(e.target.value))
            }
            className="mt-4 w-full"
          />
        </div>

        <SettingRow
          title="AI Security Analysis"
          description="Use Groq AI to generate explanations for detected events."
          enabled={aiAnalysis}
          onChange={setAiAnalysis}
        />
      </div>

      {/* Prevention */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">
          Prevention Configuration
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Configure automated threat response behavior.
        </p>

        <SettingRow
          title="Automatic Prevention"
          description="Automatically simulate blocking of high-confidence threats."
          enabled={autoPrevention}
          onChange={setAutoPrevention}
        />

        <SettingRow
          title="Security Notifications"
          description="Display notifications when important security events occur."
          enabled={notifications}
          onChange={setNotifications}
        />
      </div>

      {/* Current Statistics */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Current Statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-400">
              Total Events
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {totalEvents}
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-400">
              Threats Detected
            </p>

            <p className="mt-2 text-2xl font-bold text-red-400">
              {threatEvents}
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-400">
              Threats Blocked
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {blockedEvents}
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-xs text-slate-400">
              Allowed Events
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {allowedEvents}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Information */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">
          Configuration Information
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">
              AI Provider
            </p>

            <p className="mt-1 text-sm text-slate-200">
              Groq
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Database
            </p>

            <p className="mt-1 text-sm text-slate-200">
              Neon PostgreSQL
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Backend
            </p>

            <p className="mt-1 text-sm text-slate-200">
              FastAPI
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Detection Threshold
            </p>

            <p className="mt-1 text-sm text-slate-200">
              {confidenceThreshold}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



/* =========================================================
   REPORTS
========================================================= */

function Reports({ events = [], stats = {} }) {
  const totalEvents = events.length;

  const threatEvents = events.filter(
    (event) =>
      String(event.attack_type || "").toLowerCase() !== "normal"
  );

  const blockedEvents = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() === "BLOCKED"
  );

  const allowedEvents = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() === "ALLOWED"
  );

  const avgConfidence =
    events.length > 0
      ? Math.round(
          events.reduce(
            (sum, event) => sum + Number(event.confidence || 0),
            0
          ) / events.length
        )
      : 0;

  const blockRate =
    threatEvents.length > 0
      ? Math.round(
          (blockedEvents.length / threatEvents.length) * 100
        )
      : 0;

  const attackCounts = {};

  threatEvents.forEach((event) => {
    const name = String(event.attack_type || "Unknown");

    attackCounts[name] = (attackCounts[name] || 0) + 1;
  });

  const protocolCounts = {};

  events.forEach((event) => {
    const protocol = String(
      event.protocol || "Unknown"
    ).toUpperCase();

    protocolCounts[protocol] =
      (protocolCounts[protocol] || 0) + 1;
  });

  const chartData = events
    .slice()
    .reverse()
    .slice(-20)
    .map((event, index) => ({
      name: index + 1,
      confidence: Number(event.confidence || 0),
    }));

  const generateReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Security Reports
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Security activity, threat detection and prevention
            analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={generateReport}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Generate Report
        </button>
      </div>

      {/* Report information */}
      <div className="glass rounded-2xl p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Report
            </p>

            <p className="mt-1 text-sm text-white">
              AI-IDAPS Security Assessment
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Generated
            </p>

            <p className="mt-1 text-sm text-white">
              {new Date().toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Status
            </p>

            <p className="mt-1 text-sm font-medium text-emerald-400">
              System Operational
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-400">
            Total Events
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {totalEvents}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-400">
            Threats Detected
          </p>

          <p className="mt-2 text-2xl font-bold text-red-400">
            {threatEvents.length}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-400">
            Threats Blocked
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {blockedEvents.length}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-400">
            Allowed
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {allowedEvents.length}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-400">
            Avg Confidence
          </p>

          <p className="mt-2 text-2xl font-bold text-cyan-400">
            {avgConfidence}%
          </p>
        </div>

      </div>

      {/* Detection confidence */}
      <div className="glass rounded-2xl p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Detection Confidence
          </h2>

          <p className="text-xs text-slate-400">
            Confidence level across recent security events.
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.12)"
              />

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
                stroke="#22d3ee"
                fill="rgba(34,211,238,0.15)"
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Threat distribution */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="glass rounded-2xl p-6">

          <h2 className="text-lg font-semibold text-white">
            Threat Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Detected attack categories.
          </p>

          <div className="mt-5 space-y-4">

            {Object.keys(attackCounts).length === 0 ? (
              <p className="text-sm text-slate-500">
                No threats detected.
              </p>
            ) : (
              Object.entries(attackCounts).map(
                ([name, count]) => {

                  const percentage =
                    threatEvents.length > 0
                      ? Math.round(
                          (count / threatEvents.length) * 100
                        )
                      : 0;

                  return (
                    <div key={name}>

                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-slate-300">
                          {name}
                        </span>

                        <span className="text-xs text-slate-500">
                          {count} ({percentage}%)
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

        {/* Protocol */}
        <div className="glass rounded-2xl p-6">

          <h2 className="text-lg font-semibold text-white">
            Network Protocol Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Protocols observed in security events.
          </p>

          <div className="mt-5 space-y-4">

            {Object.keys(protocolCounts).length === 0 ? (
              <p className="text-sm text-slate-500">
                No protocol information available.
              </p>
            ) : (
              Object.entries(protocolCounts).map(
                ([protocol, count]) => {

                  const percentage =
                    totalEvents > 0
                      ? Math.round(
                          (count / totalEvents) * 100
                        )
                      : 0;

                  return (
                    <div key={protocol}>

                      <div className="mb-2 flex justify-between">
                        <span className="text-sm text-slate-300">
                          {protocol}
                        </span>

                        <span className="text-xs text-slate-500">
                          {count} ({percentage}%)
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

      </div>

      {/* Operational summary */}
      <div className="glass rounded-2xl p-6">

        <h2 className="text-lg font-semibold text-white">
          Operational Summary
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500">
              Threat Block Rate
            </p>

            <p className="mt-2 text-xl font-bold text-amber-400">
              {blockRate}%
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500">
              AI Analysis
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-400">
              Active
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500">
              Database
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-400">
              Connected
            </p>
          </div>

        </div>

      </div>

      {/* Recent incidents */}
      <div className="glass overflow-hidden rounded-2xl">

        <div className="border-b border-slate-800 p-6">

          <h2 className="text-lg font-semibold text-white">
            Recent Security Incidents
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest events recorded by AI-IDAPS.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b border-slate-800 bg-slate-900/50">

              <tr>
                <th className="px-6 py-3 text-xs text-slate-500">
                  Time
                </th>

                <th className="px-6 py-3 text-xs text-slate-500">
                  Attack
                </th>

                <th className="px-6 py-3 text-xs text-slate-500">
                  Confidence
                </th>

                <th className="px-6 py-3 text-xs text-slate-500">
                  Status
                </th>

                <th className="px-6 py-3 text-xs text-slate-500">
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No security events available.
                  </td>
                </tr>
              ) : (
                events.slice(0, 10).map((event) => (

                  <tr
                    key={event.id}
                    className="border-b border-slate-800/70"
                  >

                    <td className="px-6 py-4 text-slate-400">
                      {timeOnly(event.timestamp)}
                    </td>

                    <td className="px-6 py-4 text-white">
                      {event.attack_type || "Unknown"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-cyan-400">
                        {Number(event.confidence || 0)}%
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                        {String(
                          event.status || "UNKNOWN"
                        ).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {event.action || "-"}
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   EVENT STAT
========================================================= */

function EventStat({
  title,
  value,
  icon,
  iconClass,
}) {

  return (

    <div className="glass rounded-2xl border border-slate-800/60 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-white mt-2">
            {value}
          </p>

        </div>

        <div
          className={
            "p-3 rounded-xl bg-slate-900 " +
            iconClass
          }
        >
          {icon}
        </div>

      </div>

    </div>

  );
}

/* =========================================================
   PREVENTION
========================================================= */

function Prevention({ events }) {

  const [filter, setFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const blockedEvents = events.filter(
    (event) =>
      eventStatus(event) === "BLOCKED"
  );

  const allowedEvents = events.filter(
    (event) =>
      eventStatus(event) !== "BLOCKED"
  );

  const filtered = useMemo(() => {

    if (filter === "BLOCKED") {
      return blockedEvents;
    }

    if (filter === "ALLOWED") {
      return allowedEvents;
    }

    return events;

  }, [events, filter]);


  const blockRate =
    events.length > 0
      ? (
          blockedEvents.length /
          events.length
        ) * 100
      : 0;


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <div className="flex items-center gap-2">

          <StatusDot />

          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
            Automated Prevention Engine Active
          </span>

        </div>

        <h1 className="text-2xl font-bold text-white mt-2">
          Prevention
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Automated response and threat containment activity
        </p>

      </div>


      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <PreventionStat
          title="Total Events"
          value={events.length}
          icon={<Activity size={20} />}
          iconClass="text-blue-400"
        />

        <PreventionStat
          title="Threats Blocked"
          value={blockedEvents.length}
          icon={<Ban size={20} />}
          iconClass="text-red-400"
        />

        <PreventionStat
          title="Allowed"
          value={allowedEvents.length}
          icon={<CircleCheck size={20} />}
          iconClass="text-emerald-400"
        />

        <PreventionStat
          title="Block Rate"
          value={blockRate.toFixed(1) + "%"}
          icon={<ShieldCheck size={20} />}
          iconClass="text-purple-400"
        />

      </div>


      {/* ENGINE STATUS */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">

              <Ban
                size={22}
                className="text-red-400"
              />

            </div>

            <div>

              <h2 className="font-semibold text-white">
                Automated Prevention Engine
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Automatically responds to detected security threats
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <StatusDot />

            <span className="text-xs text-emerald-400 font-semibold">
              OPERATIONAL
            </span>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Detection
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              ML Threat Classification
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Response
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Automated Blocking
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Audit
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Neon PostgreSQL
            </p>

          </div>

        </div>

      </div>


      {/* ACTION FILTER */}

      <div className="glass rounded-xl border border-slate-800/60 p-4">

        <div className="flex flex-wrap gap-2">

          {[
            "ALL",
            "BLOCKED",
            "ALLOWED",
          ].map((item) => (

            <button
              key={item}
              onClick={() =>
                setFilter(item)
              }
              className={
                "px-4 py-2 rounded-lg text-[11px] font-semibold border " +
                (
                  filter === item
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-slate-950 text-slate-500 border-slate-800 hover:text-white"
                )
              }
            >
              {item}
            </button>

          ))}

        </div>

      </div>


      {/* RESPONSE TABLE */}

      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60">

          <h2 className="font-semibold text-white">
            Prevention Actions
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Automated response actions generated by AI-IDAPS
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>

              <tr className="bg-slate-950/70">

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Time
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Threat
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Source
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Confidence
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Action
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Inspect
                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.map((event) => {

                const blocked =
                  eventStatus(event) === "BLOCKED";

                return (

                  <tr
                    key={event.id}
                    className="border-t border-slate-800/50 hover:bg-slate-900/50 transition"
                  >

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {timeOnly(event.timestamp)}
                    </td>


                    <td className="px-5 py-4">

                      <ThreatBadge
                        event={event}
                      />

                    </td>


                    <td className="px-5 py-4">

                      <p className="font-mono text-xs text-slate-200">
                        {event.source_ip}
                      </p>

                      <p className="text-[10px] text-slate-600 mt-1">
                        Port {event.source_port}
                      </p>

                    </td>


                    <td className="px-5 py-4">

                      <p className="font-mono text-xs text-slate-200">
                        {event.destination_ip}
                      </p>

                      <p className="text-[10px] text-slate-600 mt-1">
                        Port {event.destination_port}
                      </p>

                    </td>


                    <td className="px-5 py-4">

                      <span className="text-xs font-semibold text-slate-300">
                        {confidence(event).toFixed(1)}%
                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold " +
                          (
                            blocked
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          )
                        }
                      >

                        {blocked ? (
                          <Ban size={12} />
                        ) : (
                          <CircleCheck size={12} />
                        )}

                        {event.action || "ALLOW"}

                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <span
                        className={
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold " +
                          (
                            blocked
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          )
                        }
                      >

                        {blocked ? (
                          <CircleAlert size={12} />
                        ) : (
                          <CircleCheck size={12} />
                        )}

                        {eventStatus(event)}

                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <button
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition"
                      >

                        <Eye size={15} />

                      </button>

                    </td>

                  </tr>

                );

              })}


              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="py-14 text-center"
                  >

                    <CircleCheck
                      size={32}
                      className="mx-auto text-emerald-400"
                    />

                    <p className="text-sm text-slate-400 mt-3">
                      No prevention actions found
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Run the simulation to generate security events
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* PREVENTION FLOW */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <h2 className="font-semibold text-white">
          Automated Response Workflow
        </h2>

        <p className="text-xs text-slate-500 mt-1 mb-5">
          How AI-IDAPS responds to detected threats
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <Pipeline
            number="01"
            title="Threat"
            text="Suspicious traffic detected"
            icon={<ShieldAlert size={18} />}
          />

          <Pipeline
            number="02"
            title="Analysis"
            text="ML confidence evaluated"
            icon={<Brain size={18} />}
          />

          <Pipeline
            number="03"
            title="Decision"
            text="Prevention policy applied"
            icon={<Zap size={18} />}
          />

          <Pipeline
            number="04"
            title="Response"
            text="Threat blocked"
            icon={<Ban size={18} />}
          />

          <Pipeline
            number="05"
            title="Audit"
            text="Action stored in database"
            icon={<Database size={18} />}
          />

        </div>

      </div>


      {/* INVESTIGATION MODAL */}

      {selectedEvent && (

        <Investigation
          event={selectedEvent}
          close={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>
  );
}

/* =========================================================
   AI SECURITY ANALYSIS
========================================================= */

function AIAnalysis({ events }) {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const analyzedEvents = events.filter(
    (event) => event.ai_analysis
  );

  const filtered = useMemo(() => {

    const query = search.toLowerCase().trim();

    return analyzedEvents.filter((event) => {

      const attack =
        attackName(event).toLowerCase();

      const source =
        String(event.source_ip || "").toLowerCase();

      const analysis =
        String(event.ai_analysis || "").toLowerCase();

      if (filter === "THREATS" && !threatEvent(event)) {
        return false;
      }

      if (filter === "BLOCKED" && eventStatus(event) !== "BLOCKED") {
        return false;
      }

      if (filter === "ALLOWED" && eventStatus(event) === "BLOCKED") {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        attack.includes(query) ||
        source.includes(query) ||
        analysis.includes(query)
      );

    });

  }, [analyzedEvents, search, filter]);


  const threatAnalyses =
    analyzedEvents.filter(threatEvent).length;

  const blockedAnalyses =
    analyzedEvents.filter(
      (event) =>
        eventStatus(event) === "BLOCKED"
    ).length;

  const averageConfidence =
    analyzedEvents.length > 0
      ? analyzedEvents.reduce(
          (sum, event) =>
            sum + confidence(event),
          0
        ) / analyzedEvents.length
      : 0;


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <div className="flex items-center gap-2">

          <StatusDot />

          <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
            Groq AI Analysis Engine Active
          </span>

        </div>

        <h1 className="text-2xl font-bold text-white mt-2">
          AI Security Analysis
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          AI-assisted analysis of network threats and security events
        </p>

      </div>


      {/* STATS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <AIStat
          title="AI Analyses"
          value={analyzedEvents.length}
          icon={<Brain size={20} />}
          iconClass="text-purple-400"
        />

        <AIStat
          title="Threat Analyses"
          value={threatAnalyses}
          icon={<ShieldAlert size={20} />}
          iconClass="text-red-400"
        />

        <AIStat
          title="Blocked Threats"
          value={blockedAnalyses}
          icon={<Ban size={20} />}
          iconClass="text-orange-400"
        />

        <AIStat
          title="Avg Confidence"
          value={averageConfidence.toFixed(1) + "%"}
          icon={<Activity size={20} />}
          iconClass="text-blue-400"
        />

      </div>


      {/* AI ENGINE */}

      <div className="glass rounded-2xl border border-purple-500/10 p-5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">

              <Brain
                size={23}
                className="text-purple-400"
              />

            </div>

            <div>

              <h2 className="font-semibold text-white">
                Groq AI Security Analyst
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                AI-generated cybersecurity analysis for detected events
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <StatusDot />

            <span className="text-xs text-emerald-400 font-semibold">
              OPERATIONAL
            </span>

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">

          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              AI Provider
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Groq
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Model
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              GPT-OSS-120B
            </p>

          </div>


          <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4">

            <p className="text-[10px] uppercase tracking-wider text-slate-600">
              Purpose
            </p>

            <p className="text-sm font-semibold text-white mt-2">
              Threat Intelligence
            </p>

          </div>

        </div>

      </div>


      {/* SEARCH / FILTER */}

      <div className="glass rounded-xl border border-slate-800/60 p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search attack, source IP or AI analysis..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-purple-500/50 text-slate-200"
            />

          </div>


          <div className="flex gap-2 flex-wrap">

            {[
              "ALL",
              "THREATS",
              "BLOCKED",
              "ALLOWED",
            ].map((item) => (

              <button
                key={item}
                onClick={() =>
                  setFilter(item)
                }
                className={
                  "px-3 py-2 rounded-lg text-[11px] font-semibold border " +
                  (
                    filter === item
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-slate-950 text-slate-500 border-slate-800 hover:text-white"
                  )
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </div>


      {/* AI ANALYSIS LIST */}

      <div className="space-y-4">

        {filtered.map((event) => (

          <div
            key={event.id}
            className="glass rounded-2xl border border-slate-800/60 overflow-hidden"
          >

            {/* EVENT HEADER */}

            <div className="px-5 py-4 border-b border-slate-800/60">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">

                    <Brain
                      size={18}
                      className="text-purple-400"
                    />

                  </div>

                  <div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <ThreatBadge
                        event={event}
                      />

                      <span className="text-xs text-slate-600">
                        Event #{event.id}
                      </span>

                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {fullTime(event.timestamp)}
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-3">

                  <div className="text-right">

                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      ML Confidence
                    </p>

                    <p className="text-sm font-bold text-white mt-1">
                      {confidence(event).toFixed(1)}%
                    </p>

                  </div>

                  <ActionBadge
                    event={event}
                  />

                </div>

              </div>

            </div>


            {/* NETWORK INFORMATION */}

            <div className="p-5">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">

                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Source
                  </p>

                  <p className="font-mono text-sm text-slate-200 mt-2">
                    {event.source_ip}
                  </p>

                  <p className="text-[10px] text-slate-600 mt-1">
                    Port {event.source_port}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Destination
                  </p>

                  <p className="font-mono text-sm text-slate-200 mt-2">
                    {event.destination_ip}
                  </p>

                  <p className="text-[10px] text-slate-600 mt-1">
                    Port {event.destination_port}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3">

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Protocol
                  </p>

                  <p className="text-sm font-semibold text-white mt-2">
                    {event.protocol || "-"}
                  </p>

                </div>

              </div>


              {/* AI ANALYSIS */}

              <div className="rounded-xl bg-purple-500/[0.035] border border-purple-500/15 p-5">

                <div className="flex items-center justify-between gap-3 mb-3">

                  <div className="flex items-center gap-2">

                    <Brain
                      size={17}
                      className="text-purple-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Groq AI Analysis
                    </h3>

                  </div>

                  <span className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold">
                    AI Generated
                  </span>

                </div>


                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">

                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-7">
                    {event.ai_analysis}
                  </p>

                </div>

              </div>


              {/* INVESTIGATE */}

              <div className="flex justify-end mt-4">

                <button
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition"
                >

                  <Eye size={14} />

                  Open Investigation

                </button>

              </div>

            </div>

          </div>

        ))}


        {filtered.length === 0 && (

          <div className="glass rounded-2xl border border-slate-800/60 p-14 text-center">

            <Brain
              size={36}
              className="mx-auto text-slate-600"
            />

            <p className="text-sm text-slate-400 mt-4">
              No AI analyses found
            </p>

            <p className="text-xs text-slate-600 mt-1">
              Run the simulation to generate Groq AI security analysis
            </p>

          </div>

        )}

      </div>


      {/* AI PROCESSING PIPELINE */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <h2 className="font-semibold text-white">
          AI Security Analysis Pipeline
        </h2>

        <p className="text-xs text-slate-500 mt-1 mb-5">
          Intelligent analysis workflow
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <Pipeline
            number="01"
            title="Network Event"
            text="Security event received"
            icon={<Network size={18} />}
          />

          <Pipeline
            number="02"
            title="ML Detection"
            text="Attack classification"
            icon={<Cpu size={18} />}
          />

          <Pipeline
            number="03"
            title="Context"
            text="Event details prepared"
            icon={<FileText size={18} />}
          />

          <Pipeline
            number="04"
            title="Groq AI"
            text="Security analysis"
            icon={<Brain size={18} />}
          />

          <Pipeline
            number="05"
            title="SOC Output"
            text="Analyst summary"
            icon={<ShieldCheck size={18} />}
          />

        </div>

      </div>


      {/* INVESTIGATION */}

      {selectedEvent && (

        <Investigation
          event={selectedEvent}
          close={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>
  );
}


/* =========================================================
   AI STAT
========================================================= */

function AIStat({
  title,
  value,
  icon,
  iconClass,
}) {

  return (

    <div className="glass rounded-2xl border border-slate-800/60 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-white mt-2">
            {value}
          </p>

        </div>

        <div
          className={
            "p-3 rounded-xl bg-slate-900 " +
            iconClass
          }
        >
          {icon}
        </div>

      </div>

    </div>

  );
}

/* =========================================================
   NETWORK TRAFFIC
========================================================= */

function NetworkTraffic({ events }) {

  const [search, setSearch] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);


  /* =======================================================
     TRAFFIC CALCULATIONS
  ======================================================= */

  const totalBytes = events.reduce(
    (sum, event) =>
      sum + Number(event.bytes_transferred || 0),
    0
  );

  const totalPackets = events.reduce(
    (sum, event) =>
      sum + Number(event.packets || 0),
    0
  );

  const totalDuration = events.reduce(
    (sum, event) =>
      sum + Number(event.duration || 0),
    0
  );


  const trafficMB =
    totalBytes / (1024 * 1024);


  const protocols = useMemo(() => {

    const counts = {};

    events.forEach((event) => {

      const protocol =
        String(
          event.protocol || "UNKNOWN"
        ).toUpperCase();

      counts[protocol] =
        (counts[protocol] || 0) + 1;

    });

    return counts;

  }, [events]);


  const protocolNames = Object.keys(protocols);


  /* =======================================================
     FILTERED EVENTS
  ======================================================= */

  const filtered = useMemo(() => {

    const query =
      search.toLowerCase().trim();

    return events.filter((event) => {

      const protocol =
        String(
          event.protocol || ""
        ).toUpperCase();

      const source =
        String(
          event.source_ip || ""
        ).toLowerCase();

      const destination =
        String(
          event.destination_ip || ""
        ).toLowerCase();

      if (
        protocolFilter !== "ALL" &&
        protocol !== protocolFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        source.includes(query) ||
        destination.includes(query) ||
        protocol.toLowerCase().includes(query)
      );

    });

  }, [
    events,
    search,
    protocolFilter,
  ]);


  /* =======================================================
     CHART DATA
  ======================================================= */

  const trafficChart =
    events
      .slice()
      .reverse()
      .map((event, index) => ({
        name: String(index + 1),
        packets: Number(
          event.packets || 0
        ),
        bytes:
          Number(
            event.bytes_transferred || 0
          ) / 1024,
      }));


  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <div className="flex items-center gap-2">

          <StatusDot />

          <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
            Network Traffic Monitoring Active
          </span>

        </div>

        <h1 className="text-2xl font-bold text-white mt-2">
          Network Traffic
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Analyze network flows, protocols, packets and traffic volume
        </p>

      </div>


      {/* TRAFFIC KPIs */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <TrafficStat
          title="Traffic Processed"
          value={
            trafficMB.toFixed(2) +
            " MB"
          }
          icon={<Network size={20} />}
          iconClass="text-blue-400"
        />

        <TrafficStat
          title="Packets"
          value={totalPackets.toLocaleString()}
          icon={<Activity size={20} />}
          iconClass="text-purple-400"
        />

        <TrafficStat
          title="Network Flows"
          value={events.length}
          icon={<Globe size={20} />}
          iconClass="text-cyan-400"
        />

        <TrafficStat
          title="Duration"
          value={
            totalDuration.toFixed(1) +
            " sec"
          }
          icon={<Clock size={20} />}
          iconClass="text-emerald-400"
        />

      </div>


      {/* TRAFFIC ANALYTICS */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* CHART */}

        <div className="xl:col-span-2 glass rounded-2xl border border-slate-800/60 p-5">

          <div className="flex items-start justify-between mb-5">

            <div>

              <h2 className="font-semibold text-white">
                Network Activity
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Packets and traffic volume across recent flows
              </p>

            </div>

            <Activity
              size={19}
              className="text-blue-400"
            />

          </div>


          <div className="h-72">

            {trafficChart.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={trafficChart}
                >

                  <defs>

                    <linearGradient
                      id="networkTraffic"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="100%"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.08}
                  />


                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                  />


                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                  />


                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />


                  <Area
                    type="monotone"
                    dataKey="packets"
                    stroke="#60a5fa"
                    fill="url(#networkTraffic)"
                    strokeWidth={2}
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex items-center justify-center text-slate-600">
                No network traffic data available
              </div>

            )}

          </div>

        </div>


        {/* PROTOCOL BREAKDOWN */}

        <div className="glass rounded-2xl border border-slate-800/60 p-5">

          <h2 className="font-semibold text-white">
            Protocol Distribution
          </h2>

          <p className="text-xs text-slate-500 mt-1 mb-5">
            Network protocols observed
          </p>


          <div className="space-y-3">

            {protocolNames.map((protocol) => {

              const count =
                protocols[protocol];

              const percentage =
                events.length > 0
                  ? (
                      count /
                      events.length
                    ) * 100
                  : 0;

              return (

                <div
                  key={protocol}
                  className="rounded-xl bg-slate-950/60 border border-slate-800 p-3"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-semibold text-white">
                      {protocol}
                    </span>

                    <span className="text-xs text-slate-400">
                      {count} flows
                    </span>

                  </div>


                  <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width:
                          percentage +
                          "%",
                      }}
                    />

                  </div>


                  <p className="text-[10px] text-slate-600 mt-2">
                    {percentage.toFixed(1)}% of observed traffic
                  </p>

                </div>

              );

            })}


            {protocolNames.length === 0 && (

              <div className="py-10 text-center">

                <Network
                  size={30}
                  className="mx-auto text-slate-600"
                />

                <p className="text-sm text-slate-500 mt-3">
                  No protocol data
                </p>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* SEARCH */}

      <div className="glass rounded-xl border border-slate-800/60 p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search source IP, destination IP or protocol..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 text-slate-200"
            />

          </div>


          <div className="flex gap-2 flex-wrap">

            <button
              onClick={() =>
                setProtocolFilter("ALL")
              }
              className={
                "px-3 py-2 rounded-lg text-[11px] font-semibold border " +
                (
                  protocolFilter === "ALL"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-slate-950 text-slate-500 border-slate-800"
                )
              }
            >
              ALL
            </button>


            {protocolNames.map(
              (protocol) => (

                <button
                  key={protocol}
                  onClick={() =>
                    setProtocolFilter(
                      protocol
                    )
                  }
                  className={
                    "px-3 py-2 rounded-lg text-[11px] font-semibold border " +
                    (
                      protocolFilter === protocol
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-slate-950 text-slate-500 border-slate-800"
                    )
                  }
                >
                  {protocol}
                </button>

              )
            )}

          </div>

        </div>

      </div>


      {/* FLOW TABLE */}

      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60">

          <h2 className="font-semibold text-white">
            Network Flow Analysis
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {filtered.length} network flows displayed
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead>

              <tr className="bg-slate-950/70">

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Time
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Source
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Destination
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Protocol
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Packets
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Bytes
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Duration
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Detection
                </th>

                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  Inspect
                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.map((event) => (

                <tr
                  key={event.id}
                  className="border-t border-slate-800/50 hover:bg-slate-900/50 transition"
                >

                  <td className="px-5 py-4 text-xs text-slate-400">
                    {timeOnly(event.timestamp)}
                  </td>


                  <td className="px-5 py-4">

                    <p className="font-mono text-xs text-slate-200">
                      {event.source_ip}
                    </p>

                    <p className="text-[10px] text-slate-600 mt-1">
                      Port {event.source_port}
                    </p>

                  </td>


                  <td className="px-5 py-4">

                    <p className="font-mono text-xs text-slate-200">
                      {event.destination_ip}
                    </p>

                    <p className="text-[10px] text-slate-600 mt-1">
                      Port {event.destination_port}
                    </p>

                  </td>


                  <td className="px-5 py-4">

                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                      {event.protocol || "-"}
                    </span>

                  </td>


                  <td className="px-5 py-4">

                    <span className="text-xs text-slate-300">
                      {Number(
                        event.packets || 0
                      ).toLocaleString()}
                    </span>

                  </td>


                  <td className="px-5 py-4">

                    <span className="text-xs text-slate-300">
                      {Number(
                        event.bytes_transferred || 0
                      ).toLocaleString()}
                    </span>

                  </td>


                  <td className="px-5 py-4">

                    <span className="text-xs text-slate-400">
                      {Number(
                        event.duration || 0
                      ).toFixed(2)}
                      s
                    </span>

                  </td>


                  <td className="px-5 py-4">

                    <ThreatBadge
                      event={event}
                    />

                  </td>


                  <td className="px-5 py-4">

                    <button
                      onClick={() =>
                        setSelectedEvent(
                          event
                        )
                      }
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-blue-400 transition"
                    >

                      <Eye size={15} />

                    </button>

                  </td>

                </tr>

              ))}


              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan="9"
                    className="py-14 text-center"
                  >

                    <Network
                      size={32}
                      className="mx-auto text-slate-600"
                    />

                    <p className="text-sm text-slate-400 mt-3">
                      No network flows found
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* TRAFFIC PIPELINE */}

      <div className="glass rounded-2xl border border-slate-800/60 p-5">

        <h2 className="font-semibold text-white">
          Network Traffic Processing
        </h2>

        <p className="text-xs text-slate-500 mt-1 mb-5">
          Network flow processing inside AI-IDAPS
        </p>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <Pipeline
            number="01"
            title="Traffic"
            text="Network packets received"
            icon={<Network size={18} />}
          />

          <Pipeline
            number="02"
            title="Flow"
            text="Flow metadata extracted"
            icon={<Activity size={18} />}
          />

          <Pipeline
            number="03"
            title="Features"
            text="Traffic features calculated"
            icon={<BarChart3 size={18} />}
          />

          <Pipeline
            number="04"
            title="Detection"
            text="Security classification"
            icon={<ShieldAlert size={18} />}
          />

          <Pipeline
            number="05"
            title="Storage"
            text="Event stored in database"
            icon={<Database size={18} />}
          />

        </div>

      </div>


      {/* INVESTIGATION */}

      {selectedEvent && (

        <Investigation
          event={selectedEvent}
          close={() =>
            setSelectedEvent(null)
          }
        />

      )}

    </div>
  );
}


/* =========================================================
   TRAFFIC STAT
========================================================= */

function TrafficStat({
  title,
  value,
  icon,
  iconClass,
}) {

  return (

    <div className="glass rounded-2xl border border-slate-800/60 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="text-2xl lg:text-3xl font-bold text-white mt-2">
            {value}
          </p>

        </div>

        <div
          className={
            "p-3 rounded-xl bg-slate-900 " +
            iconClass
          }
        >
          {icon}
        </div>

      </div>

    </div>

  );
}

/* =========================================================
   PREVENTION STAT
========================================================= */

function PreventionStat({
  title,
  value,
  icon,
  iconClass,
}) {

  return (

    <div className="glass rounded-2xl border border-slate-800/60 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="text-3xl font-bold text-white mt-2">
            {value}
          </p>

        </div>

        <div
          className={
            "p-3 rounded-xl bg-slate-900 " +
            iconClass
          }
        >
          {icon}
        </div>

      </div>

    </div>

  );
}

/* =========================================================
   APP
========================================================= */

function App() {

  const [active, setActive] =
    useState("overview");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [stats, setStats] =
    useState({
      events: 0,
      attacks: 0,
      blocked: 0,
      traffic_bytes: 0,
    });

  const [events, setEvents] =
    useState([]);


  /* =======================================================
     LOAD API DATA
  ======================================================= */

  const loadData = async () => {

    try {

      const statsResponse =
        await fetch(
          API + "/api/stats"
        );

      const eventsResponse =
        await fetch(
          API + "/api/events?limit=50"
        );

      if (
        !statsResponse.ok ||
        !eventsResponse.ok
      ) {
        throw new Error(
          "Backend request failed"
        );
      }

      const statsData =
        await statsResponse.json();

      const eventsData =
        await eventsResponse.json();

      setStats(statsData);

      setEvents(eventsData);

      setMessage("");

    } catch (error) {

      console.error(error);

      setMessage(
        "Backend connection unavailable. Make sure FastAPI is running on port 8000."
      );

    }

  };


  /* =======================================================
     POLLING
  ======================================================= */

  useEffect(() => {

    loadData();

    const timer =
      setInterval(
        loadData,
        4000
      );

    return () =>
      clearInterval(timer);

  }, []);


  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = async () => {

    setLoading(true);

    await loadData();

    setLoading(false);

  };


  /* =======================================================
     SIMULATE
  ======================================================= */

  const simulate = async () => {

    setLoading(true);

    try {

      const response =
        await fetch(
          API + "/api/simulate",
          {
            method: "POST",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Simulation failed"
        );
      }

      const result =
        await response.json();

      setMessage(
        "Simulation completed successfully. " +
        result.count +
        " network events processed."
      );

      await loadData();

    } catch (error) {

      console.error(error);

      setMessage(
        "Simulation failed. Check FastAPI."
      );

    }

    setLoading(false);

  };


  /* =======================================================
     PAGE TITLE
  ======================================================= */

  let title = "Security Overview";

  if (active === "monitoring") {
    title = "Live Monitoring";
  }

  if (active === "threats") {
    title = "Threat Detection";
  }

  if (active === "prevention") {
    title = "Prevention";
  }

  if (active === "ai") {
    title = "AI Security Analysis";
  }

  if (active === "network") {
    title = "Network Traffic";
  }

  if (active === "events") {
    title = "Security Events";
  }

  if (active === "reports") {
    title = "Security Reports";
  }

  if (active === "settings") {
    title = "System Settings";
  }


  /* =======================================================
     CONTENT
  ======================================================= */

  let content = null;

if (active === "overview") {
  content = (
    <Overview
      stats={stats}
      events={events}
      refresh={refresh}
    />
  );
} else if (active === "monitoring") {
  content = (
    <LiveMonitoring
      events={events}
    />
  );
} else if (active === "threats") {
  content = (
    <ThreatDetection
      events={events}
    />
  );
} else if (active === "prevention") {
  content = (
    <Prevention
      events={events}
    />
  );
} else if (active === "ai") {
  content = (
    <AIAnalysis
      events={events}
    />
  );
} else if (active === "network") {
  content = (
    <NetworkTraffic
      events={events}
    />
  );
} else if (active === "events") {
  content = (
    <SecurityEvents
      events={events}
    />
  );
} else if (active === "reports") {
  content = (
    <Reports
      events={events}
      stats={stats}
    />
  );
} else if (active === "settings") {
  content = (
    <SettingsPage
      events={events}
      stats={stats}
    />
  );
} else {
  content = (
    <PlaceholderPage
      title="Page"
      subtitle="Coming soon."
    />
  );

}



  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">

      <Sidebar
        active={active}
        setActive={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />


      <div className="lg:ml-64 min-h-screen">

        <Header
          title={title}
          setMobileOpen={setMobileOpen}
          refresh={refresh}
          loading={loading}
          simulate={simulate}
        />


        <main className="p-5 lg:p-8 max-w-[1700px] mx-auto">

          {message && (

            <div className="mb-5 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm flex items-center gap-2">

              <CircleAlert size={16} />

              {message}

            </div>

          )}

          {content}

        </main>


        <footer className="px-5 lg:px-8 py-5 border-t border-slate-900 text-center">

          <p className="text-[10px] text-slate-600">

            AI-IDAPS Professional
            {" • "}
            AI-Based Intelligent Intrusion Detection &
            Automated Prevention System

          </p>

        </footer>

      </div>

    </div>
  );
}


/* =========================================================
   ROOT
========================================================= */

const rootElement =
  document.getElementById("root");

createRoot(rootElement).render(
  <App />
);