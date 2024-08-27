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
      message: "Case validated successfully",
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
      message: "Case validated successfully",
    };
  } catch (err) {
    console.error(err);

    throw new Error("Failed to validate broken object level auth case");
  }
};

export const validateBrokenAuthentication = async (
  app: ApplicationDoc,
  api: APIDoc,
  ruleConfig: SecurityConfigurationDoc["rules"],
  successRuleConfig: SecurityConfigurationDoc["rules"],
  tokens: Record<string, string>,
  users: Record<string, any>
): Promise<ScanResult> => {
  try {
    const emptyTokens = Object.keys(tokens).reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {} as Record<string, string>);
    const url = app.baseUrl + api.endpoint;
    const headers = populateData(ruleConfig.headers, "", emptyTokens, users);
    const params = populateData(ruleConfig.params, "", emptyTokens, users);
    const body = populateData(ruleConfig.body, "", emptyTokens, users);

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

    // try with dummy token
    const dummyTokens = Object.keys(tokens).reduce((acc, key) => {
      acc[key] = Math.random().toString(36).substring(2);
      return acc;
    }, {} as Record<string, string>);

    const dummyHeaders = populateData(
      ruleConfig.headers,
      "",
      dummyTokens,
      users
    );
    const dummyParams = populateData(ruleConfig.params, "", dummyTokens, users);
    const dummyBody = populateData(ruleConfig.body, "", dummyTokens, users);

    const dummyResponse = await axios.request({
      method: api.method.toLowerCase(),
      url,
      headers: dummyHeaders,
      params: dummyParams,
      data: dummyBody,
      validateStatus: () => true,
    });

    const dummyResponseCode = dummyResponse.status;

    if (dummyResponseCode !== expectedCode) {
      if (
        dummyResponseCode === expectedSuccessCode ||
        Math.floor(dummyResponseCode / 100) === 2
      ) {
        return {
          success: false,
          message: `Expected status code ${expectedCode}, got ${dummyResponseCode}`,
          severity: "HIGH",
        };
      } else {
        return {
          success: false,
          message: `Expected status code ${expectedCode}, got ${dummyResponseCode}`,
          severity: "LOW",
        };
      }
    }

    return {
      success: true,
      message: "Case validated successfully",
    };
  } catch (err) {
    console.error(err);

    throw new Error("Failed to validate broken authentication case");
  }
};

export const validateBrokenObjectPropertyLevelAuthorization = async (
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
      message: "Case validated successfully",
    };
  } catch (err) {
    console.error(err);

    throw new Error(
      "Failed to validate broken object property level auth case"
    );
  }
};

export const validateBrokenFunctionLevelAuthorization = async (
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
      message: "Case validated successfully",
    };
  } catch (err) {
    console.error(err);

    throw new Error("Failed to validate broken function level auth case");
  }
};

export const validateUnrestrictedResourceConsumption = async (
  app: ApplicationDoc,
  api: APIDoc,
  ruleConfig: SecurityConfigurationDoc["rules"],
  successRuleConfig: SecurityConfigurationDoc["rules"],
  tokens: Record<string, string>,
  users: Record<string, any>
): Promise<ScanResult> => {
  try {
    const url = app.baseUrl + api.endpoint;
    const headers = populateData(successRuleConfig.headers, "", tokens, users);
    const params = populateData(successRuleConfig.params, "", tokens, users);
    const body = populateData(successRuleConfig.body, "", tokens, users);

    // Validate req size by adding dummy limit + 1 bytes
    const payloadLimit = ruleConfig.limits.payload;
    const time = Date.now();
    const excessPayload = {
      ...(body || {}),
      [`dummy_${time}`]: "a".repeat(payloadLimit + 1),
    };
    const responseExcessPayload = await axios.request({
      method: api.method.toLowerCase(),
      url,
      headers: {
        ...(headers || {}),
      },
      params,
      data: excessPayload,
      validateStatus: () => true,
    });

    // It should have status 413
    if (responseExcessPayload.status !== 413) {
      return {
        success: false,
        message: "Payload limit not enforced",
        severity: "HIGH",
      };
    }

    // Validate rate limit by sending limit + 1 requests at once
    const rateLimit = ruleConfig.limits.rate;

    const responsesRateLimit = await Promise.all(
      Array.from({ length: rateLimit + 1 }).map(() =>
        axios.request({
          method: api.method.toLowerCase(),
          url,
          headers,
          params,
          data: body,
          validateStatus: () => true,
        })
      )
    );

    // It should have at least one response with status 429
    const rateLimitResponse = responsesRateLimit.find(
      (res) => res.status === 429
    );

    if (!rateLimitResponse) {
      return {
        success: false,
        message: "Rate limit not enforced",
        severity: "HIGH",
      };
    }

    return {
      success: true,
      message: "Case validated successfully",
    };
  } catch (err) {
    console.error(err);

    throw new Error(
      "Failed to validate unrestricted resource consumption case"
    );
  }
};
