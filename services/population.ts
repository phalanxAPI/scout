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
      const parts = p1.split(".");
      let currentData: any = null;
      if (parts[0] === "SHARED_SECRET") {
        return sharedSecret;
      } else if (userData[parts[0]]) {
        currentData = userData[parts[0]];
        for (let i = 1; i < parts.length; i++) {
          currentData = currentData[parts[i]];
          if (currentData === undefined) break;
        }
      }
      return currentData !== null ? currentData : `{{${p1}}}`;
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
