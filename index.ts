import { initDB } from "./core/db";
import initServer from "./core/server";
import { services } from "./core/services";

initDB().then(() => {
  initServer(services);
});
