import { isEmpty } from 'lesgo/utils';

export default class UrlShortenerException extends Error {
  statusCode: number;

  code: string;

  extra?: string | Record<string, unknown>;

  constructor(
    message: string,
    errorCode = 'URL_SHORTENER_EXCEPTION',
    statusCode = 500,
    extra: string | Record<string, unknown> = {}
  ) {
    super();
    this.name = 'UrlShortenerException';
    this.message = message;
    this.statusCode = statusCode;
    this.code = errorCode;

    Error.captureStackTrace(this, this.constructor);

    if (!isEmpty(extra)) this.extra = extra;
  }
}
