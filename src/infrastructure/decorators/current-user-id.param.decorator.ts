import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { createBodyErrorBadRequest } from '../utils/functions/create-error-bad-request.function';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.userId) {
      //check the format of id
      if (
        !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(
          request.userId,
        )
      )
        throw new BadRequestException(
          createBodyErrorBadRequest('Id has invalid format', 'id'),
        );

      return request.userId;
    }

    if (request.user) {
      //check the format of id
      if (
        !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(
          request.user.id,
        )
      )
        throw new BadRequestException(
          createBodyErrorBadRequest('Id has invalid format', 'id'),
        );

      return request.user.id;
    }

    return null;
  },
);
