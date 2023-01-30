import S3 from "aws-sdk/clients/s3";
import randToken from "rand-token";
import sharp from "sharp";

interface Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export class ImageService {
  private config: Config;
  private s3: S3;

  constructor(config: Config) {
    this.config = config;
    this.s3 = new S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    });
  }

  async upload(base64: string): Promise<string> {
    const uri = base64.split(";base64,").pop() as string;
    const buffer = Buffer.from(uri, "base64");
    const resizedBuffer = await sharp(buffer)
      .resize({
        width: 256,
        height: 256,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    const key = randToken.generate(16);

    const { Location } = await this.s3
      .upload({
        Bucket: this.config.bucket,
        Key: key,
        Body: resizedBuffer,
        ACL: "public-read",
      })
      .promise();
    return Location;
  }

  async uploadImageForPage(base64: string): Promise<string> {
    const uri = base64.split(";base64,").pop() as string;
    const buffer = Buffer.from(uri, "base64");

    const key = randToken.generate(16);

    const { Location } = await this.s3
      .upload({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ACL: "public-read",
      })
      .promise();
    return Location;
  }
}
