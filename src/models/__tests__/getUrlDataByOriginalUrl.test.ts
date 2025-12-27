import { query } from 'lesgo/utils/dynamodb';
import getUrlDataByOriginalUrl from '../getUrlDataByOriginalUrl';
import UrlShortenerException from '../../exceptions/UrlShortenerException';

describe('models.getUrlDataByOriginalUrl', () => {
  it('should return url data when found', async () => {
    const mockData = { shortcode: 'abcde', originalUrl: 'https://example.com' };
    (query as jest.Mock).mockResolvedValue([mockData]);

    const result = await getUrlDataByOriginalUrl('https://example.com');

    expect(result).toEqual(mockData);
    expect(query).toHaveBeenCalledWith(
      'url-shortener-table-alias',
      'originalUrl = :originalUrl',
      { ':originalUrl': 'https://example.com' },
      { IndexName: 'originalUrlIndex' }
    );
  });

  it('should return null when not found', async () => {
    (query as jest.Mock).mockResolvedValue([]);

    const result = await getUrlDataByOriginalUrl('https://example.com');

    expect(result).toBeNull();
  });

  it('should throw UrlShortenerException on error', async () => {
    (query as jest.Mock).mockRejectedValue(new Error('DynamoDB Error'));

    await expect(
      getUrlDataByOriginalUrl('https://example.com')
    ).rejects.toThrow(UrlShortenerException);
    await expect(
      getUrlDataByOriginalUrl('https://example.com')
    ).rejects.toThrow('Failed to fetch url data');
  });
});
