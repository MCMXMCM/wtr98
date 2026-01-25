import { useState } from "react";
import { useWeather } from "../hooks/use-points";
import type { WeatherAlertFeature, WeatherAlertProperties } from "../types/alerts";
import dayjs from "dayjs";

function severityStyle(severity: WeatherAlertProperties["severity"]) {
  switch (severity) {
    case "Extreme":
      return { borderLeft: "4px solid #c00", background: "rgba(204,0,0,0.08)" };
    case "Severe":
      return { borderLeft: "4px solid #c00", background: "rgba(204,0,0,0.06)" };
    case "Moderate":
      return { borderLeft: "4px solid #f80", background: "rgba(255,136,0,0.06)" };
    case "Minor":
      return { borderLeft: "4px solid #888", background: "rgba(0,0,0,0.03)" };
    default:
      return { borderLeft: "4px solid #808080", background: "rgba(0,0,0,0.02)" };
  }
}

function AlertRow({ feature }: { feature: WeatherAlertFeature }) {
  const [expanded, setExpanded] = useState(false);
  const p = feature.properties;
  const style = severityStyle(p.severity);

  return (
    <div
      className="alert-row"
      style={{
        marginBottom: "8px",
        padding: "8px 10px",
        borderRadius: "2px",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          border: "none",
          background: "transparent",
          padding: 0,
          font: "inherit",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "2px" }}>{p.event}</div>
        <div style={{ fontSize: "13px", color: "#333" }}>{p.headline}</div>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          {dayjs(p.effective).format("MMM D, h:mm a")} –{" "}
          {dayjs(p.expires).format("MMM D, h:mm a")}
          {expanded ? " ▲" : " ▼"}
        </div>
      </button>
      {expanded && p.description && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(0,0,0,0.1)",
            fontSize: "13px",
            whiteSpace: "pre-wrap",
          }}
        >
          {p.description}
          {p.instruction && (
            <div style={{ marginTop: "8px", fontWeight: "bold" }}>
              Instructions: {p.instruction}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Alerts() {
  const { alerts, status } = useWeather();

  const actual = (alerts?.features ?? []).filter(
    (f) => f.properties.status === "Actual"
  );

  if (status !== "success" || actual.length === 0) {
    return null;
  }

  return (
    <div className="window alerts-window" style={{ marginBottom: "8px" }}>
      <div className="title-bar">
        <div className="title-bar-text">⚠ Weather alerts</div>
      </div>
      <div className="window-body" style={{ padding: "10px" }}>
        {actual.map((f) => (
          <AlertRow key={f.id} feature={f} />
        ))}
      </div>
    </div>
  );
}
