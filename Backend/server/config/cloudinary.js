import { v2 as cloudinary } from 'cloudinary';

import { env } from './env.js';

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isCloudinaryEnvConfigured() {
  if (isNonEmpty(process.env.CLOUDINARY_URL)) return true;
  return (
    isNonEmpty(process.env.CLOUDINARY_CLOUD_NAME) &&
    isNonEmpty(process.env.CLOUDINARY_API_KEY) &&
    isNonEmpty(process.env.CLOUDINARY_API_SECRET)
  );
}

//Safe config: no logging, no throws
 Consumers can check `isCloudinaryConfigured`.
if (isCloudinaryEnvConfigured()) {
  if (isNonEmpty(process.env.CLOUDINARY_URL)) {
    // Cloudinary SDK reads CLOUDINARY_URL automatically.
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      secure: true,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
} else {
  //In production, we still avoid throwing to keep the server booting.
  // Routes that require Cloudinary should fail explicitly when implemented.
  if (!env.isProd) {
    cloudinary.config({ secure: true });
  }
}

export const isCloudinaryConfigured = isCloudinaryEnvConfigured();
export { cloudinary };
