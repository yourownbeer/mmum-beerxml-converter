// http://www.beerxml.com/beerxml.htm

export interface BeerXML {
  RECIPES: {
    RECIPE: {
      NAME: string;
      VERSION: number;
      TYPE?: "extract" | "partial mas" | "all grain";
      STYLE: BeerXMLStyle;
      BREWER: string;
      ASST_BREWER?: string;
      BATCH_SIZE: number; // Volume (liters)
      BOIL_SIZE: number; // Volume (liters)
      BOIL_TIME: number; // Minutes
      EFFICIENCY: number; // Percent
      ALPHA?: number;
      AMOUNT?: number;
      HOPS: BeerXMLHop[];
      FERMENTABLES: BeerXMLFermentable[];
      MISCS: BeerXMLMisc[];
      YEASTS: BeerXMLYeast[];
      MASH: BeerXMLMash;
      NOTES?: string;
      TASTE_NOTES?: string;
      TASTE_RATING?: number;
      OG?: number;
      FG?: number;
      FERMENTATION_STAGES?: number;
      PRIMARY_AGE?: number; // Days
      PRIMARY_TEMP?: number; // Temperature (C)
      SECONDARY_AGE?: number; // Days
      SECONDARY_TEMP?: number; // Temperature (C)
      TERTIARY_AGE?: number; // Days
      AGE?: number; // Days
      AGE_TEMP?: number; // Temperature (C)
      DATE?: string;
      CARBONATION?: number; // Volume (liters)
      FORCED_CARBONATION?: boolean;
      PRIMING_SUGAR_NAME?: string;
      CARBONATION_TEMP?: number; // Temperature (C)
      PRIMING_SUGAR_EQUIV?: number; // Weight (kg)
      KEG_PRIMING_FACTOR?: number;
      ABV?: number; // Percent
      EST_ABV: number;
      EST_COLOR?: string | number;
      IBU?: number;
    };
  };
}

export interface BeerXMLHop {
  HOP: {
    NAME: string;
    VERSION?: number;
    ALPHA?: number;
    AMOUNT: number;
    USE?: "Boil" | "Dry Hop" | "Mash" | "First Wort" | "Aroma";
    TIME?: number; // minutes
    NOTES?: string;
    TYPE?: "Bittering" | "Aroma" | "Both";
    FORM?: "Pellet" | "Plug" | "Leaf";
    BETA?: number; // Percentage
    HSI?: number; // Percentage
    ORIGIN?: string;
    SUBSTITUTES?: string;
    HUMULENE?: number;
    CARYOPHYLLENE?: number;
    COHUMULONE?: number;
    MYRCENE?: number;
  };
}

export interface BeerXMLFermentable {
  FERMENTABLE: {
    NAME: string;
    VERSION?: number;
    AMOUNT: number; // Weight (kg)
    TYPE?: string[];
    YIELD?: number; // Percent
    COLOR?: number; // Floating Point
    ADD_AFTER_BOIL?: boolean;
    ORIGIN?: string;
    SUPPLIER?: string;
    NOTES?: string;
    COARSE_FINE_DIFF?: number; // Percent
    MOISTURE?: number; // Percent
    DIASTATIC_POWER?: number; // Floating Point
    PROTEIN?: number; // Percent
    MAX_IN_BATCH?: number; // Precent
    RECOMMEND_MASH?: boolean;
    IBU_GAL_PER_LB?: number; // Floating Point
  };
}

export interface BeerXMLYeast {
  YEAST: {
    NAME: string;
    VERSION?: number;
    TYPE?: "ale" | "lager" | "wheat" | "wine" | "champagne";
    FORM?: "liquid" | "dry" | "slant" | "culture";
    AMOUNT?: number; // Volume (liters) or Weight (kg)
    AMOUNT_IS_WEIGHT?: boolean;
    LABORATORY?: string;
    PRODUCT_ID?: string;
    MIN_TEMPERATURE?: number; // Temperatur (C)
    MAX_TEMPERATURE?: number; // Temperatur (C)
    FLOCCULATION?: "low" | "medium" | "high" | "very high";
    ATTENUATION?: number; // Percent
    NOTES?: string;
    BEST_FOR?: string;
    TIMES_CULTURED?: number;
    MAX_REUSE?: number;
    ADD_TO_SECONDARY?: boolean;
  };
}

export interface BeerXMLMisc {
  MISC: {
    NAME: string;
    VERSION?: number;
    TYPE?: "spice" | "fining" | "water agent" | "herb" | "flavor" | "other";
    USE: "Boil" | "Mash" | "Primary" | "Secondary" | "Bottling";
    TIME?: number; // Minutes
    AMOUNT: number; // Weight (kg) or Volume (liters)
    AMOUNT_IS_WEIGHT?: boolean;
    USE_FOR?: string;
    NOTES?: string;
  };
}

export interface BeerXMLMash {
  NAME?: string;
  VERSION?: number;
  GRAIN_TEMP?: number; // Temperature (C)
  MASH_STEPS: BeerXMLMashStep[];
  NOTES?: string;
  TUN_TEMP?: number; // Temperature (C)
  SPARGE_TEMP?: number; // Temperature (C)
  PH?: number;
  TUN_WEIGHT?: number; // Weight (kg)
  TUN_SPECIFIC_HEAT?: number;
  EQUIP_ADJUST?: boolean;
}

export interface BeerXMLMashStep {
  MASH_STEP: {
    NAME?: string;
    VERSION?: number;
    TYPE: "Infusion" | "Temperature" | "Decoction";
    INFUSE_AMOUNT?: number; // Volume (liters)
    STEP_TIME?: number; // Minutes
    STEP_TEMP?: number; // Temperature (C)
    RAMP_TIME?: number; // Minutes
    END_TEMP?: number; // Temperature (C)
  };
}

export interface BeerXMLStyle {
  NAME: string;
  CATEGORY?: string;
  VERSION?: number;
  CATEGORY_NUMBER?: number;
  STYLE_LETTER?: string;
  STYLE_GUIDE?: string;
  TYPE?: "lager" | "ale" | "mead" | "wheat" | "mixed" | "cider";
  OG_MIN?: number;
  OG_MAX?: number;
  FG_MIN?: number;
  FG_MAX?: number;
  IBU_MIN?: number;
  IBU_MAX?: number;
  COLOR_MIN?: number;
  COLOR_MAX?: number;
  CARB_MIN?: number;
  CARB_MAX?: number;
  ABV_MIN?: number;
  ABV_MAX?: number;
  NOTES?: string;
  PROFILE?: string;
  INGREDIENTS?: string;
  EXAMPLES?: string;
}

//Mmum

export interface MMuM_V1 {
  Anmerkung_Autor: any;
  Rezeptquelle: string;
  ExportVersion: string;
  Name: string;
  Datum: string;
  Sorte: string;
  Autor: string;
  Ausschlagswuerze: number;
  Sudhausausbeute: number;
  Stammwuerze: number;
  Bittere: number;
  Farbe: string;
  Alkohol: number;
  Kurzbeschreibung: string;
  Malz1: string;
  Malz1_Menge: number;
  Malz1_Einheit: string;
  Malz2: string;
  Malz2_Menge: number;
  Malz2_Einheit: string;
  Malz3: string;
  Malz3_Menge: number;
  Malz3_Einheit: string;
  Malz4: string;
  Malz4_Menge: number;
  Malz4_Einheit: string;
  Malz5: string;
  Malz5_Menge: number;
  Malz5_Einheit: string;
  Malz6: string;
  Malz6_Menge: number;
  Malz6_Einheit: string;
  Maischform: string;
  Infusion_Hauptguss: number;
  Infusion_Einmaischtemperatur: number;
  Infusion_Rasttemperatur1: string;
  Infusion_Rastzeit1: string;
  Abmaischtemperatur: string;
  Nachguss: number;
  Kochzeit_Wuerze: number;
  Hopfen_VWH_1_Sorte: string;
  Hopfen_VWH_1_Menge: number;
  Hopfen_VWH_1_alpha: number;
  Hopfen_1_Sorte: string;
  Hopfen_1_Menge: number;
  Hopfen_1_alpha: number;
  Hopfen_1_Kochzeit: number;
  Hopfen_2_Sorte: string;
  Hopfen_2_Menge: number;
  Hopfen_2_alpha: number;
  Hopfen_2_Kochzeit: number;
  Hopfen_3_Sorte: string;
  Hopfen_3_Menge: number;
  Hopfen_3_alpha: number;
  Hopfen_3_Kochzeit: number;
  Hopfen_4_Sorte: string;
  Hopfen_4_Menge: number;
  Hopfen_4_alpha: number;
  Hopfen_4_Kochzeit: number;
  Hopfen_5_Menge: number;
  Hopfen_5_alpha: number;
  Hopfen_5_Kochzeit: number;
  Hopfen_6_Menge: number;
  Hopfen_6_alpha: number;
  Hopfen_6_Kochzeit: number;
  Stopfhopfen_1_Sorte: string;
  Stopfhopfen_1_Menge: number;
  Stopfhopfen_2_Sorte: string;
  Stopfhopfen_2_Menge: number;
  Stopfhopfen_3_Sorte: string;
  Stopfhopfen_3_Menge: number;
  Stopfhopfen_4_Sorte: string;
  Stopfhopfen_4_Menge: number;
  Stopfhopfen_5_Sorte: string;
  Stopfhopfen_5_Menge: number;
  Stopfhopfen_6_Sorte: string;
  Stopfhopfen_6_Menge: number;
  Hefe: string;
  Gaertemperatur: string;
  Endvergaerungsgrad: string;
  Karbonisierung: string;
  WeitereZutat_Gaerung_1_Name: string;
  WeitereZutat_Gaerung_1_Menge: number;
  WeitereZutat_Gaerung_1_Einheit: string;
  WeitereZutat_Gaerung_2_Name: string;
  WeitereZutat_Gaerung_2_Menge: number;
  WeitereZutat_Gaerung_2_Einheit: string;
  WeitereZutat_Gaerung_3_Name: string;
  WeitereZutat_Gaerung_3_Menge: number;
  WeitereZutat_Gaerung_3_Einheit: string;
  WeitereZutat_Gaerung_4_Name: string;
  WeitereZutat_Gaerung_4_Menge: number;
  WeitereZutat_Gaerung_4_Einheit: string;
  WeitereZutat_Gaerung_5_Name: string;
  WeitereZutat_Gaerung_5_Menge: number;
  WeitereZutat_Gaerung_5_Einheit: string;
  WeitereZutat_Gaerung_6_Name: string;
  WeitereZutat_Gaerung_6_Menge: number;
  WeitereZutat_Gaerung_6_Einheit: string;
  WeitereZutat_Wuerze_1_Name: string;
  WeitereZutat_Wuerze_1_Menge: number;
  WeitereZutat_Wuerze_1_Einheit: string;
  WeitereZutat_Wuerze_2_Name: string;
  WeitereZutat_Wuerze_2_Menge: number;
  WeitereZutat_Wuerze_2_Einheit: string;
  WeitereZutat_Wuerze_3_Name: string;
  WeitereZutat_Wuerze_3_Menge: number;
  WeitereZutat_Wuerze_3_Einheit: string;
  WeitereZutat_Wuerze_4_Name: string;
  WeitereZutat_Wuerze_4_Menge: number;
  WeitereZutat_Wuerze_4_Einheit: string;
  WeitereZutat_Wuerze_5_Name: string;
  WeitereZutat_Wuerze_5_Menge: number;
  WeitereZutat_Wuerze_5_Einheit: string;
  WeitereZutat_Wuerze_6_Name: string;
  WeitereZutat_Wuerze_6_Menge: number;
  WeitereZutat_Wuerze_6_Einheit: string;
}

export interface MMuM_V2 {
  Anmerkung_Autor: string | undefined;
  Rezeptquelle: string;
  ExportVersion: string;
  Name: string;
  Datum: string;
  Sorte: string;
  Autor: string;
  Ausschlagwuerze: number;
  Sudhausausbeute: number;
  Stammwuerze: number;
  Bittere: number;
  Farbe: number;
  Alkohol: number;
  Kurzbeschreibung: string;
  Malze: Array<{
    Name: string;
    Menge: number;
    Einheit: string;
  }>;
  Maischform: string;
  Hauptguss: number;
  Einmaischtemperatur: number;
  Rasten: Array<{
    Temperatur: number;
    Zeit: number;
  }>;
  Abmaischtemperatur: number;
  Nachguss: number;
  Kochzeit_Wuerze: number;
  Hopfenkochen: Array<{
    Sorte: string;
    Menge: number;
    Alpha: number;
    Zeit: number;
    Typ: string;
  }>;
  Stopfhopfen: Array<{
    Sorte: string;
    Menge: number;
  }>;
  Hefe: string;
  Gaertemperatur: string;
  Endvergaerungsgrad: number;
  Karbonisierung: number;
  WeitereZutatGaerung: Array<{
    Name: string;
    Menge: number;
    Einheit: string;
  }>;
  Gewuerze_etc: Array<{
    Name: string;
    Menge: number;
    Einheit: string;
    Kochzeit: number;
  }>;
  Dekoktionen: Array<{
    Volumen: number;
    Rastzeit: number;
    Temperatur_ist: number;
    Temperatur_resultierend: number;
    Form: string;
    Teilmaische_Rastzeit: number;
    Teilmaische_Kochzeit: number;
    Teilmaische_Temperatur: number;
  }>;
}
