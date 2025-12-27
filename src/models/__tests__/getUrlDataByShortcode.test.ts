import { query } from 'lesgo/utils/dynamodb';
import getUrlDataByShortcode from '../getUrlDataByShortcode';
import UrlShortenerException from '../../exceptions/UrlShortenerException';

describe('models.getUrlDataByShortcode', () => {
  it('should return url data when found', async () => {
    const mockData = { shortcode: 'abcde', originalUrl: 'https://example.com' };
    (query as jest.Mock).mockResolvedValue([mockData]);

    const result = await getUrlDataByShortcode('abcde');

    expect(result).toEqual(mockData);
    expect(query).toHaveBeenCalledWith(
      'url-shortener-table-alias',
      'shortcode = :shortcode',
      { ':shortcode': 'abcde' }
    );
  });

  it('should return null when not found', async () => {
    (query as jest.Mock).mockResolvedValue([]);

    const result = await getUrlDataByShortcode('abcde');

    expect(result).toBeNull();
  });

  it('should throw UrlShortenerException on error', async () => {
    (query as jest.Mock).mockRejectedValue(new Error('DynamoDB Error'));

    await expect(getUrlDataByShortcode('abcde')).rejects.toThrow(
      UrlShortenerException
    );
    await expect(getUrlDataByShortcode('abcde')).rejects.toThrow(
      'Failed to fetch url data by shortcode'
    );
  });
});
