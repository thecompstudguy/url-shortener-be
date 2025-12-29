import { isIP } from 'node:net';
import { validateFields } from 'lesgo/utils';
import appConfig from '../../config/app';
import getUrlDataByOriginalUrl from '../../models/getUrlDataByOriginalUrl';
import getUrlDataByShortcode from '../../models/getUrlDataByShortcode';
import storeUrlData from '../../models/storeUrlData';
import UrlShortenerResponse from '../../types/UrlShortenerResponse';
import UrlShortenerException from '../../exceptions/UrlShortenerException';

const FILE = 'core.app.urlShortener';

type Input = {
  url: string;
  creatorIpAddress: string;
  creatorUserId?: string;
};

const urlExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      return true;
    }

    if (response.status === 405 || response.status === 501) {
      const fallbackResponse = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
      });
      return (
        fallbackResponse.ok ||
        (fallbackResponse.status >= 300 && fallbackResponse.status < 400)
      );
    }
  } catch (err) {
    return false;
  }

  return false;
};

const isPrivateIp = (ipAddress: string) => {
  if (isIP(ipAddress) === 4) {
    const [first, second] = ipAddress.split('.').map(Number);
    if (first === 10) return true;
    if (first === 127) return true;
    if (first === 0) return true;
    if (first === 169 && second === 254) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 100 && second >= 64 && second <= 127) return true;
    return false;
  }

  if (isIP(ipAddress) === 6) {
    const normalized = ipAddress.toLowerCase();
    if (normalized === '::1' || normalized === '::') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9')) {
      return true;
    }
    if (normalized.startsWith('fea') || normalized.startsWith('feb')) {
      return true;
    }
    if (normalized.startsWith('ff')) return true;
  }

  return false;
};

const isUnsafeHostname = (hostname: string) => {
  const normalized = hostname.toLowerCase();
  if (normalized === 'localhost' || normalized.endsWith('.localhost')) {
    return true;
  }

  if (normalized === 'local' || normalized.endsWith('.local')) {
    return true;
  }

  if (isIP(normalized)) {
    return isPrivateIp(normalized);
  }

  return false;
};

const validateInput = async (input: Input) => {
  const validFields = [
    { key: 'url', type: 'string', required: true },
    { key: 'creatorIpAddress', type: 'string', required: true },
    { key: 'creatorUserId', type: 'string', required: false },
  ];

  const validated = validateFields(input, validFields) as Input;

  if (validated.url.length > 2048) {
    throw new UrlShortenerException(
      'URL is too long',
      `${FILE}::URL_TOO_LONG`,
      400
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(validated.url);
  } catch (err) {
    throw new UrlShortenerException(
      'Invalid URL provided',
      `${FILE}::INVALID_URL`,
      400
    );
  }

  if (parsedUrl.protocol !== 'https:') {
    throw new UrlShortenerException(
      'Only HTTPS URLs are supported',
      `${FILE}::INVALID_URL_PROTOCOL`,
      400
    );
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new UrlShortenerException(
      'URL credentials are not allowed',
      `${FILE}::INVALID_URL_CREDENTIALS`,
      400
    );
  }

  if (isUnsafeHostname(parsedUrl.hostname)) {
    throw new UrlShortenerException(
      'URL hostname is not allowed',
      `${FILE}::INVALID_URL_HOST`,
      400
    );
  }

  const exists = await urlExists(parsedUrl.toString());
  if (!exists) {
    throw new UrlShortenerException(
      'URL does not exist',
      `${FILE}::URL_NOT_FOUND`,
      400
    );
  }

  return validated;
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
  const validated = await validateInput({ ...body });

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
