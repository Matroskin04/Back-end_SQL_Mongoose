import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginInputModel } from '../../features/auth/api/models/input/login.input.model';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { LoginOutputModel } from '../../features/auth/api/models/output/login.output.model';
import { getConfiguration } from '../../configuration/configuration';
import { RegistrationAuthInputModel } from '../../features/auth/api/models/input/registration-auth.input.model';

export function ApiRegister() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary:
        'Registration in the system. Email with confirmation code will be send to passed email address',
    }),
    ApiBody({ type: RegistrationAuthInputModel }),
    ApiNoContentResponse({
      description: `Input data is accepted. Email with confirmation code will be send to passed email address`,
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
