import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import middy from '@middy/core';
import { httpMiddleware } from 'lesgo/middlewares';
import { logger } from 'lesgo/utils';
import urlShortener from '../../core/app/urlShortener';
import appConfig from '../../config/app';
import UrlShortenerResponse from '../../types/UrlShortenerResponse';

const FILE = 'handlers.app.urlShortener';

type MiddyAPIGatewayProxyEvent = Omit<APIGatewayProxyEventV2, 'body'> & {
  body: {
    url: string;
  };
};

const urlShortenerHandler = (
  event: MiddyAPIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2<UrlShortenerResponse>> => {
  logger.debug(`${FILE}::RECEIVED_REQUEST`, event);

  const { body, requestContext } = event;
  const creatorIpAddress = requestContext.http.sourceIp;

  return urlShortener({
    ...body,
    creatorIpAddress,
  });
};

export const handler = middy<
  MiddyAPIGatewayProxyEvent,
  APIGatewayProxyResultV2<UrlShortenerResponse>
>()
  .use(httpMiddleware({ debugMode: appConfig.debug }))
  .handler(urlShortenerHandler);

export default handler;
