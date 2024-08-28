import { APIDoc } from "../arsenal/models/api";
import { ApplicationDoc } from "../arsenal/models/application";
import SecurityConfiguration from "../arsenal/models/security-conf";
import { SecurityConfigType } from "../arsenal/types/security-conf";
import { fetchTokens } from "./tokens";
import { fetchUsersData } from "./users";
import {
  ScanResult,
  validateBrokenAuthentication,
  validateBrokenFunctionLevelAuthorization,
  validateBrokenObjectPropertyLevelAuthorization,
  validateObjectLevelAuth,
  validateSecurityMisconfiguration,
  validateServerSideRequestForgery,
  validateSuccessCase,
  validateUnrestrictedAccessToSensitiveBusinessFlow,
  validateUnrestrictedResourceConsumption,
} from "./validations";

export const scoutAPI = async (api: APIDoc, app: ApplicationDoc) => {
  try {
    const [tokens, users] = await Promise.all([
      fetchTokens(app),
      fetchUsersData(app),
    ]);

    const apiRules = await SecurityConfiguration.find({ apiId: api });
    const typeWiseMap = apiRules.reduce((acc, rule) => {
      acc[rule.configType] = rule;
      return acc;
    }, {} as Record<string, SecurityConfiguration>);

    const outputs: {
      type: SecurityConfigType;
      result: ScanResult;
    }[] = [];

    const successFlow = typeWiseMap[SecurityConfigType.SUCCESS_FLOW];
    if (successFlow) {
      const successCaseValidation = await validateSuccessCase(
        app,
        api,
        successFlow.rules,
        tokens,
        users
      );

      outputs.push({
        type: SecurityConfigType.SUCCESS_FLOW,
        result: successCaseValidation,
      });
    }

    const brokenObjectLevelAuth =
      typeWiseMap[SecurityConfigType.BROKEN_OBJECT_LEVEL_AUTHORIZATION];
    if (brokenObjectLevelAuth) {
      const brokenObjectLevelAuthValidation = await validateObjectLevelAuth(
        app,
        api,
        brokenObjectLevelAuth.rules,
        successFlow?.rules,
        tokens,
        users
      );

      outputs.push({
        type: SecurityConfigType.BROKEN_OBJECT_LEVEL_AUTHORIZATION,
        result: brokenObjectLevelAuthValidation,
      });
    }

    const brokenAuthentication =
      typeWiseMap[SecurityConfigType.BROKEN_AUTHENTICATION];
    if (brokenAuthentication) {
      const brokenAuthenticationValidation = await validateBrokenAuthentication(
        app,
        api,
        brokenAuthentication.rules,
        successFlow?.rules,
        tokens,
        users
      );

      outputs.push({
        type: SecurityConfigType.BROKEN_AUTHENTICATION,
        result: brokenAuthenticationValidation,
      });
    }

    const brokenObjectPropertyLevelAuth =
      typeWiseMap[
        SecurityConfigType.BROKEN_OBJECT_PROPERTY_LEVEL_AUTHORIZATION
      ];
    if (brokenObjectPropertyLevelAuth) {
      const brokenObjectPropertyLevelAuthValidation =
        await validateBrokenObjectPropertyLevelAuthorization(
          app,
          api,
          brokenObjectPropertyLevelAuth.rules,
          successFlow?.rules,
          tokens,
          users
        );

      outputs.push({
        type: SecurityConfigType.BROKEN_OBJECT_PROPERTY_LEVEL_AUTHORIZATION,
        result: brokenObjectPropertyLevelAuthValidation,
      });
    }

    const brokenFunctionLevelAuth =
      typeWiseMap[SecurityConfigType.BROKEN_FUNCTION_LEVEL_AUTHORIZATION];
    if (brokenFunctionLevelAuth) {
      const brokenFunctionLevelAuthValidation =
        await validateBrokenFunctionLevelAuthorization(
          app,
          api,
          brokenFunctionLevelAuth.rules,
          successFlow?.rules,
          tokens,
          users
        );

      outputs.push({
        type: SecurityConfigType.BROKEN_FUNCTION_LEVEL_AUTHORIZATION,
        result: brokenFunctionLevelAuthValidation,
      });
    }

    const unrestrictedAccessToSensitiveBusinessFlow =
      typeWiseMap[
        SecurityConfigType.UNRESTRICTED_ACCESS_TO_SENSITIVE_BUSINESS_FLOW
      ];
    if (unrestrictedAccessToSensitiveBusinessFlow) {
      const unrestrictedAccessToSensitiveBusinessFlowValidation =
        await validateUnrestrictedAccessToSensitiveBusinessFlow(
          app,
          api,
          unrestrictedAccessToSensitiveBusinessFlow.rules,
          successFlow?.rules,
          tokens,
          users
        );

      outputs.push({
        type: SecurityConfigType.UNRESTRICTED_ACCESS_TO_SENSITIVE_BUSINESS_FLOW,
        result: unrestrictedAccessToSensitiveBusinessFlowValidation,
      });
    }

    const serverSideRequestForgery =
      typeWiseMap[SecurityConfigType.SERVER_SIDE_REQUEST_FORGERY];
    if (serverSideRequestForgery) {
      const serverSideRequestForgeryValidation =
        await validateServerSideRequestForgery(
          app,
          api,
          serverSideRequestForgery.rules,
          successFlow?.rules,
          tokens,
          users
        );

      outputs.push({
        type: SecurityConfigType.SERVER_SIDE_REQUEST_FORGERY,
        result: serverSideRequestForgeryValidation,
      });
    }

    const securityMisconfiguration =
      typeWiseMap[SecurityConfigType.SECURITY_MISCONFIGURATION];
    if (securityMisconfiguration) {
      const securityMisconfigurationValidation =
        await validateSecurityMisconfiguration(
          app,
          api,
          successFlow?.rules,
          tokens,
          users
        );

      outputs.push({
        type: SecurityConfigType.SECURITY_MISCONFIGURATION,
        result: securityMisconfigurationValidation,
      });
    }

    const unrestrictedResourceConsumption =
      typeWiseMap[SecurityConfigType.UNRESTRICTED_RESOURCE_CONSUMPTION];
    if (unrestrictedResourceConsumption) {
      const unrestrictedResourceConsumptionValidation =
        await validateUnrestrictedResourceConsumption(
          app,
          api,
          unrestrictedResourceConsumption.rules,
          successFlow?.rules,
          tokens,
          users
        );

      outputs.push({
        type: SecurityConfigType.UNRESTRICTED_RESOURCE_CONSUMPTION,
        result: unrestrictedResourceConsumptionValidation,
      });
    }

    // Merge outputs into markdown
    const outputSummary = outputs
      .map((output) => {
        // use emojis
        if (output.result.success) {
          return `\t- ✅ [${output.type}]: ${output.result.message}`;
        } else {
          return `\t- ❌ [${output.type}][${output.result.severity}] ${output.result.message}`;
        }
      })
      .join("\n");

    return outputSummary;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to scout API");
  }
};
