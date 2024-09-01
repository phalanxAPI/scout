import mongoose from "mongoose";
import API from "../arsenal/models/api";
import Application from "../arsenal/models/application";
import Scan from "../arsenal/models/scan";
import { ScanAppRequest, ScanAppResponse } from "../types/proto";
import { scoutAPI } from "./api-scout";
import cron from "node-cron";

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
      .filter((item) => item.isVerified)
      .map((api) => `- \`${api._id}\` => ${api.method} ${api.endpoint}`)
      .join("\n");

    const scan = await Scan.create({
      appId: new mongoose.Types.ObjectId(appId),
      scanDate: new Date(),
      outputSummary,
    });

    try {
      outputSummary += `\n\n\n## Results:`;
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

export const autoScout = () => {
  const task = async () => {
    try {
      const allApps = await Application.find();
      for (const app of allApps) {
        try {
          await scoutApp({ appId: app._id.toString() });
          console.log("SUCCESSFULLY SCOUTED APP", app._id);
        } catch (err) {
          console.error("ERROR SCOUTING APP", app._id, err);
        }
      }
      console.log("SUCCESSFULLY SCOUTED ALL APPS");
    } catch (err) {
      console.error("ERROR SCOUTING APPS", err);
    }
  };

  cron.schedule("*/30 * * * *", task);
};
