import mongoose from "mongoose";
import API from "../arsenal/models/api";
import Application from "../arsenal/models/application";
import Scan from "../arsenal/models/scan";
import { ScanAppRequest, ScanAppResponse } from "../types/proto";
import { scoutAPI } from "./apiScout";
import SecurityConfiguration from "../arsenal/models/security-conf";
import { SecurityConfigType } from "../arsenal/types/security-conf";

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

    // const apiData = await API.create({
    //   appId,
    //   endpoint: "/api/v1/test/render-avatar",
    //   method: "GET",
    //   isVerified: true,
    //   isDeprecated: false,
    // });

    // await SecurityConfiguration.create({
    //   apiId: apiData,
    //   configType: SecurityConfigType.SUCCESS_FLOW,
    //   isEnabled: true,
    //   rules: {
    //     params: {
    //       url: "https://api.dicebear.com/8.x/adventurer/svg?seed={{regex:[a-z0-9]{10}}}",
    //     },
    //     expectations: {
    //       code: 200,
    //     },
    //   },
    // });

    // await SecurityConfiguration.create({
    //   apiId: apiData,
    //   configType: SecurityConfigType.SERVER_SIDE_REQUEST_FORGERY,
    //   isEnabled: true,
    //   rules: {
    //     params: {
    //       url: "https://{{regex:[a-z0-9]{10}}}.api.dicebear.com/8.x/adventurer/svg?seed=123",
    //     },
    //     expectations: {
    //       code: 400,
    //     },
    //   },
    // });

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
