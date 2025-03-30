// src/model/data/index.js

// module.exports = require('./memory');
// Code to pick the appropriate back-end data strategy
// If the environment sets an AWS Region, we'll use AWS S3 or DynamoDB
module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');

