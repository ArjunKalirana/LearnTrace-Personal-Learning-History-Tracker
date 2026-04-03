/**
 * Custom application error class for consistent error handling.
 * Includes HTTP status codes to be picked up by the error handling middleware.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Flag for operational errors vs programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}
