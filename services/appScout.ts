import mongoose from "mongoose";
import API from "../arsenal/models/api";
import Application from "../arsenal/models/application";
import Scan from "../arsenal/models/scan";
import { ScanAppRequest, ScanAppResponse } from "../types/proto";
import { scoutAPI } from "./apiScout";

export const scoutApp = async (
  data: ScanAppRequest
): Promise<ScanAppResponse> => {
  const appId = data.appId;
  let scanId = "";

  try {
    const appData = await Application.findById(appId);
    if (!appData) {
      throw new Error("Application not found");
    }

    const apis = await API.find({ appId });

    let outputSummary = `## Scanned APIs: \n\n`;
    outputSummary += apis
      .map((api) => `- \`${api._id}\` => ${api.method}${api.endpoint}`)
      .join("\n");

    const scan = await Scan.create({
      appId: new mongoose.Types.ObjectId(appId),
      scanDate: new Date(),
      outputSummary,
    });

    try {
      outputSummary += `\n\n\n##Results:`;
      await Promise.all(
        apis.map(async (api) => {
          const output = await scoutAPI(api, appData);

          outputSummary += `\n\n- API: \`${api._id}\`\n${output}`;
        })
      );
    } catch (err) {
      console.error(err);
      throw new Error("Scout break time");
    }

    await Scan.updateOne(
      { _id: scan._id },
      { outputSummary, status: "COMPLETED" }
    );

    return { scanId: scan._id.toString() };
  } catch (err) {
    console.error(err);

    if (scanId) {
      try {
        await Scan.updateOne({ _id: scanId }, { status: "FAILED" });
      } catch (err) {
        console.error(err);
      }
    }
    throw new Error("Scout RIP");
  }
};
