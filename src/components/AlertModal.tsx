import type { WeatherAlertFeature } from "../types/alerts";
import dayjs from "dayjs";
import './Modal.css';
import { useEffect, useRef } from "react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: WeatherAlertFeature;
  additionalAlerts?: WeatherAlertFeature[];
}

export default function AlertModal({ isOpen, onClose, alert, additionalAlerts = [] }: AlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const p = alert.properties;

  useEffect(() => {
    if (!isOpen) return;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div ref={modalRef} className="window alert-modal-window" style={{ width: "500px", maxWidth: "90vw" }}>
        <div className="title-bar">
          <div className="title-bar-text">
            ⚠ {p.event} - {dayjs(p.effective).format("MMM D, YYYY h:mm A")}
          </div>
          <div className="title-bar-controls">
            <button
              aria-label="Close"
              onClick={onClose}
            />
          </div>
        </div>
        <div className="window-body alert-modal-body" style={{ padding: "16px", textAlign: "left" }}>
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>{p.headline}</h4>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
              Effective: {dayjs(p.effective).format("MMM D, YYYY h:mm A")} – {dayjs(p.expires).format("MMM D, YYYY h:mm A")}
            </p>
            {p.areaDesc && (
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                Area: {p.areaDesc}
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Description</h4>
            <p style={{ margin: 0, fontSize: "16px", whiteSpace: "pre-wrap" }}>{p.description}</p>
          </div>

          {p.instruction && (
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Instructions</h4>
              <p style={{ margin: 0, fontSize: "16px", whiteSpace: "pre-wrap" }}>{p.instruction}</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>Severity</h4>
              <p style={{ margin: 0, fontSize: "16px" }}>{p.severity}</p>
            </div>
            <div>
              <h4 style={{ margin: "0 0 8px 0" }}>Urgency</h4>
              <p style={{ margin: 0, fontSize: "16px" }}>{p.urgency}</p>
            </div>
          </div>

          {additionalAlerts.length > 0 && (
            <div style={{ marginTop: "32px", borderTop: "2px solid #c0c0c0", paddingTop: "16px" }}>
              <h4 style={{ margin: "0 0 16px 0", fontWeight: "bold" }}>Additional Alerts</h4>
              {additionalAlerts.map((additionalAlert, index) => {
                const ap = additionalAlert.properties;
                return (
                  <div key={additionalAlert.id} style={{ marginBottom: index < additionalAlerts.length - 1 ? "24px" : "0" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>⚠ {ap.event}</h4>
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                        Effective: {dayjs(ap.effective).format("MMM D, YYYY h:mm A")} – {dayjs(ap.expires).format("MMM D, YYYY h:mm A")}
                      </p>
                      {ap.areaDesc && (
                        <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                          Area: {ap.areaDesc}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <h4 style={{ margin: "0 0 8px 0" }}>Description</h4>
                      <p style={{ margin: 0, fontSize: "16px", whiteSpace: "pre-wrap" }}>{ap.description}</p>
                    </div>

                    {ap.instruction && (
                      <div style={{ marginBottom: "12px" }}>
                        <h4 style={{ margin: "0 0 8px 0" }}>Instructions</h4>
                        <p style={{ margin: 0, fontSize: "16px", whiteSpace: "pre-wrap" }}>{ap.instruction}</p>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 8px 0" }}>Severity</h4>
                        <p style={{ margin: 0, fontSize: "16px" }}>{ap.severity}</p>
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 8px 0" }}>Urgency</h4>
                        <p style={{ margin: 0, fontSize: "16px" }}>{ap.urgency}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
