import urlShortener from '../urlShortener';
import appConfig from '../../../config/app';
import getUrlDataByShortcode from '../../../models/getUrlDataByShortcode';
import storeUrlData from '../../../models/storeUrlData';

jest.mock('../../../models/getUrlDataByShortcode');
jest.mock('../../../models/storeUrlData');

describe('core.app.urlShortener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the shortened url when provided', async () => {
    const input = {
      url: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    const result = await urlShortener(input);

    expect(result.url).toMatch(
      new RegExp(`^${appConfig.shortUrlDomain}/[a-zA-Z0-9]{5}$`)
    );
    expect(getUrlDataByShortcode).toHaveBeenCalled();
    expect(storeUrlData).toHaveBeenCalledWith(
      expect.objectContaining({
        originalUrl: input.url,
        creatorIpAddress: input.creatorIpAddress,
      })
    );
  });

  it('should return existing url data if shortcode collision occurs', async () => {
    const input = {
      url: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    const existingData = {
      shortcode: 'abcde',
      originalUrl: 'https://already-exists.com',
      creatorIpAddress: '192.168.1.1',
    };
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(existingData);

    const result = await urlShortener(input);

    expect(result.url).toBe(
      `${appConfig.shortUrlDomain}/${existingData.shortcode}`
    );
    expect(result.originalUrl).toBe(existingData.originalUrl);
    expect(storeUrlData).not.toHaveBeenCalled();
  });

  it('should throw error when url is missing', async () => {
    const input = { creatorIpAddress: '127.0.0.1' } as any;
    await expect(urlShortener(input)).rejects.toThrow();
  });

  it('should throw error when creatorIpAddress is missing', async () => {
    const input = { url: 'https://example.com' } as any;
    await expect(urlShortener(input)).rejects.toThrow();
  });
});
