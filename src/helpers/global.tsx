export function getIcon(isDaytime: boolean, shortFC: string) {
  if (shortFC.includes("Showers And Thunderstorms")) {
    return "Showers And Thunderstorms";
  }

  if (shortFC.includes("Scattered Showers")) {
    return "Scattered Showers";
  }

  if (shortFC.includes("Rain Showers")) {
    return "Rain";
  }

  if (isDaytime) {
    return shortFC;
  }

  return `PM ${shortFC}`;
}
