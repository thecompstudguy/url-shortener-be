import { validateFields } from 'lesgo/utils';
import appConfig from '../../config/app';

type Input = {
  url: string;
};

const validateInput = (input: Input) => {
  const validFields = [{ key: 'url', type: 'string', required: true }];

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

export default (body: Input) => {
  validateInput({ ...body });

  const shortcode = generateShortcode(5);
  const shortUrl = `${appConfig.shortUrlDomain}/${shortcode}`;

  return {
    url: shortUrl,
  };
};
