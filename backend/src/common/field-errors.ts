import { HttpException, HttpStatus } from '@nestjs/common';

export type FieldErrors = Record<string, string>;

/**
 * Thrown when one or more submitted fields are invalid.
 * Response body: { statusCode, message, errors: { field: message } }
 * so forms can show each message next to its field.
 */
export class FieldValidationException extends HttpException {
  constructor(errors: FieldErrors, status: HttpStatus = HttpStatus.BAD_REQUEST, message = 'Please check the highlighted fields.') {
    super({ statusCode: status, message, errors }, status);
  }
}

export const throwIfErrors = (errors: FieldErrors) => {
  if (Object.keys(errors).length) throw new FieldValidationException(errors);
};
