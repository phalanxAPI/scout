import RandExp from "randexp";

type TokenData = Record<string, string>;
type UserData = Record<string, Record<string, any>>;

const populateData = (
  data: any,
  sharedSecret: string,
  tokenData: TokenData,
  userData: UserData
): any => {
  // Merge token data into user data
  for (const key in tokenData) {
    if (userData.hasOwnProperty(key)) {
      userData[key].token = tokenData[key];
    }
  }

  const processString = (value: string): string => {
    return value.replace(/{{(.*?)}}/g, (_, p1: string) => {
      // Splitting the placeholder based on ":" to check for "regex" or other keywords
      const colonParts = p1.split(":");
      if (colonParts[0] === "regex") {
        return new RandExp(colonParts[1]).gen();
      } else {
        // Handling for shared secrets or user data
        const dotParts = p1.split(".");
        let currentData: any = null;
        if (dotParts[0] === "SHARED_SECRET") {
          return sharedSecret;
        } else if (userData[dotParts[0]]) {
          currentData = userData[dotParts[0]];
          for (let i = 1; i < dotParts.length; i++) {
            currentData = currentData[dotParts[i]];
            if (currentData === undefined) break;
          }
        }
        return currentData !== null ? currentData : `{{${p1}}}`;
      }
    });
  };

  const deepProcess = (input: any): any => {
    if (typeof input === "object" && input !== null) {
      if (Array.isArray(input)) {
        return input.map(deepProcess);
      } else {
        const result: { [key: string]: any } = {};
        for (const key in input) {
          const value = input[key];
          if (typeof value === "string") {
            result[key] = processString(value);
          } else {
            result[key] = deepProcess(value);
          }
        }
        return result;
      }
    }
    return input;
  };

  return deepProcess(data);
};

export { populateData };
