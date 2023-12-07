import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginInputModel } from '../../features/auth/api/models/input/login.input.model';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginOutputModel } from '../../features/auth/api/models/output/login.output.model';
import { getConfiguration } from '../../configuration/configuration';

export function ApiLogin() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Логин' }),
    ApiBody({ type: LoginInputModel }),
    ApiCreatedResponse({
      description: `Returns JWT accessToken in body (expires after ${
        getConfiguration().jwt.EXPIRATION_TIME_ACCESS_TOKEN
      }) and JWT refreshToken in cookie (expires after ${
        getConfiguration().jwt.EXPIRATION_TIME_REFRESH_TOKEN
      })`,
      type: LoginOutputModel,
    }),
    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
    }),
    ApiUnauthorizedResponse({
      description: 'If the password or login is wrong',
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
