import { IsBoolean } from 'class-validator';

export class BanInfoInputModel {
  @IsBoolean()
  isBanned: boolean;
}
