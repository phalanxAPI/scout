import initServer from "./core/server";
import { ScoutService } from "./types/proto";

const services: ScoutService = {
  scanApp: async (data) => {
    // TODO: Test Servers
    return {
      scanId: "Scanning app",
    };
  },
};

initServer(services);
