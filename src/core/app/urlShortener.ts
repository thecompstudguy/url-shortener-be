import { validateFields } from 'lesgo/utils';
import appConfig from '../../config/app';
import getUrlDataByOriginalUrl from '../../models/getUrlDataByOriginalUrl';
import getUrlDataByShortcode from '../../models/getUrlDataByShortcode';
import storeUrlData from '../../models/storeUrlData';
import UrlShortenerResponse from '../../types/UrlShortenerResponse';

type Input = {
  url: string;
  creatorIpAddress: string;
  creatorUserId?: string;
};

const validateInput = (input: Input) => {
  const validFields = [
    { key: 'url', type: 'string', required: true },
    { key: 'creatorIpAddress', type: 'string', required: true },
    { key: 'creatorUserId', type: 'string', required: false },
  ];

  const validated = validateFields(input, validFields);

  return validated as Input;
};

const generateShortcode = (length = 5) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

export default async (body: Input): Promise<UrlShortenerResponse> => {
  const validated = validateInput({ ...body });

  const existingUrlData = await getUrlDataByOriginalUrl(validated.url);

  if (existingUrlData) {
    return {
      shortcode: existingUrlData.shortcode,
      originalUrl: existingUrlData.originalUrl,
      url: `${appConfig.shortUrlDomain}/${existingUrlData.shortcode}`,
    };
  }

  let shortcode = '';
  let isUnique = false;

  while (!isUnique) {
    shortcode = generateShortcode(5);

    // eslint-disable-next-line no-await-in-loop
    const existingShortcode = await getUrlDataByShortcode(shortcode);

    if (!existingShortcode) {
      isUnique = true;
    }
  }

  const urlData = {
    shortcode,
    originalUrl: validated.url,
    creatorIpAddress: validated.creatorIpAddress,
    creatorUserId: validated.creatorUserId,
  };

  // TODO: To dispatch to sqs
  await storeUrlData(urlData);

  return {
    shortcode,
    originalUrl: validated.url,
    url: `${appConfig.shortUrlDomain}/${shortcode}`,
  };
};
