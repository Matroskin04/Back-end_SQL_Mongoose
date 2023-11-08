import {
  PipeTransform,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { createBodyErrorBadRequest } from '../utils/functions/create-error-bad-request.function';
import { regexpUUID } from '../utils/regexp/general-regexp';

@Injectable()
export class IsIdUUIDValidationPipe implements PipeTransform {
  async transform(value: string) {
    if (!value) {
      throw new NotFoundException(
        createBodyErrorBadRequest('Id is not passed', 'id'),
      );
    }
    if (!regexpUUID.test(value)) {
      throw new BadRequestException(
        createBodyErrorBadRequest('Id is not format by UUID', 'id'),
      );
    }
    return value;
  }
}
