import { decode } from "html-entities";
import {
  MMuM_V2,
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

export function convertV2ToBeerXML(mmum: MMuM_V2): BeerXML {
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
            AMOUNT: item.Menge / 1000,
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
            AMOUNT: item.Menge / 1000,
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

      return filteredDecoctions.map((item, index) => {
        return {
          MASH_STEP: {
            NAME: item.Form + " " + (index + 1),
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

  function extractTemperatureMashSteps(
    rests: MMuM_V2["Rasten"]
  ): BeerXMLMashStep[] {
    const filteredRests = rests.filter((item) => item.Zeit && item.Temperatur);

    return filteredRests.map((item, index) => {
      return {
        MASH_STEP: {
          NAME: "Temperature " + (index + 1),
          TYPE: "Temperature",
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
      NAME: "Einmaischen",
      TYPE: "Infusion",
      STEP_TEMP: mmum.Einmaischtemperatur, //ToDo: Einmaischtemperatur für Dekoktion anpassen
      STEP_TIME: 0,
    },
  };

  const decoctionMashSteps: BeerXMLMashStep[] = extractDecoctionMashSteps(
    mmum.Dekoktionen
  );
  const temperatureMashSteps: BeerXMLMashStep[] = extractTemperatureMashSteps(
    mmum.Rasten
  );

  const endMashStep: BeerXMLMashStep = {
    MASH_STEP: {
      NAME: "Abmaischen",
      TYPE: "Temperature",
      STEP_TIME: 0,
      STEP_TEMP: mmum["Abmaischtemperatur"],
    },
  };

  const og = calculateOG(mmum.Stammwuerze);
  const fg = mmum.Endvergaerungsgrad
    ? calculateFG(og, mmum.Endvergaerungsgrad / 100)
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
        BATCH_SIZE: mmum.Ausschlagwuerze,
        BOIL_SIZE: mmum.Hauptguss,
        EFFICIENCY: mmum.Sudhausausbeute ?? 65, // Default value if there is no value in mmum
        EST_ABV: mmum.Alkohol,
        EST_COLOR: mmum.Farbe,
        TASTE_NOTES: decode(mmum.Anmerkung_Autor),
        NOTES: decode(mmum.Kurzbeschreibung),
        CARBONATION: mmum.Karbonisierung,
        IBU: mmum.Bittere,
        OG: og,
        ...(fg !== undefined && { FG: fg }), // Only include FG if it's defined
        FERMENTABLES: fermentables,
        MISCS: [...wuerzeMiscs, ...gaerungMiscs],
        BOIL_TIME: mmum.Kochzeit_Wuerze,
        HOPS: [...hops, ...dryHops],
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
              NAME: decode(mmum.Hefe),
              ...(lowestTemp !== undefined && { MIN_TEMPERATURE: lowestTemp }),
              ...(highestTemp !== undefined && {
                MAX_TEMPERATURE: highestTemp,
              }),
              ...(mmum.Endvergaerungsgrad !== undefined && {
                ATTENUATION: Number(mmum.Endvergaerungsgrad),
              }),
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
