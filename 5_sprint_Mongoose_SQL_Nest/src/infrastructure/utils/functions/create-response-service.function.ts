import { ResponseTypeService } from './types/create-responses-service.types.service';

export const createResponseService = (
  statusCode: number,
  message: any,
): ResponseTypeService => {
  return {
    status: statusCode,
    message: message,
  };
};
