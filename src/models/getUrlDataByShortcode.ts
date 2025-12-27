import { query } from 'lesgo/utils/dynamodb';
import { logger } from 'lesgo/utils';
import dynamodbConfig from '../config/dynamodb';
import UrlDataDbRow from '../types/UrlDataDbRow';
import UrlShortenerException from '../exceptions/UrlShortenerException';
import rethrowAsException from '../utils/errors/rethrowAsException';

const FILE = 'models.getUrlDataByShortcode';

const getUrlDataByShortcode = async (
  shortcode: string
): Promise<UrlDataDbRow | null> => {
  try {
    const tableAlias = dynamodbConfig.tables.default.alias as string;

    logger.debug(`${FILE}::FETCHING_URL_DATA`, {
      shortcode,
      tableAlias,
    });

    const resp = await query(tableAlias, 'shortcode = :shortcode', {
      ':shortcode': shortcode,
    });

    logger.debug(`${FILE}::URL_DATA_FETCHED`, {
      count: resp.length,
    });

    if (!resp.length) return null;

    return resp[0] as UrlDataDbRow;
  } catch (error) {
    return rethrowAsException(error, UrlShortenerException, {
      message: 'Failed to fetch url data',
      errorCode: `${FILE}::FETCH_ERROR`,
      context: { shortcode },
    });
  }
};

export default getUrlDataByShortcode;
