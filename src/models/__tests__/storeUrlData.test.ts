import { putRecord } from 'lesgo/utils/dynamodb';
import storeUrlData from '../storeUrlData';
import UrlShortenerException from '../../exceptions/UrlShortenerException';

describe('models.storeUrlData', () => {
  it('should store url data successfully', async () => {
    const mockData = {
      shortcode: 'abcde',
      originalUrl: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    (putRecord as jest.Mock).mockResolvedValue(mockData);

    const result = await storeUrlData(mockData);

    expect(result).toEqual(mockData);
    expect(putRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockData,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      }),
      'url-shortener-table-alias'
    );
  });

  it('should throw UrlShortenerException on error', async () => {
    const mockData = {
      shortcode: 'abcde',
      originalUrl: 'https://example.com',
      creatorIpAddress: '127.0.0.1',
    };
    (putRecord as jest.Mock).mockRejectedValue(new Error('DynamoDB Error'));

    await expect(storeUrlData(mockData)).rejects.toThrow(UrlShortenerException);
    await expect(storeUrlData(mockData)).rejects.toThrow(
      'Failed to store url data'
    );
  });
});
