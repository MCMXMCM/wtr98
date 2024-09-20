import React from "react";
import Marquee from "react-fast-marquee";

interface MarqueeProps {
  text: string;
  speed?: number;
  pauseOnHover?: boolean;
}

const InfiniteMarquee: React.FC<MarqueeProps> = ({
  text,
  speed = 20,
  pauseOnHover = true,
}) => {
  return (
    <div className="window">
      <div className="title-bar" style={{ height: "30px" }}>
        <Marquee
          speed={speed}
          gradient={false}
          pauseOnHover={pauseOnHover}
          direction="left"
          loop={0}
        >
          <div className="title-bar-text" style={{ fontSize: "16px" }}>
            {text}
          </div>
        </Marquee>
      </div>
    </div>
  );
};

export default InfiniteMarquee;
