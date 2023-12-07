import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginInputModel {
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @ApiProperty({
    description: 'Email / login of a user',
    example: 'somemail@gmail.com / login123',
  })
  loginOrEmail: string;

  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @ApiProperty({ description: 'Password of a user', example: 'qwerty' })
  password: string;
}
