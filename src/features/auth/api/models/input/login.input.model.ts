import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputModel {
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @ApiProperty()
  loginOrEmail: string;

  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @ApiProperty()
  password: string;
}
