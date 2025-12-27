import urlShortener from '../urlShortener';
import appConfig from '../../../config/app';

describe('core.app.urlShortener', () => {
  it('should return the shortened url when provided', () => {
    const input = { url: 'https://example.com' };
    const result = urlShortener(input);
    expect(result.url).toMatch(
      new RegExp(`^${appConfig.shortUrlDomain}/[a-zA-Z0-9]{5}$`)
    );
  });

  it('should throw error when url is missing', () => {
    const input = {} as any;
    expect(() => urlShortener(input)).toThrow();
  });
});
