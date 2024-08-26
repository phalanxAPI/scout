export type ScanAppRequest = {
  appId: string;
};

export type ScanAppResponse = {
  scanId: string;
};

export type ScoutService = {
  scanApp: (data: ScanAppRequest) => Promise<ScanAppResponse>;
};
