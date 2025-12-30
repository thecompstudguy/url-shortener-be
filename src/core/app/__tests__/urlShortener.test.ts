import urlShortener from '../urlShortener';
import appConfig from '../../../config/app';
import getUrlDataByOriginalUrl from '../../../models/getUrlDataByOriginalUrl';
import getUrlDataByShortcode from '../../../models/getUrlDataByShortcode';
import storeUrlData from '../../../models/storeUrlData';

jest.mock('../../../models/getUrlDataByOriginalUrl');
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
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(null);
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    const result = await urlShortener(input);

    expect(result).toEqual({
      shortcode: expect.any(String),
      originalUrl: input.url,
      url: expect.stringMatching(
        new RegExp(`^${appConfig.shortUrlDomain}/[a-zA-Z0-9]{5}$`)
      ),
    });
    expect(getUrlDataByOriginalUrl).toHaveBeenCalledWith(input.url);
    expect(getUrlDataByShortcode).toHaveBeenCalled();
    expect(storeUrlData).toHaveBeenCalledWith(
      expect.objectContaining({
        originalUrl: input.url,
        creatorIpAddress: input.creatorIpAddress,
      })
    );
  });

  it('should regenerate shortcode if collision occurs', async () => {
    const input = {
      url: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(null);
    (getUrlDataByShortcode as jest.Mock)
      .mockResolvedValueOnce({ shortcode: 'collis' })
      .mockResolvedValueOnce(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    const result = await urlShortener(input);

    expect(result).toEqual({
      shortcode: expect.any(String),
      originalUrl: input.url,
      url: expect.stringMatching(
        new RegExp(`^${appConfig.shortUrlDomain}/[a-zA-Z0-9]{5}$`)
      ),
    });
    expect(getUrlDataByShortcode).toHaveBeenCalledTimes(2);
    expect(storeUrlData).toHaveBeenCalled();
  });

  it('should return existing url data if original url already shortened', async () => {
    const input = {
      url: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    const existingData = {
      shortcode: 'abcde',
      originalUrl: 'https://example.com',
      creatorIpAddress: '192.168.1.1',
    };
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(existingData);

    const result = await urlShortener(input);

    expect(result).toEqual({
      shortcode: existingData.shortcode,
      originalUrl: existingData.originalUrl,
      url: `${appConfig.shortUrlDomain}/${existingData.shortcode}`,
    });
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

  it('should throw error when invalid url is provided', async () => {
    const input = {
      url: 'invalid-url',
      creatorIpAddress: '127.0.0.1',
    };
    await expect(urlShortener(input)).rejects.toThrow('Invalid URL provided');
  });

  it('should bypass urlExists check for domains in bypass list', async () => {
    const input = {
      url: 'https://reddit.com/r/AteneodeCagayan',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(null);
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    // Mock fetch and ensure it's NOT called
    const spyFetch = jest.spyOn(global, 'fetch');

    const result = await urlShortener(input);

    expect(result).toBeDefined();
    expect(spyFetch).not.toHaveBeenCalled();

    spyFetch.mockRestore();
  });

  it('should bypass urlExists check for subdomains of domains in bypass list', async () => {
    const input = {
      url: 'https://www.reddit.com/r/AteneodeCagayan',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(null);
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    // Mock fetch and ensure it's NOT called
    const spyFetch = jest.spyOn(global, 'fetch');

    const result = await urlShortener(input);

    expect(result).toBeDefined();
    expect(spyFetch).not.toHaveBeenCalled();

    spyFetch.mockRestore();
  });

  it('should NOT bypass urlExists check for domains that only partially match', async () => {
    const input = {
      url: 'https://notreddit.com/something',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(null);
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    // Mock fetch to return OK
    const spyFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const result = await urlShortener(input);

    expect(result).toBeDefined();
    expect(spyFetch).toHaveBeenCalled();

    spyFetch.mockRestore();
  });

  it('should still call urlExists check for domains NOT in bypass list', async () => {
    const input = {
      url: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    (getUrlDataByOriginalUrl as jest.Mock).mockResolvedValue(null);
    (getUrlDataByShortcode as jest.Mock).mockResolvedValue(null);
    (storeUrlData as jest.Mock).mockResolvedValue({});

    // Mock fetch to return OK
    const spyFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const result = await urlShortener(input);

    expect(result).toBeDefined();
    expect(spyFetch).toHaveBeenCalled();

    spyFetch.mockRestore();
  });
});
