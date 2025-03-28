export enum ErrorCode {
  INVALID_PARAMETER = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export interface ApiError {
  code: ErrorCode;
  message: string;
} 