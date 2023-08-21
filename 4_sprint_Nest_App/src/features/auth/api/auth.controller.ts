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
import { AuthService } from '../application/auth.service';
import {
  AuthOutputModel,
  ViewTokenModel,
} from './models/output/auth.output.model';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import {
  ConfirmationCodeAuthModel,
  EmailResendingAuthModel,
  RegistrationAuthInputModel,
} from './models/input/registration-auth.input.model';
import { LocalAuthGuard } from '../../../infrastructure/guards/authorization-guards/local-auth.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { ValidateConfirmationCodeGuard } from '../../../infrastructure/guards/validation-guards/validate-confirmation-code.guard';
import { ValidateEmailResendingGuard } from '../../../infrastructure/guards/validation-guards/validate-email-resending.guard';
import {
  NewPasswordAuthModel,
  PasswordRecoveryAuthModel,
} from './models/input/password-flow-auth.input.model';
import { ValidateEmailRegistrationGuard } from '../../../infrastructure/guards/validation-guards/validate-email-registration.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { DevicesService } from '../../devices/application/devices.service';
import { TitleOfDevice } from '../../../infrastructure/decorators/auth/title-of-device.param.decorator';
import { JwtRefreshGuard } from '../../../infrastructure/guards/authorization-guards/jwt-refresh.guard';
import { RefreshToken } from '../../../infrastructure/decorators/auth/refresh-token-param.decorator';
import { JwtService } from '../../jwt/jwt.service';
import { BlogOwnerByIdGuard } from '../../../infrastructure/guards/is-user-ban.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageCommand } from '../application/use-cases/resend-confirmation-email-message.use-case';
import { UsersPublicQueryRepository } from '../../users/public/infrastructure/query.repository/users-public.query.repository';
import { SaveNewPassCommand } from '../application/use-cases/save-new-pass.use-case';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { SendEmailPassRecoveryCommand } from '../application/use-cases/send-email-pass-recovery.use-case';

@SkipThrottle()
@Controller('/hometask-nest/auth')
export class AuthController {
  constructor(
    protected commandBus: CommandBus,
    protected jwtService: JwtService,
    protected devicesService: DevicesService,
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
  ) {}

  @SkipThrottle()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getUserInformation(
    @CurrentUserId() userId: ObjectId,
  ): Promise<AuthOutputModel> {
    const result = await this.usersPublicQueryRepository.getUserInfoById(
      userId,
    );

    if (result) return result;
    throw new NotFoundException('User is not found');
  }
  @UseGuards(LocalAuthGuard, BlogOwnerByIdGuard)
  @Post('login')
  async loginUser(
    @CurrentUserId() userId: ObjectId,
    @Res({ passthrough: true }) res: Response<ViewTokenModel>,
    @Ip() ip: string,
    @TitleOfDevice() title: string,
  ) {
    const result = await this.commandBus.execute(new LoginUserCommand(userId));

    if (result) {
      await this.devicesService.createNewDevice(
        ip || 'unknown',
        title,
        result.userId,
        result.refreshToken,
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
    @Body() inputConfirmationCode: ConfirmationCodeAuthModel,
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
    @Body() inputEmailModel: EmailResendingAuthModel,
    @CurrentUserId() userId: ObjectId,
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
    @CurrentUserId() userId: ObjectId,
    @RefreshToken() refreshToken: string,
    @Res() res: Response<ViewTokenModel | string>,
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

  @SkipThrottle()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('logout')
  async logoutUser(@RefreshToken() refreshToken: string): Promise<void> {
    await this.devicesService.deleteDeviceByRefreshToken(refreshToken);
    return;
  }

  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('password-recovery')
  async passwordRecovery(
    @Body() inputEmailModel: PasswordRecoveryAuthModel,
  ): Promise<string> {
    await this.commandBus.execute(
      new SendEmailPassRecoveryCommand(inputEmailModel.email),
    );

    return 'Email with instruction will be send to passed email address (if a user with such email exists)';
  }

  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('new-password')
  async saveNewPassword(
    @Body() inputInfo: NewPasswordAuthModel,
  ): Promise<string> {
    await this.commandBus.execute(
      new SaveNewPassCommand(inputInfo.newPassword, inputInfo.recoveryCode),
    );

    return 'New password is saved';
  }
}
