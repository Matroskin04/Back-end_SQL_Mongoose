import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createBodyErrorBadRequest } from './create-error-bad-request.function';
import { regexpUUID } from '../regexp/general-regexp';

export function checkIdFormatAndExistence(id: string) {
  if (!id) {
    throw new NotFoundException(
      createBodyErrorBadRequest('Id is not passed', 'id'),
    );
  }
  if (!regexpUUID.test(id)) {
    throw new BadRequestException(
      createBodyErrorBadRequest('Id is not format by UUID', 'id'),
    );
  }
  return id;
}
