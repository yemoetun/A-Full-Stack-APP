import { S3Client } from "@aws-sdk/client-s3";

let s3: S3Client;

export function getS3(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3;
}

export function getPublicFileUrl(storageKey: string): string {
  return `${process.env.R2_PUBLIC_URL}/${storageKey}`;
}
