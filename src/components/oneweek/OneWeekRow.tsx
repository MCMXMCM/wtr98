import { getIcon } from "../../helpers/global";
import { WeatherPeriod } from "../../types/forecast";
import { useState } from "react";
import Modal from "../Modal";

interface OneWeekRowProps {
  period: WeatherPeriod;
  minTemp: number;
  maxTemp: number;
  previousTemp?: number;
}

export default function OneWeekRow({ period, minTemp, maxTemp, previousTemp }: OneWeekRowProps) {
  const icon = getIcon(period.isDaytime, period.shortForecast);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate temperature position on the bar relative to min/max temps
  // This ensures temps are distributed across the bar even when all temps are cold
  const calculateTempPosition = (temp: number, min: number, max: number): number => {
    // Handle edge case where all temps are the same
    if (max === min) {
      return 0; // Position at leftmost if no variation
    }

    // Calculate relative position: 0% for min temp, 100% for max temp
    // Use 95% as max position to leave some room on the right
    const relativePosition = ((temp - min) / (max - min)) * 95;
    
    // Ensure position stays within 0-95% bounds
    return Math.max(0, Math.min(95, relativePosition));
  };

  const tempPosition = calculateTempPosition(period.temperature, minTemp, maxTemp);
  const previousTempPosition = previousTemp !== undefined 
    ? calculateTempPosition(previousTemp, minTemp, maxTemp) 
    : null;

  // Calculate the range for the highlighted segment
  const getRangeStyle = () => {
    if (previousTempPosition === null) return null;
    
    const leftPosition = Math.min(previousTempPosition, tempPosition);
    const rightPosition = Math.max(previousTempPosition, tempPosition);
    const width = rightPosition - leftPosition;
    
    return {
      position: "absolute" as const,
      left: `${leftPosition}%`,
      width: `${width}%`,
      top: "3.3px",
      height: "7px",
      border: "1px solid #010081",
      borderStyle: "dashed" as const,
      backgroundColor: "rgba(150, 150, 150, 0.3)",
      zIndex: 1,
      // boxShadow: "inset 0 0 2px rgba(0, 0, 0, 0.5)",
    };
  };

  return (
    <>
      <div
        className="field-row"
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "100%",
          cursor: "pointer",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <div style={{ width: "20%", textAlign: "center" }}>
          <p style={{ fontWeight: "bold" }}>{period.name}</p>
        </div>
        <img style={{ height: "33px", maxWidth: "50px" }} src={`${icon}.gif`} />
        <div style={{ width: "53%", position: "relative" }}>
          <hr
            style={{
              height: "3px",
              opacity: 0.5,
              background: `linear-gradient(to right, 
                #0000FF 0%, 
                #0000FF 15%, 
                #0080FF 15%, 
                #0080FF 30%, 
                #00FFFF 30%, 
                #00FFFF 45%, 
                #00FF80 45%, 
                #00FF80 60%, 
                #00FF00 60%, 
                #00FF00 70%, 
                #80FF00 70%, 
                #80FF00 80%, 
                #FFFF00 80%, 
                #FFFF00 90%, 
                #FF8000 90%, 
                #FF8000 100%, 
                #FF4000 100%, 
                #FF0000 100%)`,
            }}
          />
          {previousTempPosition !== null && getRangeStyle() && (
            <div style={getRangeStyle()!} />
          )}
          <div style={{ marginLeft: `${tempPosition}%` }}>
            <div className="example">
              <p style={{ fontWeight: "bold" }}>{period.temperature}°</p>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        forecast={period}
      />
    </>
  );
}
