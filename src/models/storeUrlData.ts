import { logger, getCurrentTimestamp } from 'lesgo/utils';
import { putRecord } from 'lesgo/utils/dynamodb';
import dynamodbConfig from '../config/dynamodb';
import UrlDataDbRow from '../types/UrlDataDbRow';
import UrlShortenerException from '../exceptions/UrlShortenerException';
import rethrowAsException from '../utils/errors/rethrowAsException';

const FILE = 'models.storeUrlData';

const storeUrlData = async (params: UrlDataDbRow) => {
  try {
    const tableName = dynamodbConfig.tables.default.alias as string;

    const timestampNow = getCurrentTimestamp();

    const data: UrlDataDbRow = {
      ...params,
      createdAt: params.createdAt ?? timestampNow,
      updatedAt: timestampNow,
    };

    logger.debug(`${FILE}::STORING_URL_DATA`, {
      data,
      tableName,
    });

    const resp = await putRecord(data, tableName);

    logger.debug(`${FILE}::URL_DATA_STORED`, { resp });

    return resp;
  } catch (error) {
    return rethrowAsException(error, UrlShortenerException, {
      message: 'Failed to store url data',
      errorCode: `${FILE}::STORE_FAILED`,
      context: { params },
    });
  }
};

export default storeUrlData;
