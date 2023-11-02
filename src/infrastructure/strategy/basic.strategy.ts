import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/configuration';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<ConfigType>) {
    super();
  }
  public validate = async (username, password): Promise<boolean> => {
    if (
      username ===
        this.configService.get('credentials', {
          infer: true,
        })!.SA_LOGIN &&
      password ===
        this.configService.get('credentials', {
          infer: true,
        })!.SA_PASS
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
