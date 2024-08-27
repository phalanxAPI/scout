import { scoutApp } from "../services/appScout";
import { ScoutService } from "../types/proto";

export const services: ScoutService = {
  scanApp: async (data) => {
    // TODO: Test Servers
    await scoutApp(data.appId);
    return {
      scanId: "Hello World",
    };
  },
};
