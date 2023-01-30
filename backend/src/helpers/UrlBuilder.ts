interface Config {
  frontendExternalBaseUrl: string; // http://example.com
  imageBucketUrl: string; // http://example.com/
}

export class UrlBuilder {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getFrontendBaseUrl(): string {
    return this.config.frontendExternalBaseUrl;
  }

  getImageBucketUrl(): string {
    return this.config.imageBucketUrl;
  }

  getAddReviewUrl(token: string): string {
    return `${this.config.frontendExternalBaseUrl}/review/${token}`;
  }

  getViewReviewUrl(
    companyId: string,
    reviewId: string,
    autoLoginToken?: string
  ): string {
    let autoLoginParam = "";
    if (autoLoginToken) {
      autoLoginParam = `?confirmationToken=${autoLoginToken}`;
    }
    return `${this.config.frontendExternalBaseUrl}/company/${companyId}#${reviewId}${autoLoginParam}`;
  }
}
