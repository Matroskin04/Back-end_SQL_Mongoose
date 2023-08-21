import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { User } from './users.entity';

export type UserDBType = {
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

export type UserDTOType = {
  login: string;
  email: string;
  passwordHash: string;
  emailConfirmation?: {
    confirmationCode?: string;
    expirationDate?: Date;
    isConfirmed?: boolean;
  };
  passwordRecovery?: {
    confirmationCode?: string;
    expirationDate?: Date;
  };
};

export type BanInfoType = {
  isBanned: boolean;
  banReason: string;
};

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & UserModelStaticMethodsType;

export type UserModelStaticMethodsType = {
  createInstance: (user2DTO, User2Model: UserModelType) => UserDocument;
};
