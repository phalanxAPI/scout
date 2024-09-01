import { scoutApp } from "../services/app-scout";
import { ScoutService } from "../types/proto";

export const services: ScoutService = {
  scanApp: scoutApp,
};
