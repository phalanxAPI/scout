import * as gRPC from "@grpc/grpc-js";
import { GrpcObject, ServiceClientConstructor } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { ScoutService } from "../types/proto";

const PORT = process.env.PORT || 9001;

// const packageDef = loadSync("arsenal/proto/scout.proto", {});
const packageDef = loadSync("arsenal/proto/sysmon.lighthouse.proto", {});
const gRPCObject = gRPC.loadPackageDefinition(packageDef);

const phalanxPackage = gRPCObject.phalanx as GrpcObject;
const arsenalPackage = phalanxPackage.arsenal as GrpcObject;
const scoutPackage = arsenalPackage.sysmon as GrpcObject;

const scoutConstructor = scoutPackage.SysmonService as ServiceClientConstructor;
const scoutService = scoutConstructor.service;

const server = new gRPC.Server();

const initServer = (service: ScoutService) => {
  const servicesMap: gRPC.UntypedServiceImplementation = {};

  Object.entries(service).forEach(([key, value]) => {
    servicesMap[key] = async (call, callback) => {
      try {
        const response = await value(call.request);
        callback(null, response);
      } catch (err) {
        console.error(err);
        callback(err, null);
      }
    };
  });

  server.addService(scoutService, servicesMap);
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    gRPC.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Server bound on port ${port}`);
    }
  );
};

export default initServer;
