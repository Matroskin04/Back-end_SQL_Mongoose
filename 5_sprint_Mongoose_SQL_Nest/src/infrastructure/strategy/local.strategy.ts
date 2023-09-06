import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserCommand } from '../../features/auth/application/use-cases/validate-user.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail', //rename field with username
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string }> {
    const user = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id };
  }
}
