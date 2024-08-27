interface UserData {
  [key: string]: {
    firstName: string;
    lastName: string;
    [key: string]: any;
  };
}

interface TokenData {
  [key: string]: string;
}

export const populateData = (
  data: any,
  sharedSecret: string,
  tokenData: TokenData,
  userData: UserData
): any => {
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return data.map((item) =>
        populateData(item, sharedSecret, tokenData, userData)
      );
    } else {
      const result: { [key: string]: any } = {};
      for (const key in data) {
        const value = data[key];
        if (typeof value === "string") {
          let newValue = value;
          const regex = /{{(.*?)}}/g;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(value)) !== null) {
            const placeholder = match[0];
            const placeholderKey = match[1];
            if (placeholderKey === "SHARED_SECRET") {
              newValue = newValue.replace(placeholder, sharedSecret);
            } else {
              const parts = placeholderKey.split(".");
              let currentData: any = tokenData;
              for (const part of parts) {
                if (part in currentData) {
                  currentData = currentData[part];
                } else {
                  currentData = null;
                  break;
                }
              }
              if (currentData !== null) {
                newValue = newValue.replace(placeholder, currentData);
              }
            }
          }
          result[key] = newValue;
        } else {
          result[key] = populateData(value, sharedSecret, tokenData, userData);
        }
      }
      return result;
    }
  }
  return data;
};
