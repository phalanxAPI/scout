import { APIDoc } from "../arsenal/models/api";
import { ApplicationDoc } from "../arsenal/models/application";
import SecurityConfiguration from "../arsenal/models/security-conf";
import { fetchTokens } from "./tokens";

export const scoutAPI = async (api: APIDoc, app: ApplicationDoc) => {
  try {
    const tokens = fetchTokens(app);
    console.log(tokens);
    const apiRules = await SecurityConfiguration.find({ apiId: api });
    console.log(apiRules);
    return `Scouted API: ${api._id}`;
  } catch (err) {
    console.error(err);
  }
};
