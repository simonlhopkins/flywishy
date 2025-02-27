import csv from "csv-parser";
import fs from "fs";
import { CityData } from "sharedTypes/CityData";

const results: any[] = [];
fs.createReadStream("./tools/worldcities.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    createFilteredList(results);
  });

function createFilteredList(results: CityData[]) {
  const cityMap = new Map<string, CityData[]>();
  // const final = results.slice(5000, 5050);
  results.slice(0, 100).forEach((cityData) => {
    if (!cityMap.has(cityData.country)) {
      cityMap.set(cityData.country, []);
    }
    const cityArr = cityMap.get(cityData.country)!;
    if (cityArr.length < 3) {
      cityArr.push(cityData);
    }
  });
  const final = Array.from(cityMap.values()).flat();
  console.log("generated " + final.length + " cities");
  fs.writeFile("./public/cities.json", JSON.stringify(final), "utf8", () => {});
}
