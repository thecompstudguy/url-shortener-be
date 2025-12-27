/* eslint-disable @typescript-eslint/no-explicit-any */
const rethrowAsException = (
  error: any,
  ExceptionClass: any,
  payload: {
    message: string;
    errorCode: string;
    context?: Record<string, any>;
    statusCode?: number;
  }
) => {
  if (error instanceof ExceptionClass) {
    throw error;
  }

  throw new ExceptionClass(
    payload.message,
    payload.errorCode,
    payload.statusCode || 500,
    {
      ...payload.context,
      originalError: {
        message: error.message,
        stack: error.stack,
      },
    }
  );
};

export default rethrowAsException;
