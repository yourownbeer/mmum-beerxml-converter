// http://www.beerxml.com/beerxml.htm

interface BeerXML {
    NAME: string;
    VERSION: number;
    TYPE: 'extract' | 'partial mas' | 'all grain';
    STYLE: BeerXMLStyle;
    BREWER: string;
    ASST_BREWER?: string;
    BATCH_SIZE: number; // Volume (liters)
    BOIL_SIZE: number; // Volume (liters)
    BOIL_TIME: number; // Minutes
    EFFICIENCY: number; // Percent
    ALPHA: number;
    AMOUNT: number;
    HOPS: BeerXMLHop[];
    FERMENTABLES: BeerXMLFermentable[];
    MISCS: BeerXMLMisc[];
    YEASTS: BeerXMLYeast[];
    MASH: BeerXMLMash;
    NOTES?: string;
    TASTE_NOTES?: string;
    TASTE_RATING?: number;
    OG: number;
    FG: number;
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
}

interface BeerXMLHop {
    NAME: string;
    VERSION: number;
    ALPHA: number;
    AMOUNT: number;
    USE: 'Boil' | 'Dry Hop' | 'Mash' | 'First Wort' | 'Aroma';
    TIME: number; // minutes
    NOTES?: string;
    TYPE?: 'Bittering' | 'Aroma' | 'Both';
    FORM?: 'Pellet' | 'Plug' | 'Leaf';
    BETA?: number; // Percentage
    HSI?: number; // Percentage
    ORIGIN?: string;
    SUBSTITUTES?: string;
    HUMULENE?: number;
    CARYOPHYLLENE?: number;
    COHUMULONE?: number;
    MYRCENE?: number;
}

interface BeerXMLFermentable {
    NAME: string;
    VERSION: number;
    AMOUNT: number; // Weight (kg)
    TYPE: string[];
    YIELD: number; // Percent
    COLOR: number; // Floating Point
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
}

interface BeerXMLYeast {
    NAME: string;
    VERSION: number;
    TYPE: 'ale' | 'lager' | 'wheat' | 'wine' | 'champagne';
    FORM: 'liquid' | 'dry' | 'slant' | 'culture';
    AMOUNT: number; // Volume (liters) or Weight (kg)
    AMOUNT_IS_WEIGHT?: boolean;
    LABORATORY?: string;
    PRODUCT_ID?: string;
    MIN_TEMPERATURE?: number; // Temperatur (C)
    MAX_TEMPERATURE?: number; // Temperatur (C)
    FLOCCULATION?: 'low' | 'medium' | 'high' | 'very high';
    ATTENUATION?: number; // Percent
    NOTES?: string;
    BEST_FOR?: string;
    TIMES_CULTURED?: number;
    MAX_REUSE?: number;
    ADD_TO_SECONDARY?: boolean;
}

interface BeerXMLMisc {
    NAME: string;
    VERSION: number;
    TYPE: 'spice' | 'fining' | 'water agent' | 'herb' | 'flavor' | 'other';
    USE: 'Boil' | 'Mash' | 'Primary' | 'Secondary' | 'Bottling';
    TIME: number; // Minutes
    AMOUNT: number; // Weight (kg) or Volume (liters)
    AMOUNT_IS_WEIGHT?: boolean;
    USE_FOR?: string;
    NOTES?: string;
}

interface BeerXMLMash {
    NAME: string;
    VERSION: number;
    GRAIN_TEMP: number; // Temperature (C)
    MASH_STEPS: BeerXMLMashStep[];
    NOTES?: string;
    TUN_TEMP?: number; // Temperature (C)
    SPARGE_TEMP?: number; // Temperature (C)
    PH?: number;
    TUN_WEIGHT?: number; // Weight (kg)
    TUN_SPECIFIC_HEAT?: number;
    EQUIP_ADJUST?: boolean;
}

interface BeerXMLMashStep {
    NAME: string;
    VERSION: number;
    TYPE: 'Infusion' | 'Temperature' | 'Decoction';
    INFUSE_AMOUNT?: number; // Volume (liters)
    STEP_TIME?: number; // Minutes
    STEP_TEMP?: number; // Temperature (C)
    RAMP_TIME?: number; // Minutes
    END_TEMP?: number; // Temperature (C)
}

interface BeerXMLStyle {
    NAME: string;
    CATEGORY: string;
    VERSION: number;
    CATEGORY_NUMBER: number;
    STYLE_LETTER: string;
    STYLE_GUIDE: string;
    TYPE: 'lager' | 'ale' | 'mead' | 'wheat' | 'mixed' | 'cider';
    OG_MIN: number;
    OG_MAX: number;
    FG_MIN: number;
    FG_MAX: number;
    IBU_MIN: number;
    IBU_MAX: number;
    COLOR_MIN: number;
    COLOR_MAX: number;
    CARB_MIN: number;
    CARB_MAX: number;
    ABV_MIN: number;
    ABV_MAX: number;
    NOTES?: string;
    PROFILE?: string;
    INGREDIENTS?: string;
    EXAMPLES?: string;
}
