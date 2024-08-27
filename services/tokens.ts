import axios from "axios";
import { ApplicationDoc } from "../arsenal/models/application";
import SecurityConfiguration from "../arsenal/models/security-conf";
import { SecurityConfigType } from "../arsenal/types/security-conf";
import { populateData } from "./population";

export const fetchTokens = async (app: ApplicationDoc) => {
  try {
    const tokensConfig = await SecurityConfiguration.findOne({
      apiId: app,
      configType: SecurityConfigType.AUTH_TOKENS,
    });

    const API_URL = app.baseUrl + tokensConfig?.rules?.endpoint;
    const headers = populateData(
      tokensConfig?.rules?.headers,
      // *This will be based on app
      process.env.PHALANX_SHARED_SECRET,
      {},
      {}
    );

    const { data } = await axios.get(API_URL, {
      headers,
    });

    return data;
  } catch (err) {
    console.error(err);
  }
};
