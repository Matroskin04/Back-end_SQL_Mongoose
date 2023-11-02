export type DeviceViewType = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export type DeviceDBType = {
  id: string;
  ip: string;
  title: string;
  lastActiveDate: string;
  userId: string;
  expirationDate: number;
};
