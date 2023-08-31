import { ObjectId } from 'mongodb';

export type UserDBTypeMongo = {
  _id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  passwordRecovery: {
    confirmationCode: string;
    expirationDate: Date;
  };
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};

export type BanInfoType = {
  isBanned: boolean;
  banReason: string;
};
