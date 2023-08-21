import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class EmailConfirmation {
  @Prop({ required: true, default: uuidv4() })
  confirmationCode: string;

  @Prop({ type: Date, required: true, default: new Date() })
  expirationDate: Date;

  @Prop({ type: Boolean, required: true, default: true })
  isConfirmed: boolean;
}
export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class PasswordRecovery {
  @Prop({ required: true, default: uuidv4() })
  confirmationCode: string;

  @Prop({ type: Date, required: true, default: new Date() })
  expirationDate: Date;
}
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

@Schema()
export class BanInfo {
  @Prop({ required: true, default: false })
  isBanned: boolean;

  @Prop({ type: String || null, default: null })
  banDate: string | null;

  @Prop({ type: String || null, default: null })
  banReason: string | null;
}
export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);
