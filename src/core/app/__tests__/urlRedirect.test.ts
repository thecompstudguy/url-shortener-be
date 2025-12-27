import urlRedirect from '../urlRedirect';
import getUrlDataByShortcode from '../../../models/getUrlDataByShortcode';

jest.mock('../../../models/getUrlDataByShortcode');

describe('core.app.urlRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return original url if shortcode exists', async () => {
    const input = { shortcode: 'abcde' };
    const mockUrlData = {
      shortcode: 'abcde',
      originalUrl: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(mockUrlData);

    const result = await urlRedirect(input);

    expect(result).toBe(mockUrlData.originalUrl);
    expect(getUrlDataByShortcode).toHaveBeenCalledWith(input.shortcode);
  });

  it('should throw 404 error if shortcode does not exist', async () => {
    const input = { shortcode: 'nonexistent' };
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);

    await expect(urlRedirect(input)).rejects.toThrow(
      expect.objectContaining({
        message: 'URL not found',
        statusCode: 404,
        code: 'core.app.urlRedirect::URL_NOT_FOUND',
      })
    );
  });

  it('should throw error when shortcode is missing', async () => {
    const input = {} as any;
    await expect(urlRedirect(input)).rejects.toThrow();
  });
});
