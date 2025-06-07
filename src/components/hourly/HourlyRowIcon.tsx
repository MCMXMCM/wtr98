import dayjs from "dayjs";
import { getIcon } from "../../helpers/global";
import { WeatherForecast } from "../../types/global";
import { useState } from "react";
import Modal from "../Modal";

export default function HourlyRowIcon({ period }: { period: WeatherForecast }) {
  const icon = getIcon(period.isDaytime, period.shortForecast);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="field-column"
        style={{
          height: "90px",
          width: "90px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <p style={{ fontSize: "12px", fontWeight: "bold", margin: 0 }}>
          {dayjs(period.startTime).format("dddd")}
        </p>
        <p style={{ fontSize: "12px", fontWeight: "bold", margin: 0 }}>
          {dayjs(period.startTime).format("h a")}
        </p>
        <div style={{ minHeight: "48%" }}>
          <img
            style={{ height: "100%", maxWidth: "65px" }}
            src={`/${icon}.gif`}
          />
        </div>
        <p style={{ fontSize: "12px", fontWeight: "bold", margin: 0 }}>
          {period.temperature}°
        </p>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        forecast={period}
      />
    </>
  );
}
