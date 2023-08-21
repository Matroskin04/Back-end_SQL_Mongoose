import { ResponseTypeService } from './types/create-responses-service.types.service';
//todo - structure directories - normal?
export const createResponseService = (
  statusCode: number,
  message: any,
): ResponseTypeService => {
  return {
    status: statusCode,
    message: message,
  };
};
