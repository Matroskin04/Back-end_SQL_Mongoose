import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInputModel {
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  loginOrEmail: string;

  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  password: string;
}
