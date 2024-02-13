import fs from "fs";
import { decode } from "html-entities";
import { XMLBuilder } from "fast-xml-parser";

function convertV1ToBeerXML(mmum: MMuM_V1): BeerXML {
  const calculateOG = (stammwuerze: number) =>
    1 + stammwuerze / (258.6 - (stammwuerze / 258.2) * 227.1);

  const calculateFG = (og: number, finalAttenuationPercentage: number) =>
    og * (1 - finalAttenuationPercentage) + finalAttenuationPercentage;

  // Fermentables
  const fermentables: BeerXMLFermentable[] = [];

  const fermentableEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Malz")
  );
  const amountOfFermentables = fermentableEntries.length / 3;
  for (let i = 1; i <= amountOfFermentables; i++) {
    const nameKey = `Malz${i}` as keyof typeof mmum;
    const amountKey = `Malz${i}_Menge` as keyof typeof mmum;
    const unitKey = `Malz${i}_Einheit` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[unitKey] !== undefined
    ) {
      const amount =
        mmum[unitKey] === "kg" ? mmum[amountKey] : mmum[amountKey] / 1000;
      fermentables.push({
        FERMENTABLE: {
          NAME: decode(mmum[nameKey]),
          AMOUNT: amount,
        },
      });
    }
  }

  // Misc
  const miscEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("WeitereZutat")
  );

  // Misc Gaerung
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

  // Misc Wuerze
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
    const infuseAmountKey = `Nachguss` as keyof typeof mmum;

    if (
      mmum[stepTempKey] !== undefined &&
      mmum[stepTimeKey] !== undefined &&
      mmum[infuseAmountKey] !== undefined
    ) {
      infusionMashSteps.push({
        MASH_STEP: {
          TYPE: "Infusion",
          STEP_TEMP: mmum[stepTempKey],
          STEP_TIME: mmum[stepTimeKey],
          INFUSE_AMOUNT: mmum[infuseAmountKey],
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
        TASTE_NOTES: mmum.Kurzbeschreibung, // laut php code ist es TASTE_NOTEs, vielleicht doch NOTES?
        NOTES: mmum.Anmerkung_Autor, // Vielleicht tauschen?
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
  //ToDo: Implement
  return "" as unknown as BeerXML;
}

function convertMMuMToBeerXML(mmum: MMuM_V1 | MMuM_V2): BeerXML {
  if (mmum.ExportVersion === "1.0") {
    return convertV1ToBeerXML(mmum as MMuM_V1);
  } else {
    return convertV2ToBeerXML(mmum as MMuM_V2);
  }
}

// read MMuM json file
const inputFolder = "./src/example/";
const file = "Rezept_Braureka";
const outputFolder = "./src/example/output/";

const data = fs.readFileSync(inputFolder + file + ".json");
const mmumFile = JSON.parse(data.toString());
const beerXML = convertMMuMToBeerXML(mmumFile);
const builder = new XMLBuilder({ oneListGroup: true, format: true });
const beerXMLFile = builder.build(beerXML);
fs.writeFileSync(outputFolder + file + ".xml", beerXMLFile, "utf8");
console.log(beerXML);

module.exports = convertMMuMToBeerXML;
