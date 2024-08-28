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

export const validateUnrestrictedAccessToSensitiveBusinessFlow = async (
  app: ApplicationDoc,
  api: APIDoc,
  ruleConfig: SecurityConfigurationDoc["rules"],
  successRuleConfig: SecurityConfigurationDoc["rules"],
  tokens: Record<string, string>,
  users: Record<string, any>
): Promise<ScanResult> => {
  try {
    // Limit of requests that can be made with same payload
    let limit = ruleConfig.limit;

    const url = app.baseUrl + api.endpoint;
    const headers = populateData(successRuleConfig.headers, "", tokens, users);
    const params = populateData(successRuleConfig.params, "", tokens, users);
    const body = populateData(successRuleConfig.body, "", tokens, users);

    for (let i = 0; i <= limit; i++) {
      const response = await axios.request({
        method: api.method.toLowerCase(),
        url,
        headers,
        params,
        data: body,
        validateStatus: () => true,
      });

      // verify expectations
      const expectedSuccessCode = successRuleConfig?.expectations?.code;
      const responseCode = response.status;

      if (i === limit) {
        const expectedCode = ruleConfig.expectations.code;
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
      } else {
        if (responseCode !== expectedSuccessCode) {
          return {
            success: false,
            message: `Expected status code ${expectedSuccessCode}, got ${responseCode}`,
            severity: "HIGH",
          };
        }
      }
    }

    return {
      success: true,
      message: "Case validated successfully",
    };
  } catch (err) {
    console.error(err);

    throw new Error(
      "Failed to validate unrestricted access to sensitive business flow case"
    );
  }
};

export const validateSecurityMisconfiguration = async (
  app: ApplicationDoc,
  api: APIDoc,
  successRuleConfig: SecurityConfigurationDoc["rules"],
  tokens: Record<string, string>,
  users: Record<string, any>
): Promise<ScanResult> => {
  try {
    const url = app.baseUrl + api.endpoint;
    const headers = populateData(successRuleConfig.headers, "", tokens, users);
    const params = populateData(successRuleConfig.params, "", tokens, users);
    const body = populateData(successRuleConfig.body, "", tokens, users);

    const response = await axios.request({
      method: api.method.toLowerCase(),
      url,
      headers,
      params,
      data: body,
      validateStatus: () => true,
    });

    const responseHeaders = response.headers;
    const issues: string[] = [];

    // 1. Check for important security headers
    const securityHeaders = [
      {
        name: "X-XSS-Protection",
        expectedValue: "0",
        required: false,
      },
      { name: "X-Frame-Options", expectedValue: "SAMEORIGIN" },
      { name: "X-Content-Type-Options", expectedValue: "nosniff" },
      {
        name: "Referrer-Policy",
        expectedValue: "strict-origin-when-cross-origin",
      },
      { name: "Content-Security-Policy", required: false },
      { name: "Strict-Transport-Security", required: false },
      { name: "Feature-Policy", required: false },
      { name: "Permissions-Policy", required: false },
      { name: "Expect-CT", required: false },
      { name: "X-Permitted-Cross-Domain-Policies", expectedValue: "none" },
    ];

    for (const header of securityHeaders) {
      const headerValue = responseHeaders[header.name.toLowerCase()];
      if (!headerValue && header.required !== false) {
        issues.push(`Missing header: ${header.name}`);
      } else if (
        headerValue &&
        header.expectedValue &&
        headerValue !== header.expectedValue
      ) {
        issues.push(
          `Incorrect header: ${header.name} (expected: ${header.expectedValue}, got: ${headerValue})`
        );
      }
    }

    // 2. Check cookie security
    const cookieHeader = responseHeaders["set-cookie"];
    if (cookieHeader) {
      if (!cookieHeader.includes("Secure"))
        issues.push("Cookie missing 'Secure' flag");
      if (!cookieHeader.includes("HttpOnly"))
        issues.push("Cookie missing 'HttpOnly' flag");
      if (!cookieHeader.includes("SameSite"))
        issues.push("Cookie missing 'SameSite' attribute");
    }

    // 3. Check CORS configuration
    const corsHeader = responseHeaders["access-control-allow-origin"];
    if (corsHeader === "*") issues.push("CORS allows all origins");

    // 4. Check Cache-Control
    const cacheControl = responseHeaders["cache-control"];
    if (!cacheControl || !cacheControl.includes("no-store")) {
      issues.push("Cache-Control header missing or not set to 'no-store'");
    }

    // 5. Check for server information disclosure
    const serverHeader = responseHeaders["server"];
    if (serverHeader && /\d/.test(serverHeader)) {
      issues.push("Server header exposes version information");
    }

    // 6. Check for detailed error messages (this is a basic check, might need adjustments)
    if (
      response.status >= 400 &&
      response.data &&
      typeof response.data === "string" &&
      response.data.length > 100
    ) {
      issues.push("Possible detailed error message exposure");
    }

    // 7. Check allowed HTTP methods (requires additional OPTIONS request)
    const optionsResponse = await axios.options(url, {
      validateStatus: () => true,
    });
    const allowedMethods = optionsResponse.headers["allow"] || "";
    const unnecessaryMethods = ["TRACE", "TRACK", "CONNECT"];
    for (const method of unnecessaryMethods) {
      if (allowedMethods.includes(method)) {
        issues.push(`Unnecessary HTTP method allowed: ${method}`);
      }
    }

    // 8. SSL/TLS Configuration (basic check, might need a more sophisticated approach)
    if (!url.startsWith("https://")) {
      issues.push("Not using HTTPS");
    }

    if (issues.length > 0) {
      return {
        success: false,
        message: "Security misconfigurations detected:\n" + issues.join("\n"),
        severity: "HIGH",
      };
    }

    return {
      success: true,
      message: "No security misconfigurations detected",
    };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to validate security configuration");
  }
};
