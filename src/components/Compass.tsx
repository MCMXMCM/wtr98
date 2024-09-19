import React from "react";

interface CompassProps {
  cardinalDirection: string;
}

const Compass: React.FC<CompassProps> = ({ cardinalDirection }) => {
  const getAngle = (direction: string): number => {
    switch (direction) {
      case "N":
        return 0;
      case "NNE":
        return 22.5;
      case "NE":
        return 45;
      case "ENE":
        return 67.5;
      case "E":
        return 90;
      case "ESE":
        return 112.5;
      case "SE":
        return 135;
      case "SSE":
        return 157.5;
      case "S":
        return 180;
      case "SSW":
        return 202.5;
      case "SW":
        return 225;
      case "WSW":
        return 247.5;
      case "W":
        return 270;
      case "WNW":
        return 292.5;
      case "NW":
        return 315;
      case "NNW":
        return 337.5;
      default:
        return 0;
    }
  };

  const angle = getAngle(cardinalDirection);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ fontSize: "17px" }}>{cardinalDirection}</div>

      <div
        style={{
          width: "150px",
          height: "150px",
          border: "1px solid black",
          borderRadius: "50%",
          position: "relative",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
        >
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke="black"
            strokeWidth="2"
          />
          <polygon
            points="50,0 40,20 60,20"
            fill="black"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default Compass;
