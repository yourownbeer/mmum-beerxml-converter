import { MMuM_V1, BeerXML, MMuM_V2 } from "./type";
// import * as fs from "fs";
// import { XMLBuilder } from "fast-xml-parser";
import { convertV1ToBeerXML } from "./convertV1ToBeerXML";
import { convertV2ToBeerXML } from "./convertV2ToBeerXML";

function convertMMuMToBeerXML(mmum: MMuM_V1 | MMuM_V2): BeerXML {
  if (mmum.ExportVersion === "2.0") {
    return convertV2ToBeerXML(mmum as MMuM_V2);
  } else {
    return convertV1ToBeerXML(mmum as MMuM_V1);
  }
}

export default convertMMuMToBeerXML;

// read MMuM json file
// const inputFolder = "./src/example/";
// const file = "Rezept";
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
