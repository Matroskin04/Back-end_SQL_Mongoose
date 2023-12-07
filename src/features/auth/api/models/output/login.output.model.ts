import { ApiProperty } from '@nestjs/swagger';

export class LoginOutputModel {
  @ApiProperty()
  accessToken: string;
}
