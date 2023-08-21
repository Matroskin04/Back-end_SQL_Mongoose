import { IsBoolean, IsString, MinLength } from 'class-validator';

export class UpdateBanInfoOfUserInputModel {
  @IsBoolean({ message: 'The value must be boolean' })
  isBanned: boolean;

  @IsString({ message: 'The value must be string' })
  @MinLength(20)
  banReason: string;
}
