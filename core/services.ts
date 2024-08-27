import { scoutApp } from "../services/appScout";
import { ScoutService } from "../types/proto";

export const services: ScoutService = {
  scanApp: scoutApp,
};
