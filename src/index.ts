import fs from "fs";
import { XMLBuilder } from "fast-xml-parser";

// read MMuM json file
const data = fs.readFileSync("./src/example/Bavarian_IPA.json");
const mmumFile = JSON.parse(data.toString());
const beerXML = convertMMuMToBeerXML(mmumFile);
console.log(beerXML);

function convertV1ToBeerXML(mmum: MMuM_V1): BeerXML {
  const calculateOG = (stammwuerze: number) =>
    1 + stammwuerze / (258.6 - (stammwuerze / 258.2) * 227.1);

  const fermentableEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Malz")
  );
  const amountOfFermentables = fermentableEntries.length / 3;
  const fermentables: BeerXMLFermentable[] = [];
  for (let i = 1; i <= amountOfFermentables; i++) {
    const nameKey = `Malz${i}` as keyof typeof mmum;
    const amountKey = `Malz${i}_Menge` as keyof typeof mmum;

    if (mmum[nameKey] !== undefined && mmum[amountKey] !== undefined) {
      fermentables.push({
        FERMENTABLE: {
          NAME: mmum[nameKey],
          AMOUNT: mmum[amountKey],
        },
      });
    }
  }

  const miscEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("WeitereZutat")
  );
  const miscGaerungEntries = miscEntries.filter((entryName) =>
    entryName.includes("Gaerung")
  );
  const miscWuerzeEntries = miscEntries.filter((entryName) =>
    entryName.includes("Wuerze")
  );

  const amountOGaerungfMisc = miscGaerungEntries.length / 3;
  const gaerungMiscs: BeerXMLMisc[] = [];
  for (let i = 1; i <= amountOGaerungfMisc; i++) {
    const nameKey = `WeitereZutat_Gaerung_${i}_Name` as keyof typeof mmum;
    const amountKey = `WeitereZutat_Gaerung_${i}_Menge` as keyof typeof mmum;
    const unitKey = `WeitereZutat_Gaerung_${i}_Einheit` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[unitKey] !== undefined
    ) {
      gaerungMiscs.push({
        MISC: {
          NAME: mmum[nameKey],
          AMOUNT: mmum[amountKey],
          USE: "Primary",
          TIME: mmum[unitKey],
        },
      });
    }
  }

  const amountWuerzeMisc = miscWuerzeEntries.length / 3;
  const wuerzeMiscs: BeerXMLMisc[] = [];
  for (let i = 1; i <= amountWuerzeMisc; i++) {
    const nameKey = `WeitereZutat_Wuerze_${i}_Name` as keyof typeof mmum;
    const amountKey = `WeitereZutat_Wuerze_${i}_Menge` as keyof typeof mmum;
    const unitKey = `WeitereZutat_Wuerze_${i}_Einheit` as keyof typeof mmum;

    if (
      mmum[nameKey] !== undefined &&
      mmum[amountKey] !== undefined &&
      mmum[unitKey] !== undefined
    ) {
      wuerzeMiscs.push({
        MISC: {
          NAME: mmum[nameKey],
          AMOUNT: mmum[amountKey],
          USE: "Boil",
          TIME: mmum[unitKey],
        },
      });
    }
  }

  const hopEntries = Object.keys(mmum).filter((entryName) =>
    entryName.toLowerCase().includes("hopfen")
  );

  const vwhHopEntries = hopEntries.filter((entryName) =>
    entryName.includes("VWH")
  );
  const amountOfVwhHops = vwhHopEntries.length / 3;

  const vwhHops: BeerXMLHop[] = [];
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
          NAME: mmum[nameKey],
          AMOUNT: mmum[amountKey],
          ALPHA: mmum[alphaKey],
          USE: "First Wort",
        },
      });
    }
  }

  const usualHopEntries = hopEntries.filter((entryName) =>
    entryName.includes("Hopfen_")
  );
  const amountOfUsualHops = usualHopEntries.length / 4;
  const usualHops: BeerXMLHop[] = [];
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
          NAME: mmum[sortKey],
          AMOUNT: mmum[amountKey],
          ALPHA: mmum[alphaKey],
          TIME: mmum[timeKey],
        },
      });
    }
  }

  const dryHopEntries = hopEntries.filter((entryName) =>
    entryName.includes("Stopfhopfen_")
  );
  const amountOfDryHops = dryHopEntries.length / 2;
  const dryHops: BeerXMLHop[] = [];
  for (let i = 1; i <= amountOfDryHops; i++) {
    const sortKey = `Stopfhopfen_${i}_Sorte` as keyof typeof mmum;
    const amountKey = `Stopfhopfen_${i}_Menge` as keyof typeof mmum;

    if (mmum[sortKey] !== undefined && mmum[amountKey] !== undefined) {
      dryHops.push({
        HOP: {
          NAME: mmum[sortKey],
          AMOUNT: mmum[amountKey],
          USE: "Dry Hop",
        },
      });
    }
  }

  const decoctionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Dekoktion")
  );
  const amountOfDecoctionMashSteps = decoctionMashStepEntries.length / 2;
  const decoctionMashSteps: BeerXMLMashStep[] = [];
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

  const infusionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes("Infusion_Rast")
  );
  const amountOfInfusionMashSteps = infusionMashStepEntries.length / 2;
  const infusionMashSteps: BeerXMLMashStep[] = [];
  for (let i = 1; i <= amountOfInfusionMashSteps; i++) {
    const tempKey = `Infusion_Rasttemperatur${i}` as keyof typeof mmum;
    const stepTempKey = `Infusion_Einmaischtemperatur` as keyof typeof mmum;
    const stepTimeKey = `Infusion_Rastzeit${i}` as keyof typeof mmum;
    const infuseAmountKey = `Nachguss` as keyof typeof mmum;

    if (
      mmum[tempKey] !== undefined &&
      mmum[stepTempKey] !== undefined &&
      mmum[stepTimeKey] !== undefined &&
      mmum[infuseAmountKey] !== undefined
    ) {
      infusionMashSteps.push({
        MASH_STEP: {
          TYPE: "Infusion",
          TEMP: mmum[tempKey],
          STEP_TEMP: mmum[stepTempKey],
          STEP_TIME: mmum[stepTimeKey],
          INFUSE_AMOUNT: mmum[infuseAmountKey],
        },
      });
    }
  }

  const endMashStep: BeerXMLMashStep = {
    MASH_STEP: {
      TYPE: "Temperature",
      STEP_TIME: 0,
      STEP_TEMP: Number(mmum["Abmaischtemperatur"]),
    },
  };

  const beerxml_json: BeerXML = {
    RECIPES: {
      RECIPE: {
        NAME: mmum.Name,
        DATE: mmum.Datum,
        STYLE: {
          NAME: mmum.Sorte,
        },
        VERSION: 1, // always set to 1
        BREWER: mmum.Autor,
        BATCH_SIZE: mmum.Ausschlagswuerze,
        BOIL_SIZE: mmum.Infusion_Hauptguss,
        EFFICIENCY: mmum.Sudhausausbeute,
        ABV: mmum.Alkohol,
        EST_COLOR: mmum.Farbe,
        TASTE_NOTES: mmum.Kurzbeschreibung, // laut php code ist es TASTE_NOTEs, vielleicht doch NOTES?
        NOTES: mmum.Anmerkung_Autor, // Vielleicht tauschen?
        CARBONATION: Number(mmum.Karbonisierung),
        IBU: mmum.Bittere,
        OG: calculateOG(mmum.Stammwuerze),
        FERMENTABLES: fermentables,
        MISCS: [...wuerzeMiscs, ...gaerungMiscs],
        BOIL_TIME: mmum.Kochzeit_Wuerze,
        HOPS: [...vwhHops, ...usualHops, ...dryHops],
        MASH: {
          VERSION: 1,
          MASH_STEPS: [
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
            },
          },
        ],
      },
    },
  };

  const builder = new XMLBuilder({ oneListGroup: true, format: true });
  const beerxml = builder.build(beerxml_json);
  fs.writeFileSync("./src/example/output/Bavarian_IPA.xml", beerxml, "utf8");

  return beerxml_json;
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

module.exports = convertMMuMToBeerXML;
