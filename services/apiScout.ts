import { APIDoc } from "../arsenal/models/api";
import { ApplicationDoc } from "../arsenal/models/application";
import SecurityConfiguration from "../arsenal/models/security-conf";
import { SecurityConfigType } from "../arsenal/types/security-conf";
import { fetchTokens } from "./tokens";
import { fetchUsersData } from "./users";
import {
  ScanResult,
  validateBrokenAuthentication,
  validateBrokenObjectPropertyLevelAuthorization,
  validateObjectLevelAuth,
  validateSuccessCase,
} from "./validations";

export const scoutAPI = async (api: APIDoc, app: ApplicationDoc) => {
  try {
    const [tokens, users] = await Promise.all([
      fetchTokens(app),
      fetchUsersData(app),
    ]);

    // // TMP Create success flow
    // await SecurityConfiguration.create({
    //   apiId: api,
    //   configType: SecurityConfigType.SUCCESS_FLOW,
    //   isEnabled: true,
    //   rules: {
    //     headers: {
    //       Authorization: `Bearer {{user1.token}}`,
    //     },
    //     params: {
    //       userId: "{{user1.id}}",
    //     },
    //     expectations: {
    //       code: 200,
    //     },
    //   },
    // });

    // // Create failure flow with Broken Object Level Authorization
    // await SecurityConfiguration.create({
    //   apiId: api,
    //   configType: SecurityConfigType.BROKEN_OBJECT_LEVEL_AUTH,
    //   isEnabled: true,
    //   rules: {
    //     headers: {
    //       Authorization: `Bearer {{user2.token}}`,
    //     },
    //     params: {
    //       userId: "{{user1.id}}",
    //     },
    //     expectations: {
    //       code: 403,
    //     },
    //   },
    // });

    // // Broken Authentication Case
    // return await SecurityConfiguration.create({
    //   apiId: api,
    //   configType: SecurityConfigType.BROKEN_AUTHENTICATION,
    //   isEnabled: true,
    //   rules: {
    //     headers: {},
    //     params: {
    //       userId: "{{user1.id}}",
    //     },
    //     expectations: {
    //       code: 401,
    //     },
    //   },
    // });

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
        successFlow?.rules
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
      const brokenFunctionLevelAuthValidation = await validateSuccessCase(
        app,
        api,
        brokenFunctionLevelAuth.rules,
        tokens,
        users
      );

      outputs.push({
        type: SecurityConfigType.BROKEN_FUNCTION_LEVEL_AUTHORIZATION,
        result: brokenFunctionLevelAuthValidation,
      });
    }

    // Merge outputs into markdown
    const outputSummary = outputs
      .map((output) => {
        // use emojis
        if (output.result.success) {
          return `- ✅ [${output.type}]: ${output.result.message}`;
        } else {
          return `- ❌ [${output.type}][${output.result.severity}] ${output.result.message}`;
        }
      })
      .join("\n");

    return outputSummary;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to scout API");
  }
};
