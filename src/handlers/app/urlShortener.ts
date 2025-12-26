import { APIGatewayProxyEvent } from 'aws-lambda';
import middy from '@middy/core';
import { httpMiddleware } from 'lesgo/middlewares';
import { logger } from 'lesgo/utils';
import urlShortener from '../../core/app/urlShortener';
import appConfig from '../../config/app';

const FILE = 'handlers.app.urlShortener';

type MiddyAPIGatewayProxyEvent = APIGatewayProxyEvent & {
  body: {
    url: string;
  };
};

const urlShortenerHandler = (event: MiddyAPIGatewayProxyEvent) => {
  logger.debug(`${FILE}::RECEIVED_REQUEST`, event);

  return urlShortener(event.body);
};

export const handler = middy()
  .use(httpMiddleware({ debugMode: appConfig.debug }))
  .handler(urlShortenerHandler);

export default handler;
