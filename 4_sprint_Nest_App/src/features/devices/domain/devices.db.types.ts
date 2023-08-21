import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { Device } from './devices.entity';

export type DeviceDBType = {
  _id: ObjectId;

  ip: string;

  title: string;

  lastActiveDate: string;

  deviceId: string;

  userId: string;

  expirationDate: number;
};

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelType = Model<DeviceDocument> &
  DeviceModelStaticMethodsType;

export type DeviceModelStaticMethodsType = {
  createInstance: (
    ip: string,
    title: string,
    payloadToken: any,
    userId: ObjectId,
    DeviceModel: DeviceModelType,
  ) => DeviceDocument;
};
