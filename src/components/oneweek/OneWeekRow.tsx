import { getIcon } from "../../helpers/global";
import { WeatherPeriod } from "../../types/forecast";
import { useState } from "react";
import Modal from "../Modal";

export default function OneWeekRow({ period }: { period: WeatherPeriod }) {
  const icon = getIcon(period.isDaytime, period.shortForecast);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div style={{ width: "53%" }}>
          <hr
            style={{
              height: "3px",
              opacity: 0.5,
              background:
                "linear-gradient(to right, blue 60%, green 60%, green 80%, yellow 80%, yellow 90%, red 90%, red 100%)",
            }}
          />
          <div style={{ marginLeft: `${period.temperature >= 100 ? 90 : period.temperature < 0 ? 10 : period.temperature - 10}%` }}>
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
