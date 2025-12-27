export default {
  name: process.env.APP_NAME,
  env: process.env.APP_ENV || /* istanbul ignore next */ process.env.NODE_ENV,
  debug: process.env.APP_DEBUG === 'true',
  shortUrlDomain: process.env.SHORT_URL_DOMAIN || 'https://shrt.lnk',
};
