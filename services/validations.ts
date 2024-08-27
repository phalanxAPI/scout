import axios from "axios";
import { APIDoc } from "../arsenal/models/api";
import { ApplicationDoc } from "../arsenal/models/application";
import { SecurityConfigurationDoc } from "../arsenal/models/security-conf";
import { populateData } from "./population";

export type ScanResult = {
  success: boolean;
  message: string;
  severity?: "HIGH" | "LOW";
};

export const validateSuccessCase = async (
  app: ApplicationDoc,
  api: APIDoc,
  ruleConfig: SecurityConfigurationDoc["rules"],
  tokens: Record<string, string>,
  users: Record<string, any>
): Promise<ScanResult> => {
  try {
    const url = app.baseUrl + api.endpoint;
    const headers = populateData(ruleConfig.headers, "", tokens, users);
    const params = populateData(ruleConfig.params, "", tokens, users);
    const body = populateData(ruleConfig.body, "", tokens, users);

    console.log("URL: ", url);
    console.log("Headers: ", headers);
    console.log("Params: ", params);
    console.log("Body: ", body);

    const response = await axios.request({
      method: api.method.toLowerCase(),
      url,
      headers,
      params,
      data: body,
      validateStatus: () => true,
    });

    // verify expectations
    const expectedCode = ruleConfig.expectations.code;
    const responseCode = response.status;

    if (expectedCode !== responseCode) {
      return {
        success: false,
        message: `Expected status code ${expectedCode}, got ${responseCode}`,
        severity: "HIGH",
      };
    }

    return {
      success: true,
      message: "Success case validated",
    };
  } catch (err) {
    console.error(err);

    throw new Error("Failed to validate success case");
  }
};

export const validateObjectLevelAuth = async (
  app: ApplicationDoc,
  api: APIDoc,
  ruleConfig: SecurityConfigurationDoc["rules"],
  successRuleConfig: SecurityConfigurationDoc["rules"],
  tokens: Record<string, string>,
  users: Record<string, any>
): Promise<ScanResult> => {
  try {
    const url = app.baseUrl + api.endpoint;
    const headers = populateData(ruleConfig.headers, "", tokens, users);
    const params = populateData(ruleConfig.params, "", tokens, users);
    const body = populateData(ruleConfig.body, "", tokens, users);

    console.log("URL: ", url);
    console.log("Headers: ", headers);
    console.log("Params: ", params);
    console.log("Body: ", body);

    const response = await axios.request({
      method: api.method.toLowerCase(),
      url,
      headers,
      params,
      data: body,
      validateStatus: () => true,
    });

    // verify expectations
    const expectedCode = ruleConfig.expectations.code;
    const expectedSuccessCode = successRuleConfig?.expectations?.code;
    const responseCode = response.status;

    if (expectedCode !== responseCode) {
      if (
        responseCode === expectedSuccessCode ||
        Math.floor(responseCode / 100) === 2
      ) {
        return {
          success: false,
          message: `Expected status code ${expectedCode}, got ${responseCode}`,
          severity: "HIGH",
        };
      } else {
        return {
          success: false,
          message: `Expected status code ${expectedCode}, got ${responseCode}`,
          severity: "LOW",
        };
      }
    }

    return {
      success: true,
      message: "Success case validated",
    };
  } catch (err) {
    console.error(err);

    throw new Error("Failed to validate success case");
  }
};
