import { PipeTransform, Injectable } from '@nestjs/common';
import { checkIdFormatAndExistence } from '../utils/functions/check-id-format-and-existence';

@Injectable()
export class IsIdUUIDValidationPipe implements PipeTransform {
  async transform(value: string) {
    return checkIdFormatAndExistence(value);
  }
}
