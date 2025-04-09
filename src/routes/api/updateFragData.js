// src/routes/api/updateFragData.js
// localhost:8080/v1/fragments PUT endpoint
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  // Load environment variables for API_URL
  logger.info('PUT::Received request at PUT /v1/fragments/:id');
  logger.info(`DEBUG: req.body type=${typeof req.body}`);
  const API_URL = process.env.API_URL || req.headers.host;

  // moved variables outside to catch different errors
  const ownerId = req.user;
  const fragId = req.params.id;
  let fragment;
  let type;
  let fragmentData;
  let buffsize;
  // Check if fragment exists
  try {
    fragment = await Fragment.byId(ownerId, fragId);
  } catch (err) {
    logger.error(`No fragment exists with OwnerID ${ownerId} and ID ${fragId}. Error: ${err}`);
    return res.status(404).json(createErrorResponse(404, 'No such fragment exists :\'('));
  }

  try {
    ({ type } = contentType.parse(req));

    // throw error if does not match the existing fragment's type
    if (fragment.mimeType !== type) {
      logger.error(`A fragment's type ${fragment.mimeType} can not be changed after it is created: ${type}`);
      return res.status(400).json({ error: 'A fragment\'s type can not be changed after it is created, haha you goofy' });
    }

    // Read the posted fragment text from the request body    
    if (fragment.mimeType === 'application/json') {
      fragmentData = req.body; // Store as an object, don't stringify
    } else {
      if (Buffer.isBuffer(req.body)) {
        fragmentData = req.body;
      }
    }

    // calculate the size of the fragmentText
    buffsize = Buffer.byteLength(
      type === 'application/json' ? JSON.stringify(fragmentData) : fragmentData
    );
    // setData updates size, and updated property, while also writing fragment DATA to S3
    await fragment.setData(fragmentData);
    // this saves the fragment metadata to DynamoDB
    await fragment.save();
    const location = `${API_URL}/v1/fragments/${fragment.id}`;

    res
      .status(200)
      .setHeader('Location', location)
      .setHeader('Content-Type', fragment.mimeType)
      .setHeader('Content-Length', buffsize)
      // .send(fragment);
      .json(
        createSuccessResponse({
          // status: 'ok',
          // TODO: change me
          fragment: fragment,
        })
      );
  } catch (err) {
    logger.error(`Error setting fragment data: ${err}`);
    return res.status(500).json(createErrorResponse(500, 'Unable to set Fragment data'));
  }
};
