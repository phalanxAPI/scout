import API from "../arsenal/models/api";
import Application from "../arsenal/models/application";

export const scoutApp = async (appId: string): Promise<any> => {
  try {
    const appData = await Application.findById(appId);
    if (!appData) {
      throw new Error("Application not found");
    }

    const apis = await API.find({ appId });
    return apis;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to scan app");
  }
};
