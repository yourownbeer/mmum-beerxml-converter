/**
 * Calculates the Original Gravity (OG) based on the provided stammwuerze (original wort).
 * @param stammwuerze - The original wort value.
 * @returns The calculated Original Gravity (OG).
 */
export const calculateOG = (stammwuerze: number) =>
  1 + stammwuerze / (258.6 - (stammwuerze / 258.2) * 227.1);

/**
 * Calculates the Final Gravity (FG) based on the original gravity (OG) and final attenuation percentage.
 * @param og - The original gravity.
 * @param finalAttenuationPercentage - The final attenuation percentage.
 * @returns The calculated Final Gravity (FG).
 */
export const calculateFG = (og: number, finalAttenuationPercentage: number) =>
  og * (1 - finalAttenuationPercentage) + finalAttenuationPercentage;

/**
 * Finds the lowest and highest temperature from a temperature string.
 * @param temperatureString - A string containing temperature ranges, e.g., "18-22".
 * @returns An object containing the lowest and highest temperature values.
 */
export function findLowestAndHighestTemperature(temperatureString: string) {
  const numbers = temperatureString
    .split("-")
    .map((number) => parseInt(number, 10))
    .filter((number) => !isNaN(number));

  if (numbers.length === 0) {
    return { lowestTemp: undefined, highestTemp: undefined };
  }

  const lowestTemp = Math.min(...numbers);
  const highestTemp = Math.max(...numbers);

  return { lowestTemp, highestTemp };
}
