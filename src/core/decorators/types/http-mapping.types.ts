import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export type RequestMapping = {
  path?: string;
  summary?: string;
  directory?: string;
  options?: Partial<OperationObject>;
};

export type RestControllerOption = {
  tag: string;
  path?: string;
  version?: number;
};
