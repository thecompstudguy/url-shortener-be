export default interface UrlDataDbRow {
  shortcode: string;
  originalUrl: string;
  creatorIpAddress: string;
  creatorUserId?: string;
  createdAt?: number;
  updatedAt?: number;
}
