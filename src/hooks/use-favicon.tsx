import { useEffect } from "react";
import { getIcon } from "../helpers/global";
import { Hourly } from "../types/hourly";
import { Points } from "../types/global";

/**
 * Hook to update the browser favicon based on the current weather icon
 * Also updates the page title with the city name
 */
export function useFavicon(hourly: Hourly | null | undefined, points: Points | undefined) {
  useEffect(() => {
    // Find existing favicon link or create a new one
    let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      document.head.appendChild(faviconLink);
    }

    if (!hourly?.properties?.periods?.[0]) {
      // Reset to default favicon if no weather data
      faviconLink.href = "/_favicon.ico";
      document.title = "Weather 98";
      return;
    }

    const currentPeriod = hourly.properties.periods[0];
    const iconName = getIcon(currentPeriod.isDaytime, currentPeriod.shortForecast);
    
    if (!iconName) {
      // Reset to default if no icon name
      faviconLink.href = "/_favicon.ico";
      document.title = points?.city ? `${points.city} - Weather 98` : "Weather 98";
      return;
    }

    // Update the favicon href to the weather icon
    // Note: Browsers may show the first frame of the GIF as the favicon
    faviconLink.href = `/${iconName}.gif`;
    
    // Update page title with city name
    document.title = points?.city ? `${points.city} - Weather 98` : "Weather 98";
  }, [hourly, points]);
}
