import fs from 'fs';
import { XMLBuilder } from 'fast-xml-parser';

const MMUM_FILES_PATH = './src/example';
// read MMuM json file
const data = fs.readFileSync('./src/example/Bavarian_IPA.json');
const mmum = JSON.parse(data.toString());

// calculators
const calculateOG = (stammwuerze: number) =>
    1 + stammwuerze / (258.6 - (stammwuerze / 258.2) * 227.1);

const fermentableEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes('Malz')
);
const amountOfFermentables = fermentableEntries.length / 3;
const fermentables = [];
for (let i = 1; i <= amountOfFermentables; i++) {
    fermentables.push({
        FERMENTABLE: {
            NAME: mmum[`Malz${i}`],
            AMOUNT: mmum[`Malz${i}_Menge`],
        },
    });
}

const miscEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes('WeitereZutat')
);
const miscGaerungEntries = miscEntries.filter((entryName) =>
    entryName.includes('Gaerung')
);
const miscWuerzeEntries = miscEntries.filter((entryName) =>
    entryName.includes('Wuerze')
);

const amountOGaerungfMisc = miscGaerungEntries.length / 3;
const gaerungMiscs = [];
for (let i = 1; i <= amountOGaerungfMisc; i++) {
    gaerungMiscs.push({
        MISC: {
            NAME: mmum[`WeitereZutat_Gaerung_${i}_Name`],
            AMOUNT: mmum[`WeitereZutat_Gaerung_${i}_Menge`],
            USE: 'Primary',
            TIME: mmum[`WeitereZutat_Gaerung_${i}_Einheit`],
        },
    });
}

const amountWuerzeMisc = miscWuerzeEntries.length / 3;
const wuerzeMiscs = [];
for (let i = 1; i <= amountWuerzeMisc; i++) {
    wuerzeMiscs.push({
        MISC: {
            NAME: mmum[`WeitereZutat_Wuerze_${i}_Name`],
            AMOUNT: mmum[`WeitereZutat_Wuerze_${i}_Menge`],
            USE: 'Boil',
            TIME: mmum[`WeitereZutat_Wuerze_${i}_Einheit`],
        },
    });
}

const hopEntries = Object.keys(mmum).filter((entryName) =>
    entryName.toLowerCase().includes('hopfen')
);

const vwhHopEntries = hopEntries.filter((entryName) =>
    entryName.includes('VWH')
);
const amountOfVwhHops = vwhHopEntries.length / 3;

const vwhHops = [];
for (let i = 1; i <= amountOfVwhHops; i++) {
    vwhHops.push({
        HOP: {
            NAME: mmum[`Hopfen_VWH_${i}_Sorte`],
            AMOUNT: mmum[`Hopfen_VWH_${i}_Menge`],
            ALPHA: mmum[`Hopfen_VWH_${i}_alpha`],
            USE: 'First Wort',
        },
    });
}

const usualHopEntries = hopEntries.filter((entryName) =>
    entryName.includes('Hopfen_')
);
const amountOfUsualHops = usualHopEntries.length / 4;
const usualHops = [];
for (let i = 1; i <= amountOfUsualHops; i++) {
    usualHops.push({
        HOP: {
            NAME: mmum[`Hopfen_${i}_Sorte`],
            AMOUNT: mmum[`Hopfen_${i}_Menge`],
            ALPHA: mmum[`Hopfen_${i}_alpha`],
            TIME: mmum[`Hopfen_${i}_Kochzeit`],
        },
    });
}

const dryHopEntries = hopEntries.filter((entryName) =>
    entryName.includes('Stopfhopfen_')
);
const amountOfDryHops = dryHopEntries.length / 2;
const dryHops = [];
for (let i = 1; i <= amountOfDryHops; i++) {
    dryHops.push({
        HOP: {
            NAME: mmum[`Stopfhopfen_${i}_Sorte`],
            AMOUNT: mmum[`Stopfhopfen_${i}_Menge`],
            USE: 'Dry Hop',
        },
    });
}

const decoctionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes('Dekoktion')
);
const amountOfDecoctionMashSteps = decoctionMashStepEntries.length / 2;
const decoctionMashSteps = [];
for (let i = 0; i < amountOfDecoctionMashSteps; i++) {
    decoctionMashSteps.push({
        MASH_STEP: {
            TYPE: 'Decoction',
            INFUSE_AMOUNT: mmum[`Dekoktion_${i}_Volumen`],
            STEP_TIME: mmum[`Dekoktion_${i}_Rastzeit`],
            STEP_TEMP: mmum[`Dekoktion_${i}_Tempratur_ist`],
            END_TEMP: mmum[`Dekoktion_${i}_Temperatur_resultierend`],
        },
    });
}

const infusionMashStepEntries = Object.keys(mmum).filter((entryName) =>
    entryName.includes('Infusion_Rast')
);
const amountOfInfusionMashSteps = infusionMashStepEntries.length / 2;
const infusionMashSteps = [];
for (let i = 1; i <= amountOfInfusionMashSteps; i++) {
    infusionMashSteps.push({
        MASH_STEP: {
            TYPE: 'Infusion',
            TEMP: mmum[`Infusion_Rasttemperatur${i}`],
            STEP_TIME: mmum[`Infusion_Rastzeit${i}`],
        },
    });
}

const endMashStep = {
    MASH_STEP: {
        TYPE: 'Temperature',
        STEP_TIME: 0,
        STEP_TEMP: mmum['Abmaischtemperatur'],
    },
};

// create beer xml object
const beerxml_json = {
    RECIPES: {
        RECIPE: {
            NAME: mmum.Name,
            DATE: mmum.Datum,
            STYLE: {
                NAME: mmum.Sorte,
            },
            VERSION: 1, // always set to 1
            BREWER: mmum.Autor,
            BATCH_SIZE: mmum.Ausschlagwuerze,
            BOIL_SIZE: mmum.Infusion_Hauptguss,
            EFFICIENCY: mmum.Sudhausausbeute,
            ABV: mmum.Alkohol,
            EST_COLOR: mmum.Farbe,
            TASTE_NOTES: mmum.Kurzbeschreibung, // laut php code, vielleicht doch NOTES?
            NOTES: mmum.Anmerkung_Autor,
            CARBONATION: mmum.Karbonisierung,
            IBU: mmum.Bittere,
            OG: calculateOG(mmum.Stammwuerze),
            FERMENTABLES: fermentables,
            MISCS: { ...wuerzeMiscs, ...gaerungMiscs },
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
            YEASTS: {
                YEAST: {
                    NAME: mmum.Hefe,
                    MIN_TEMPERATURE: mmum.Gaertemperatur.split('-')[0],
                    MAX_TEMPERATURE: mmum.Gaertemperatur.split('-')[1],
                    ATTENUATION: mmum.Endvergaerungsgrad,
                },
            },
        },
    },
};

// build xml
const builder = new XMLBuilder({ oneListGroup: true, format: true });
const beerxml = builder.build(beerxml_json);

fs.writeFileSync('./src/example/output/Bavarian_IPA.xml', beerxml, 'utf8');
