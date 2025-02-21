export enum ErrorCode {
  SLOT_ALREADY_BOOKED = 'SLOT_ALREADY_BOOKED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
} 