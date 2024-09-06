import { useEffect, useState } from "react";
import { ProgressBar } from "react95";
import original from "react95/dist/themes/original";
import { ThemeProvider } from "styled-components";

export function Tile() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((previousPercent) => {
        if (previousPercent === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(previousPercent + diff, 100);
      });
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <ThemeProvider theme={original}>
      <ProgressBar variant="tile" value={Math.floor(percent)} />
    </ThemeProvider>
  );
}
