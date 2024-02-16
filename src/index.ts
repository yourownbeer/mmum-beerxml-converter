import fs from "fs";
import { decode } from "html-entities";
import { XMLBuilder } from "fast-xml-parser";

const calculateOG = (stammwuerze: number) =>
  1 + stammwuerze / (258.6 - (stammwuerze / 258.2) * 227.1);

const calculateFG = (og: number, finalAttenuationPercentage: number) =>
  og * (1 - finalAttenuationPercentage) + finalAttenuationPercentage;

function findLowestAndHighestTemperature(temperatureString: string) {
  const numbers = temperatureString
    .split("-")
    .map((number) => parseInt(number, 10));

  const lowestTemp = Math.min(...numbers);
  const highestTemp = Math.max(...numbers);

  return { lowestTemp, highestTemp };
}

function convertV1ToBeerXML(mmum: MMuM_V1): BeerXML {
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
  for (let i = 1; i <= amountOGaerungfMisc; i++) {
    const nameKey = `WeitereZutat_Gaerung_${i}_Name` as keyof typeof mmum;
    const amountKey = `WeitereZutat_Gaerung_${i}_Menge` as keyof typeof mmum;
    const unitKey = `WeitereZutat_Gaerung_${i}_Einheit` as keyof typeof mmum;

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
  for (let i = 1; i <= amountWuerzeMisc; i++) {
    const nameKey = `WeitereZutat_Wuerze_${i}_Name` as keyof typeof mmum;
    const amountKey = `WeitereZutat_Wuerze_${i}_Menge` as keyof typeof mmum;
    const unitKey = `WeitereZutat_Wuerze_${i}_Einheit` as keyof typeof mmum;
    const timeKey = `WeitereZutat_Wuerze_${i}_Kochzeit` as keyof typeof mmum;

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
  for (let i = 1; i <= amountOfVwhHops; i++) {
    const nameKey = `Hopfen_VWH_${i}_Sorte` as keyof typeof mmum;
    const amountKey = `Hopfen_VWH_${i}_Menge` as keyof typeof mmum;
    const alphaKey = `Hopfen_VWH_${i}_alpha` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[alphaKey] !== undefined
    ) {
      vwhHops.push({
        HOP: {
          NAME: decode(mmum[nameKey]),
          AMOUNT: mmum[amountKey],
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
  for (let i = 1; i <= amountOfUsualHops; i++) {
    const sortKey = `Hopfen_${i}_Sorte` as keyof typeof mmum;
    const amountKey = `Hopfen_${i}_Menge` as keyof typeof mmum;
    const alphaKey = `Hopfen_${i}_alpha` as keyof typeof mmum;
    const timeKey = `Hopfen_${i}_Kochzeit` as keyof typeof mmum;

    if (
      mmum[sortKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[alphaKey] !== undefined &&
      mmum[timeKey] !== undefined
    ) {
      usualHops.push({
        HOP: {
          NAME: decode(mmum[sortKey]),
          AMOUNT: mmum[amountKey],
          ALPHA: mmum[alphaKey],
          TIME: mmum[timeKey],
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
  for (let i = 1; i <= amountOfDryHops; i++) {
    const sortKey = `Stopfhopfen_${i}_Sorte` as keyof typeof mmum;
    const amountKey = `Stopfhopfen_${i}_Menge` as keyof typeof mmum;

    if (mmum[sortKey] !== undefined && mmum[amountKey] !== undefined) {
      dryHops.push({
        HOP: {
          NAME: decode(mmum[sortKey]),
          AMOUNT: mmum[amountKey],
          USE: "Dry Hop",
        },
      });
    }
  }

  // MashIn Mash Step
  const mashInMashStep: BeerXMLMashStep = {
    MASH_STEP: {
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
  for (let i = 0; i < amountOfDecoctionMashSteps; i++) {
    const volumeKey = `Dekoktion_${i}_Volumen` as keyof typeof mmum;
    const restTimeKey = `Dekoktion_${i}_Rastzeit` as keyof typeof mmum;
    const startTempKey = `Dekoktion_${i}_Temperatur_ist` as keyof typeof mmum;
    const endTempKey =
      `Dekoktion_${i}_Temperatur_resultierend` as keyof typeof mmum;

    if (
      mmum[volumeKey] !== undefined &&
      mmum[restTimeKey] !== undefined &&
      mmum[startTempKey] !== undefined &&
      mmum[endTempKey] !== undefined
    ) {
      decoctionMashSteps.push({
        MASH_STEP: {
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
  const infusionMashSteps: BeerXMLMashStep[] = [];

  const infusionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Infusion_Rast")
  );
  const amountOfInfusionMashSteps = infusionMashStepEntries.length / 2;
  for (let i = 1; i <= amountOfInfusionMashSteps; i++) {
    const stepTempKey = `Infusion_Rasttemperatur${i}` as keyof typeof mmum;
    const stepTimeKey = `Infusion_Rastzeit${i}` as keyof typeof mmum;

    if (mmum[stepTempKey] !== undefined && mmum[stepTimeKey] !== undefined) {
      infusionMashSteps.push({
        MASH_STEP: {
          TYPE: "Infusion",
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
      TYPE: "Temperature",
      STEP_TIME: 0,
      STEP_TEMP: Number(mmum["Abmaischtemperatur"]),
    },
  };

  const og = calculateOG(mmum.Stammwuerze);
  const fg = calculateFG(og, Number(mmum.Endvergaerungsgrad) / 100);

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
        EFFICIENCY: mmum.Sudhausausbeute,
        EST_ABV: mmum.Alkohol,
        EST_COLOR: mmum.Farbe,
        TASTE_NOTES: decode(mmum.Anmerkung_Autor),
        NOTES: decode(mmum.Kurzbeschreibung),
        CARBONATION: Number(mmum.Karbonisierung),
        IBU: mmum.Bittere,
        OG: og,
        FG: fg,
        FERMENTABLES: fermentables,
        MISCS: [...wuerzeMiscs, ...gaerungMiscs],
        BOIL_TIME: mmum.Kochzeit_Wuerze,
        HOPS: [...vwhHops, ...usualHops, ...dryHops],
        MASH: {
          VERSION: 1,
          MASH_STEPS: [
            mashInMashStep,
            ...decoctionMashSteps,
            ...infusionMashSteps,
            endMashStep,
          ],
        },
        YEASTS: [
          {
            YEAST: {
              NAME: mmum.Hefe,
              MIN_TEMPERATURE: Number(mmum.Gaertemperatur.split("-")[0]),
              MAX_TEMPERATURE: Number(mmum.Gaertemperatur.split("-")[1]),
              ATTENUATION: Number(mmum.Endvergaerungsgrad),
              AMOUNT: 1,
              AMOUNT_IS_WEIGHT: true,
            },
          },
        ],
      },
    },
  };

  return beerxml_object;
}

function convertV2ToBeerXML(mmum: MMuM_V2): BeerXML {
  function extractFermentables(malze: MMuM_V2["Malze"]): BeerXMLFermentable[] {
    return malze
      .map((malz) => {
        const name = malz.Name;
        const amountRaw = malz.Menge;
        const unit = malz.Einheit;

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

  function extractMiscFermentables(
    gaerungMiscs: MMuM_V2["WeitereZutatGaerung"]
  ): BeerXMLMisc[] {
    if (gaerungMiscs) {
      const filteredGaerungsMiscs = gaerungMiscs.filter(
        (item) => item.Name && item.Menge && item.Einheit
      );

      return filteredGaerungsMiscs.map((item) => {
        const amount = item.Einheit === "kg" ? item.Menge : item.Menge / 1000;
        return {
          MISC: {
            NAME: decode(item.Name),
            AMOUNT: amount,
            USE: "Primary",
          },
        };
      });
    } else {
      return [];
    }
  }

  function extractMiscSeasoning(
    seasoningMiscs: MMuM_V2["Gewuerze_etc"]
  ): BeerXMLMisc[] {
    if (seasoningMiscs) {
      const filteredSeasoningMiscs = seasoningMiscs.filter(
        (item) => item.Name && item.Menge && item.Einheit && item.Kochzeit
      );

      return filteredSeasoningMiscs.map((item) => {
        const amount = item.Einheit === "kg" ? item.Menge : item.Menge / 1000;
        return {
          MISC: {
            NAME: decode(item.Name),
            AMOUNT: amount,
            USE: "Boil",
            TIME: item.Kochzeit,
          },
        };
      });
    } else {
      return [];
    }
  }

  function extractHops(hops: MMuM_V2["Hopfenkochen"]): BeerXMLHop[] {
    if (hops) {
      const filteredHops = hops.filter(
        (item) => item.Sorte && item.Menge && item.Alpha
      );

      return filteredHops.map((item) => {
        let useValue: "First Wort" | "Aroma" | undefined;
        if (item.Typ === "Vorderwuerze") {
          useValue = "First Wort";
        } else if (item.Typ === "Whirlpool") {
          useValue = "Aroma";
        } else {
          useValue = undefined;
        }

        return {
          HOP: {
            NAME: decode(item.Sorte),
            AMOUNT: item.Menge,
            ALPHA: item.Alpha,
            TIME: item.Zeit,
            USE: useValue,
          },
        };
      });
    } else {
      return [];
    }
  }

  function extractDryHops(dryHops: MMuM_V2["Stopfhopfen"]): BeerXMLHop[] {
    if (dryHops) {
      const filteredDryHops = dryHops.filter(
        (item) => item.Sorte && item.Menge
      );

      return filteredDryHops.map((item) => {
        return {
          HOP: {
            NAME: decode(item.Sorte),
            AMOUNT: item.Menge,
            USE: "Dry Hop",
          },
        };
      });
    } else {
      return [];
    }
  }

  //ToDo: Teilmaische_Rastzeit,Teilmaische_Temperatur, Teilmaische_Kochzeit integrieren
  //ToDo: "Einmaisch_Zubruehwasser_gesamt" integrieren
  function extractDecoctionMashSteps(
    decoctions: MMuM_V2["Dekoktionen"]
  ): BeerXMLMashStep[] {
    if (decoctions) {
      const filteredDecoctions = decoctions.filter((item) => item.Volumen);

      return filteredDecoctions.map((item) => {
        return {
          MASH_STEP: {
            NAME: item.Form,
            TYPE: "Decoction",
            DECOCTION_AMT: item.Volumen,
            STEP_TIME: item.Rastzeit,
            STEP_TEMP: item.Temperatur_ist ?? item.Teilmaische_Temperatur,
            END_TEMP: item.Temperatur_resultierend,
          },
        };
      });
    } else {
      return [];
    }
  }

  function extractInfusionMashSteps(
    rests: MMuM_V2["Rasten"]
  ): BeerXMLMashStep[] {
    const filteredRests = rests.filter((item) => item.Zeit && item.Temperatur);

    return filteredRests.map((item) => {
      return {
        MASH_STEP: {
          TYPE: "Infusion",
          STEP_TEMP: item.Temperatur,
          STEP_TIME: item.Zeit,
          INFUSE_AMOUNT: mmum.Hauptguss,
        },
      };
    });
  }

  const fermentables: BeerXMLFermentable[] = extractFermentables(mmum.Malze);
  const gaerungMiscs: BeerXMLMisc[] = extractMiscFermentables(
    mmum.WeitereZutatGaerung
  );
  const wuerzeMiscs: BeerXMLMisc[] = extractMiscSeasoning(mmum.Gewuerze_etc);
  const hops: BeerXMLHop[] = extractHops(mmum.Hopfenkochen);
  const dryHops: BeerXMLHop[] = extractDryHops(mmum.Stopfhopfen);

  const mashInMashStep: BeerXMLMashStep = {
    MASH_STEP: {
      TYPE: "Infusion",
      STEP_TEMP: mmum.Einmaischtemperatur, //ToDo: Einmaischtemperatur für Dekoktion anpassen
      STEP_TIME: 0,
    },
  };

  const decoctionMashSteps: BeerXMLMashStep[] = extractDecoctionMashSteps(
    mmum.Dekoktionen
  );
  const infusionMashSteps: BeerXMLMashStep[] = extractInfusionMashSteps(
    mmum.Rasten
  );

  const endMashStep: BeerXMLMashStep = {
    MASH_STEP: {
      TYPE: "Temperature",
      STEP_TIME: 0,
      STEP_TEMP: mmum["Abmaischtemperatur"],
    },
  };

  const og = calculateOG(mmum.Stammwuerze);
  const fg = calculateFG(og, mmum.Endvergaerungsgrad / 100);
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
        BATCH_SIZE: mmum.Ausschlagwuerze,
        BOIL_SIZE: mmum.Hauptguss,
        EFFICIENCY: mmum.Sudhausausbeute,
        EST_ABV: mmum.Alkohol,
        EST_COLOR: mmum.Farbe,
        TASTE_NOTES: decode(mmum.Anmerkung_Autor),
        NOTES: decode(mmum.Kurzbeschreibung),
        CARBONATION: mmum.Karbonisierung,
        IBU: mmum.Bittere,
        OG: og,
        FG: fg,
        FERMENTABLES: fermentables,
        MISCS: [...wuerzeMiscs, ...gaerungMiscs],
        BOIL_TIME: mmum.Kochzeit_Wuerze,
        HOPS: [...hops, ...dryHops],
        MASH: {
          VERSION: 1,
          MASH_STEPS: [
            mashInMashStep,
            ...decoctionMashSteps,
            ...infusionMashSteps,
            endMashStep,
          ],
        },
        YEASTS: [
          {
            YEAST: {
              NAME: decode(mmum.Hefe),
              MIN_TEMPERATURE: lowestTemp,
              MAX_TEMPERATURE: highestTemp,
              ATTENUATION: Number(mmum.Endvergaerungsgrad),
              AMOUNT: 1,
              AMOUNT_IS_WEIGHT: true,
            },
          },
        ],
      },
    },
  };

  return beerxml_object;
}

function convertMMuMToBeerXML(mmum: MMuM_V1 | MMuM_V2): BeerXML {
  if (mmum.ExportVersion === "1.0") {
    return convertV1ToBeerXML(mmum as MMuM_V1);
  } else {
    return convertV2ToBeerXML(mmum as MMuM_V2);
  }
}

// read MMuM json file
// const inputFolder = "./src/example/";
// const file = "Mandarin_Flower";
// const outputFolder = "./src/example/output/";

// const data = fs.readFileSync(inputFolder + file + ".json");
// const mmumFile = JSON.parse(data.toString());
// const beerXML = convertMMuMToBeerXML(mmumFile);
// const builder = new XMLBuilder({
//   processEntities: true,
//   oneListGroup: true,
//   format: true,
// });
// const beerXMLFile = builder.build(beerXML);
// fs.writeFileSync(outputFolder + file + ".xml", beerXMLFile, "utf8");

export default convertMMuMToBeerXML;
