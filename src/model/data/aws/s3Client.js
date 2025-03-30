// src/model/data/aws/s3Client.js

const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

/**
 * Gets AWS credentials
 * Necessary for testing or connecting to LocalStack or Minio
 * Not needed for deployment
 * @returns Object | undefined
 */
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      // Optionally include the AWS Session Token, too (e.g., if you're connecting to AWS from your laptop).
      // Not all situations require this, so we won't check for it above.
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
    logger.debug('Using extra S3 Credentials AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    return credentials;
  }
};


/**
 * If an AWS S3 Endpoint is configured in the environment, use it.
 * i.e. AWS_S3_ENDPOINT_URL=http://localhost:4566
 * @returns string | undefined
 */
const getS3Endpoint = () => {
  if (process.env.AWS_S3_ENDPOINT_URL) {
    logger.debug({ endpoint: process.env.AWS_S3_ENDPOINT_URL }, 'Using alternate S3 endpoint');
    return process.env.AWS_S3_ENDPOINT_URL;
  }
};

/**
 * Configure and export a new s3Client to use for all API calls.
 * we want to use this with AWS S3 and Minio/LocalStack for dev testing
*/
module.exports = new S3Client({
  // The region is always required
  region: process.env.AWS_REGION,
  // Credentials are optional (only MinIO needs them, or if you connect to AWS remotely from your laptop)
  credentials: getCredentials(),
  // The endpoint URL is optional
  endpoint: getS3Endpoint(),
  // We always want to use path style key names
  forcePathStyle: true,
});
