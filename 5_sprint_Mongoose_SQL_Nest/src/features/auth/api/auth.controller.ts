import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  UserInfoOutputModel,
  LoginOutputModel,
} from './models/output/user-info.output.model';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { RegistrationAuthInputModel } from './models/input/registration-auth.input.model';
import { LocalAuthGuard } from '../../../infrastructure/guards/authorization-guards/local-auth.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { ValidateConfirmationCodeGuard } from '../../../infrastructure/guards/validation-guards/validate-confirmation-code.guard';
import { ValidateEmailResendingGuard } from '../../../infrastructure/guards/validation-guards/validate-email-resending.guard';
import { PasswordRecoveryInputModel } from './models/input/password-flow-auth.input.model';
import { ValidateEmailRegistrationGuard } from '../../../infrastructure/guards/validation-guards/validate-email-registration.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { TitleOfDevice } from '../../../infrastructure/decorators/auth/title-of-device.param.decorator';
import { JwtRefreshGuard } from '../../../infrastructure/guards/authorization-guards/jwt-refresh.guard';
import { RefreshToken } from '../../../infrastructure/decorators/auth/refresh-token-param.decorator';
import { JwtAdapter } from '../../../infrastructure/adapters/jwt.adapter';
import { IsUserBannedByLoginOrEmailGuard } from '../../../infrastructure/guards/is-user-banned.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageCommand } from '../application/use-cases/resend-confirmation-email-message.use-case';
import { SaveNewPassCommand } from '../application/use-cases/save-new-pass.use-case';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { SendEmailPassRecoveryCommand } from '../application/use-cases/send-email-pass-recovery.use-case';
import { UsersQueryRepository } from '../../users/infrastructure/SQL/query.repository/users.query.repository';
import { ConfirmationCodeInputModel } from './models/input/confirmation-code.input.model';
import { EmailResendingInputModel } from './models/input/email-resending.input.model';
import { NewPasswordInputModel } from './models/input/new-password.input.model';
import { CreateDeviceCommand } from '../../devices/application/use-cases/create-device.use-case';
import { DeleteDeviceByRefreshTokenCommand } from '../../devices/application/use-cases/delete-device-by-refresh-token.use-case';
import { UsersOrmQueryRepository } from '../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';

// @SkipThrottle()
@Controller('/hometask-nest/auth')
export class AuthController {
  constructor(
    protected commandBus: CommandBus,
    protected jwtService: JwtAdapter,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}

  @SkipThrottle()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getUserInformation(
    @CurrentUserId() userId: string,
  ): Promise<UserInfoOutputModel> {
    const result = await this.usersOrmQueryRepository.getUserInfoByIdView(
      userId,
    );

    if (result) return result;
    throw new NotFoundException('User is not found');
  }
  @UseGuards(LocalAuthGuard, IsUserBannedByLoginOrEmailGuard)
  @Post('login')
  async loginUser(
    @CurrentUserId() userId: string,
    @Ip() ip: string,
    @TitleOfDevice() title: string,
    @Res({ passthrough: true }) res: Response<LoginOutputModel>,
  ) {
    const result = await this.commandBus.execute(new LoginUserCommand(userId));

    if (result) {
      await this.commandBus.execute(
        new CreateDeviceCommand(
          ip || 'unknown',
          title,
          result.userId,
          result.refreshToken,
        ),
      );

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      res
        .status(HTTP_STATUS_CODE.OK_200)
        .send({ accessToken: result.accessToken });
    } else {
      throw new UnauthorizedException();
    }
  }

  @SkipThrottle()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('logout')
  async logoutUser(@RefreshToken() refreshToken: string): Promise<void> {
    await this.commandBus.execute(
      new DeleteDeviceByRefreshTokenCommand(refreshToken),
    );
    return;
  }

  @UseGuards(ValidateEmailRegistrationGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('registration')
  async registerUser(
    @Body() inputRegisterModel: RegistrationAuthInputModel,
  ): Promise<string> {
    await this.commandBus.execute(
      new RegisterUserCommand(
        inputRegisterModel.email,
        inputRegisterModel.login,
        inputRegisterModel.password,
      ),
    );

    return 'Input data is accepted. Email with confirmation code will be send to passed email address';
  }

  @UseGuards(ValidateConfirmationCodeGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('registration-confirmation')
  async confirmEmail(
    @Body() inputConfirmationCode: ConfirmationCodeInputModel,
  ): Promise<string> {
    await this.commandBus.execute(
      new ConfirmEmailCommand(inputConfirmationCode.code),
    );

    return 'Email was verified. Account was activated';
  }

  @UseGuards(ValidateEmailResendingGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('registration-email-resending')
  async resendEmailConfirmation(
    @Body() inputEmailModel: EmailResendingInputModel,
    @CurrentUserId() userId: string,
  ): Promise<string> {
    await this.commandBus.execute(
      new ResendConfirmationEmailMessageCommand(userId, inputEmailModel.email),
    );

    return 'Input data is accepted. Email with confirmation code will be send to passed email address.';
  }
  @SkipThrottle()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  async newRefreshToken(
    @CurrentUserId() userId: string,
    @RefreshToken() refreshToken: string,
    @Res() res: Response<LoginOutputModel | string>,
  ) {
    const tokens = await this.jwtService.changeTokensByRefreshToken(
      userId,
      refreshToken,
    );

    res.cookie(`refreshToken`, tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res
      .status(HTTP_STATUS_CODE.OK_200)
      .send({ accessToken: tokens.accessToken });
  }

  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('password-recovery')
  async passwordRecovery(
    @Body() inputEmailModel: PasswordRecoveryInputModel,
  ): Promise<string> {
    await this.commandBus.execute(
      new SendEmailPassRecoveryCommand(inputEmailModel.email),
    );

    return 'Email with instruction will be send to passed email address (if a user with such email exists)';
  }

  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('new-password')
  async saveNewPassword(
    @Body() inputInfo: NewPasswordInputModel,
  ): Promise<string> {
    await this.commandBus.execute(
      new SaveNewPassCommand(inputInfo.newPassword, inputInfo.recoveryCode),
    );

    return 'New password is saved';
  }
}
