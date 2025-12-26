import urlShortener from '../urlShortener';

describe('core.app.urlShortener', () => {
  it('should return the url when provided', () => {
    const input = { url: 'https://example.com' };
    const result = urlShortener(input);
    expect(result).toEqual({ url: 'https://example.com' });
  });

  it('should throw error when url is missing', () => {
    const input = {} as any;
    expect(() => urlShortener(input)).toThrow();
  });
});
