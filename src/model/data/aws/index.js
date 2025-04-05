// This file writes/reads DATA to S3
// OR
// writes/reads METADATA from DynamoDB
// fragments\src\model\data\aws\index.js
// import s3 client 
const s3Client = require('./s3Client');

// import to configure client
const ddbDocClient = require('./ddbDocClient');
// DynamoDb Imports
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
// S3 imports
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

// Writes a fragment to DynamoDB. Returns a Promise.
// uses PUT so we dont have to decide between UPDATE or ADD
// UPDATE/ADD would require us to check if item exists.
function writeFragment(fragment) {
  // Configure our PUT params, with the name of the table and item (attributes and keys)
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  // Create a PUT command to send to DynamoDB
  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

// Reads a fragment from DynamoDB (GET). Returns a Promise<fragment|undefined>
async function readFragment(ownerId, id) {
  // Configure our GET params, with the name of the table and key (partition key + sort key)
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a GET command to send to DynamoDB
  const command = new GetCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);

    // If we get back an item (fragment), we'll return it.  
    // Otherwise we'll return `undefined`.
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}


// Writes a fragment's data to an S3 Object in a Bucket 
// (uses PUT, see writeFragment comments)
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Key is a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // PUT command sends data to a bucket, 
  // needs to be configured with the bucket name, a key, and the data
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}
/**
* Convert a stream of data into a Buffer
* Collects chunks of data until finished, then reassemble into array
* @returns Promise
 */
// TODO: rewrite your Express code to pipe the stream to res!!! 
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new `data` is available,
    // if there's an `error`, and when we're at the `end`
    // of the stream. (Week 11 Part 1, 55 minutes in)

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });


/**
* S3 GET command retrieves an object from a bucket, 
* and needs to be configured with the bucket's name and an object's key
* @returns Promise from streamToBuffer()
 */
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragments
// Returns a Promise<Array<Fragment>|Array<string>|undefined>
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    // Specify that we want to get all items where the ownerId is equal to the
    // `:ownerId` that we'll define below in the ExpressionAttributeValues.
    KeyConditionExpression: 'ownerId = :ownerId',
    // Use the `ownerId` value to do the query
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // A projection expression identifies the attributes that you want. 
  // To retrieve a single attribute, specify its name.
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // since we are querying DynamoDB we will only get METADATA
  const command = new QueryCommand(params);
  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);

    // If we haven't expanded to include all attributes, remap this array
    // to include only ids
    return !expand ? data?.Items.map((item) => item.id) : data?.Items
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}

// UPDATED: uses S3 and DynamoDB
// Delete a fragment's METADATA from DynamoDB and DATA from S3. Returns a Promise
async function deleteFragment(ownerId, id) {
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const dynamoParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id }
  };
  // Create a DELETE Object command
  const s3DeleteCommand = new DeleteObjectCommand(s3Params);
  const dynamoDeleteCommand = new DeleteCommand(dynamoParams);
  try {
    // Use our client to send the command
    await s3Client.send(s3DeleteCommand);
    await ddbDocClient.send(dynamoDeleteCommand)
  } catch (err) {
    logger.error({ err, ...s3Params }, 'Error DELETING fragment data from S3');
    logger.error({ err, ...dynamoParams }, 'Error DELETING fragment METADATA from DYNAMODB');
    throw new Error('Unable to DELETE fragment data and metadata');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
