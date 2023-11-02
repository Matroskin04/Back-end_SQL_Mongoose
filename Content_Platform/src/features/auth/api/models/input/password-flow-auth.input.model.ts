import { IsEmail, Matches } from 'class-validator';

export class PasswordRecoveryInputModel {
  @IsEmail({}, { message: 'Incorrect Email' })
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'Incorrect Email',
  })
  email: string;
}
