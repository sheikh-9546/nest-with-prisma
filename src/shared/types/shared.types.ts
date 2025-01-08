export type DataRecord<T = any> = Record<string, T>;

export type SuccessResponse<T> = {
  status: number;
  message?: string;
  responseTimeStamp: number;
  result: T | null;
};
