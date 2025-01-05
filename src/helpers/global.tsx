export function getIcon(isDaytime: boolean, shortFC: string) {
  // catch where the short forecast has various prefixes before
  // the actual forecast like slight chance and chance of ...
  if (!shortFC) {
    return "";
  }

  if (shortFC.includes("Showers And Thunderstorms")) {
    return "Showers And Thunderstorms";
  }

  if (shortFC.includes("Scattered Showers")) {
    return "Scattered Showers";
  }

  if (shortFC.includes("Rain Showers")) {
    return "Rain";
  }

  if (shortFC.includes("Showers")) {
    return "Showers";
  }

  if (shortFC.includes("Rain")) {
    return "Rain";
  }

  if (shortFC.includes("Drizzle")) {
    return "Showers";
  }

  if (shortFC.includes("Freezing Rain")) {
    return "Freezing Rain";
  }

  if (shortFC.includes("Fog")) {
    return "Fog";
  }

  if (shortFC.includes("Windy")) {
    return "Windy";
  }

  if (shortFC.includes("Light Snow")) {
    return "Light Snow";
  }

  if (shortFC.includes("Heavy Snow")) {
    return "Heavy Snow";
  }

  if (shortFC.includes("Snow")) {
    return "Light Snow";
  }

  if (shortFC.includes("Sleet")) {
    return "Freezing Rain";
  }

  if (shortFC.includes("Thunderstorms")) {
    return "Thunderstorms";
  }

  if (shortFC.includes("T-storms")) {
    return "Thunderstorms";
  }

  if (shortFC.includes("Tropical Storm")) {
    return "Thunderstorms";
  }

  if (shortFC.includes("Wintry")) {
    return "Wintry Mix";
  }

  if (shortFC.includes("Frost")) {
    return "Frigid";
  }

  if (shortFC.includes("Wind")) {
    return "Windy";
  }

  if (shortFC.includes("Blowing Dust")) {
    return "Windy";
  }

  if (isDaytime) {
    return shortFC;
  }

  return `PM ${shortFC}`;
}

export function shuffle(array: Array<{ src: string }>) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}
