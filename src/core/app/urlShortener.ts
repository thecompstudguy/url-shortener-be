import { validateFields } from 'lesgo/utils';
import appConfig from '../../config/app';
import getUrlDataByShortcode from '../../models/getUrlDataByShortcode';
import storeUrlData from '../../models/storeUrlData';

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

export default async (body: Input) => {
  const validated = validateInput({ ...body });

  const shortcode = generateShortcode(5);

  const existingUrlData = await getUrlDataByShortcode(shortcode);
  if (existingUrlData) {
    return {
      ...existingUrlData,
      url: `${appConfig.shortUrlDomain}/${existingUrlData.shortcode}`,
    };
  }

  const urlData = {
    shortcode,
    originalUrl: validated.url,
    creatorIpAddress: validated.creatorIpAddress,
    creatorUserId: validated.creatorUserId,
  };

  await storeUrlData(urlData);

  return {
    ...urlData,
    url: `${appConfig.shortUrlDomain}/${shortcode}`,
  };
};
