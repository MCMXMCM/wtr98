import React from "react";
import Marquee from "react-fast-marquee";
import { useWeather } from "../hooks/use-points";

interface MarqueeProps {
  speed?: number;
  pauseOnHover?: boolean;
}

const InfiniteMarquee: React.FC<MarqueeProps> = ({
  speed = 20,
  pauseOnHover = true,
}) => {
  const { weekly } = useWeather();

  return (
    <div
      className="title-bar"
      style={{
        height: "30px",
        width: "100%",
      }}
    >
      <Marquee
        speed={speed}
        gradient={false}
        pauseOnHover={pauseOnHover}
        direction="left"
        loop={0}
      >
        <div className="title-bar-text" style={{ fontSize: "16px" }}>
          {weekly?.properties?.periods[0]?.detailedForecast}
        </div>
      </Marquee>
    </div>
  );
};

export default InfiniteMarquee;
