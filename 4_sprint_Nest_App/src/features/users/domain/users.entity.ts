import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
  BanInfo,
  BanInfoSchema,
  EmailConfirmation,
  EmailConfirmationSchema,
  PasswordRecovery,
  PasswordRecoverySchema,
} from './users.subschemas';
import {
  BanInfoType,
  UserDocument,
  UserModelType,
  UserDTOType,
} from './users.db.types';
import { UserViewType } from '../super-admin/infrastructure/query.repository/users-sa.types.query.repository';

@Schema()
export class User {
  _id: ObjectId;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, default: new Date().toISOString() })
  createdAt: string;

  @Prop({ type: EmailConfirmationSchema, default: {} })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, default: {} })
  passwordRecovery: PasswordRecovery;

  @Prop({ type: BanInfoSchema, default: {} })
  banInfo: BanInfo;

  static createInstance(
    userDTO: UserDTOType,
    UserModel: UserModelType,
  ): UserDocument {
    return new UserModel(userDTO);
  }

  modifyIntoViewModel(): UserViewType {
    return {
      id: this._id.toString(),
      login: this.login,
      email: this.email,
      createdAt: this.createdAt,
      banInfo: {
        isBanned: this.banInfo.isBanned,
        banDate: this.banInfo.banDate,
        banReason: this.banInfo.banReason,
      },
    };
  }

  updateBanInfo(banInfo: BanInfoType, user: UserDocument) {
    user.banInfo.isBanned = banInfo.isBanned;
    user.banInfo.banReason = banInfo.isBanned ? banInfo.banReason : null;
    user.banInfo.banDate = banInfo.isBanned ? new Date().toISOString() : null;
    return;
  }
}
export const User2Schema = SchemaFactory.createForClass(User);

User2Schema.statics = {
  createInstance: User.createInstance,
};

User2Schema.methods = {
  modifyIntoViewModel: User.prototype.modifyIntoViewModel,
  updateBanInfo: User.prototype.updateBanInfo,
};
