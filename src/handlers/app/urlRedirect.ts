import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import middy from '@middy/core';
import { logger } from 'lesgo/utils';
import urlRedirect from '../../core/app/urlRedirect';

const FILE = 'handlers.app.urlRedirect';

const urlRedirectHandler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  logger.debug(`${FILE}::RECEIVED_REQUEST`, event);

  try {
    const { pathParameters } = event;
    const shortcode = pathParameters?.shortcode as string;

    const originalUrl = await urlRedirect({ shortcode });

    return {
      statusCode: 301,
      headers: {
        Location: originalUrl,
      },
    };
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        message: err.message || 'Internal Server Error',
      }),
    };
  }
};

export const handler = middy<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
>().handler(urlRedirectHandler);

export default handler;
