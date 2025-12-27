import { validateFields } from 'lesgo/utils';
import getUrlDataByShortcode from '../../models/getUrlDataByShortcode';
import UrlShortenerException from '../../exceptions/UrlShortenerException';

const FILE = 'core.app.urlRedirect';

type Input = {
  shortcode: string;
};

const validateInput = (input: Input) => {
  const validFields = [{ key: 'shortcode', type: 'string', required: true }];

  return validateFields(input, validFields) as Input;
};

export default async (params: Input): Promise<string> => {
  const validated = validateInput({ ...params });

  const urlData = await getUrlDataByShortcode(validated.shortcode);

  if (!urlData) {
    throw new UrlShortenerException(
      'URL not found',
      `${FILE}::URL_NOT_FOUND`,
      404
    );
  }

  return urlData.originalUrl;
};
