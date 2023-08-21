import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  BannedUserInfoType,
  BannedUsersByBloggerDocument,
  BannedUsersByBloggerModelType,
  BannedUsersViewType,
} from './users-banned-by-blogger.db.types';

@Schema()
export class BanInfoForBlogger {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ default: new Date().toISOString() })
  banDate: string;

  @Prop({ required: true })
  banReason: string;
}
export const BanInfoForBloggerSchema =
  SchemaFactory.createForClass(BanInfoForBlogger);
@Schema()
export class BannedUsersByBlogger {
  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ type: BanInfoForBloggerSchema, required: true })
  banInfo: BanInfoForBlogger;

  static createInstance(
    blogId: string,
    bannedUserInfo: BannedUserInfoType,
    BannedUserModel: BannedUsersByBloggerModelType,
  ): BannedUsersByBloggerDocument {
    return new BannedUserModel({
      blogId,
      ...bannedUserInfo,
    });
  }

  modifyIntoViewModel(): BannedUsersViewType {
    return {
      id: this.userId,
      login: this.login,
      banInfo: {
        isBanned: this.banInfo.isBanned,
        banDate: this.banInfo.banDate,
        banReason: this.banInfo.banReason,
      },
    };
  }
}
export const BannedUsersByBloggerSchema =
  SchemaFactory.createForClass(BannedUsersByBlogger);

BannedUsersByBloggerSchema.statics = {
  createInstance: BannedUsersByBlogger.createInstance,
};

BannedUsersByBloggerSchema.methods = {
  modifyIntoViewModel: BannedUsersByBlogger.prototype.modifyIntoViewModel,
};
