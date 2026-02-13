import { Injectable, OnModuleInit } from "@nestjs/common";
import { Client } from "minio";

@Injectable()
export class MinioService implements OnModuleInit {
  readonly client: Client;
  readonly bucketName: string;
  readonly signedUrlExpirySeconds: number;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET ?? "barbergo-dev";
    this.signedUrlExpirySeconds = Number(process.env.MINIO_SIGNED_URL_EXPIRY_SECONDS ?? 900);

    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: (process.env.MINIO_USE_SSL ?? "false") === "true",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin"
    });
  }

  async onModuleInit(): Promise<void> {
    if ((process.env.SKIP_MINIO_INIT ?? "false") === "true") {
      return;
    }
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName, process.env.MINIO_REGION ?? "us-east-1");
    }
  }

  async getPresignedUploadUrl(objectKey: string): Promise<{ object_key: string; url: string; expires_in: number }> {
    const url = await this.client.presignedPutObject(this.bucketName, objectKey, this.signedUrlExpirySeconds);
    return {
      object_key: objectKey,
      url,
      expires_in: this.signedUrlExpirySeconds
    };
  }

  async getPresignedDownloadUrl(objectKey: string): Promise<{ object_key: string; url: string; expires_in: number }> {
    const url = await this.client.presignedGetObject(this.bucketName, objectKey, this.signedUrlExpirySeconds);
    return {
      object_key: objectKey,
      url,
      expires_in: this.signedUrlExpirySeconds
    };
  }
}
