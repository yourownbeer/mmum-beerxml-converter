import { decode } from "html-entities";
import {
  MMuM_V1,
  BeerXML,
  BeerXMLFermentable,
  BeerXMLMisc,
  BeerXMLHop,
  BeerXMLMashStep,
} from "./type";
import {
  calculateFG,
  calculateOG,
  findLowestAndHighestTemperature,
} from "./utils";

export function convertV1ToBeerXML(mmum: MMuM_V1): BeerXML {
  function extractFermentables(mmum: MMuM_V1): BeerXMLFermentable[] {
    return Object.keys(mmum)
      .filter((key) => key.startsWith("Malz") && !key.includes("_"))
      .map((baseKey) => {
        const nameKey = baseKey as keyof typeof mmum;
        const amountKey = `${baseKey}_Menge` as keyof typeof mmum;
        const unitKey = `${baseKey}_Einheit` as keyof typeof mmum;

        const name = mmum[nameKey];
        const amountRaw = mmum[amountKey];
        const unit = mmum[unitKey];

        if (name && amountRaw && unit) {
          const amount = unit === "kg" ? amountRaw : amountRaw / 1000;
          return {
            FERMENTABLE: {
              NAME: decode(name),
              AMOUNT: amount,
            },
          };
        }
        return undefined;
      })
      .filter((item): item is BeerXMLFermentable => item !== undefined);
  }

  const fermentables: BeerXMLFermentable[] = extractFermentables(mmum);

  const miscEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("WeitereZutat")
  );

  const gaerungMiscs: BeerXMLMisc[] = [];

  const miscGaerungEntries = miscEntries.filter((entryName) =>
    entryName.includes("Gaerung")
  );
  const amountOGaerungfMisc = miscGaerungEntries.length / 3;
  for (let index = 1; index <= amountOGaerungfMisc; index++) {
    const nameKey = `WeitereZutat_Gaerung_${index}_Name` as keyof typeof mmum;
    const amountKey =
      `WeitereZutat_Gaerung_${index}_Menge` as keyof typeof mmum;
    const unitKey =
      `WeitereZutat_Gaerung_${index}_Einheit` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[unitKey] !== undefined
    ) {
      const amount =
        mmum[unitKey] === "kg" ? mmum[amountKey] : mmum[amountKey] / 1000;
      gaerungMiscs.push({
        MISC: {
          NAME: decode(mmum[nameKey]),
          AMOUNT: amount,
          USE: "Primary",
        },
      });
    }
  }

  const wuerzeMiscs: BeerXMLMisc[] = [];

  const miscWuerzeEntries = miscEntries.filter((entryName) =>
    entryName.includes("Wuerze")
  );
  const amountWuerzeMisc = miscWuerzeEntries.length / 3;
  for (let index = 1; index <= amountWuerzeMisc; index++) {
    const nameKey = `WeitereZutat_Wuerze_${index}_Name` as keyof typeof mmum;
    const amountKey = `WeitereZutat_Wuerze_${index}_Menge` as keyof typeof mmum;
    const unitKey = `WeitereZutat_Wuerze_${index}_Einheit` as keyof typeof mmum;
    const timeKey =
      `WeitereZutat_Wuerze_${index}_Kochzeit` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[unitKey] !== undefined &&
      mmum[timeKey] !== undefined
    ) {
      const amount =
        mmum[unitKey] === "kg" ? mmum[amountKey] : mmum[amountKey] / 1000;
      wuerzeMiscs.push({
        MISC: {
          NAME: decode(mmum[nameKey]),
          AMOUNT: amount,
          USE: "Boil",
          TIME: mmum[timeKey],
        },
      });
    }
  }

  // Hops
  const hopEntries = Object.keys(mmum).filter((entryName) =>
    entryName.toLowerCase().includes("hopfen")
  );

  // FW Hops
  const vwhHops: BeerXMLHop[] = [];

  const vwhHopEntries = hopEntries.filter((entryName) =>
    entryName.includes("VWH")
  );
  const amountOfVwhHops = vwhHopEntries.length / 3;
  for (let index = 1; index <= amountOfVwhHops; index++) {
    const nameKey = `Hopfen_VWH_${index}_Sorte` as keyof typeof mmum;
    const amountKey = `Hopfen_VWH_${index}_Menge` as keyof typeof mmum;
    const alphaKey = `Hopfen_VWH_${index}_alpha` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[alphaKey] !== undefined
    ) {
      vwhHops.push({
        HOP: {
          NAME: decode(mmum[nameKey]),
          AMOUNT: mmum[amountKey] / 1000,
          ALPHA: mmum[alphaKey],
          USE: "First Wort",
        },
      });
    }
  }

  // Fluid Hops
  const usualHops: BeerXMLHop[] = [];

  const usualHopEntries = hopEntries.filter((entryName) =>
    entryName.includes("Hopfen_")
  );
  const amountOfUsualHops = usualHopEntries.length / 4;
  for (let index = 1; index <= amountOfUsualHops; index++) {
    const sortKey = `Hopfen_${index}_Sorte` as keyof typeof mmum;
    const amountKey = `Hopfen_${index}_Menge` as keyof typeof mmum;
    const alphaKey = `Hopfen_${index}_alpha` as keyof typeof mmum;
    const timeKey = `Hopfen_${index}_Kochzeit` as keyof typeof mmum;

    if (
      mmum[sortKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[alphaKey] !== undefined &&
      mmum[timeKey] !== undefined
    ) {
      usualHops.push({
        HOP: {
          NAME: decode(mmum[sortKey]),
          AMOUNT: mmum[amountKey] / 1000,
          ALPHA: mmum[alphaKey],
          TIME: mmum[timeKey] === "Whirlpool" ? 0 : mmum[timeKey],
        },
      });
    }
  }

  // Dry Hops
  const dryHops: BeerXMLHop[] = [];

  const dryHopEntries = hopEntries.filter((entryName) =>
    entryName.includes("Stopfhopfen_")
  );
  const amountOfDryHops = dryHopEntries.length / 2;
  for (let index = 1; index <= amountOfDryHops; index++) {
    const sortKey = `Stopfhopfen_${index}_Sorte` as keyof typeof mmum;
    const amountKey = `Stopfhopfen_${index}_Menge` as keyof typeof mmum;

    if (mmum[sortKey] !== undefined && mmum[amountKey] !== undefined) {
      dryHops.push({
        HOP: {
          NAME: decode(mmum[sortKey]),
          AMOUNT: mmum[amountKey] / 1000,
          USE: "Dry Hop",
        },
      });
    }
  }

  // MashIn Mash Step
  const mashInMashStep: BeerXMLMashStep = {
    MASH_STEP: {
      NAME: "Einmaischen",
      TYPE: "Infusion",
      STEP_TEMP: mmum["Infusion_Einmaischtemperatur"],
      STEP_TIME: 0,
    },
  };

  // Decoction Mash Steps
  const decoctionMashSteps: BeerXMLMashStep[] = [];

  const decoctionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Dekoktion")
  );
  const amountOfDecoctionMashSteps = decoctionMashStepEntries.length / 2;
  for (let index = 0; index < amountOfDecoctionMashSteps; index++) {
    const volumeKey = `Dekoktion_${index}_Volumen` as keyof typeof mmum;
    const restTimeKey = `Dekoktion_${index}_Rastzeit` as keyof typeof mmum;
    const startTempKey =
      `Dekoktion_${index}_Temperatur_ist` as keyof typeof mmum;
    const endTempKey =
      `Dekoktion_${index}_Temperatur_resultierend` as keyof typeof mmum;

    if (
      mmum[volumeKey] !== undefined &&
      mmum[restTimeKey] !== undefined &&
      mmum[startTempKey] !== undefined &&
      mmum[endTempKey] !== undefined
    ) {
      decoctionMashSteps.push({
        MASH_STEP: {
          NAME: "Decoction " + (index + 1),
          TYPE: "Decoction",
          INFUSE_AMOUNT: mmum[volumeKey],
          STEP_TIME: mmum[restTimeKey],
          STEP_TEMP: mmum[startTempKey],
          END_TEMP: mmum[endTempKey],
        },
      });
    }
  }

  // Infusion Rast Mash Steps
  const temperatureMashSteps: BeerXMLMashStep[] = [];

  const infusionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Infusion_Rast")
  );
  const amountOfInfusionMashSteps = infusionMashStepEntries.length / 2;
  for (let index = 1; index <= amountOfInfusionMashSteps; index++) {
    const stepTempKey = `Infusion_Rasttemperatur${index}` as keyof typeof mmum;
    const stepTimeKey = `Infusion_Rastzeit${index}` as keyof typeof mmum;

    if (mmum[stepTempKey] !== undefined && mmum[stepTimeKey] !== undefined) {
      temperatureMashSteps.push({
        MASH_STEP: {
          NAME: "Temperature " + (index + 1),
          TYPE: "Temperature",
          STEP_TEMP: mmum[stepTempKey],
          STEP_TIME: mmum[stepTimeKey],
          INFUSE_AMOUNT: mmum.Infusion_Hauptguss,
        },
      });
    }
  }

  // Abmaisch Mash Step
  const endMashStep: BeerXMLMashStep = {
    MASH_STEP: {
      NAME: "Abmaischen",
      TYPE: "Temperature",
      STEP_TIME: 0,
      STEP_TEMP: Number(mmum["Abmaischtemperatur"]),
    },
  };

  const og = calculateOG(mmum.Stammwuerze);
  const fg = mmum.Endvergaerungsgrad
    ? calculateFG(og, Number(mmum.Endvergaerungsgrad) / 100)
    : undefined;
  const { lowestTemp, highestTemp } = findLowestAndHighestTemperature(
    mmum.Gaertemperatur
  );

  const beerxml_object: BeerXML = {
    RECIPES: {
      RECIPE: {
        NAME: mmum.Name,
        VERSION: 1, // always set to 1
        DATE: mmum.Datum,
        STYLE: {
          NAME: mmum.Sorte,
        },
        BREWER: mmum.Autor,
        BATCH_SIZE: mmum.Ausschlagswuerze,
        BOIL_SIZE: mmum.Infusion_Hauptguss,
        EFFICIENCY: mmum.Sudhausausbeute ?? 65, // Default value if there is no value in mmum
        EST_ABV: mmum.Alkohol,
        EST_COLOR: mmum.Farbe,
        TASTE_NOTES: decode(mmum.Anmerkung_Autor),
        NOTES: decode(mmum.Kurzbeschreibung),
        CARBONATION: Number(mmum.Karbonisierung),
        IBU: mmum.Bittere,
        OG: og,
        ...(fg !== undefined && { FG: fg }), // Only include FG if it's defined
        FERMENTABLES: fermentables,
        MISCS: [...wuerzeMiscs, ...gaerungMiscs],
        BOIL_TIME: mmum.Kochzeit_Wuerze,
        HOPS: [...vwhHops, ...usualHops, ...dryHops],
        MASH: {
          VERSION: 1,
          MASH_STEPS: [
            mashInMashStep,
            ...decoctionMashSteps,
            ...temperatureMashSteps,
            endMashStep,
          ],
        },
        YEASTS: [
          {
            YEAST: {
              NAME: mmum.Hefe,
              ...(lowestTemp !== undefined && { MIN_TEMPERATURE: lowestTemp }),
              ...(highestTemp !== undefined && {
                MAX_TEMPERATURE: highestTemp,
              }),
              ATTENUATION: Number(mmum.Endvergaerungsgrad),
              AMOUNT: 0.01,
              AMOUNT_IS_WEIGHT: true,
            },
          },
        ],
      },
    },
  };

  return beerxml_object;
}
