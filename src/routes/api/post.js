// src/routes/api/post.js
// localhost:8080/v1/fragments POST endpoint
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const yaml = require('js-yaml');

module.exports = async (req, res) => {
  // Load environment variables for API_URL
  logger.info('POST::Received request at POST /v1/fragments');
  logger.info(`DEBUG: req.body type=${typeof req.body}, value=${JSON.stringify(req.body).length < 100 ? JSON.stringify(req.body) : "buffer too long"}`);

  try {
    const API_URL = process.env.API_URL || req.headers.host;

    const ownerId = req.user;

    const { type } = contentType.parse(req);

    // throw error if not supported type
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`Unsupported Content-Type: ${type}`);
      return res.status(415).json({ error: 'Unsupported media type' });
    }

    // Read the posted fragment text from the request body    
    let fragmentData;
    if (type === 'application/json') {
      // check if valid json
      if (JSON.parse(req.body.toString())) {
        fragmentData = req.body;
      }
    }
    else if (type === 'application/yaml') {
      if (yaml.load(req.body.toString())) {
        fragmentData = req.body;
      }
    }
    else {
      if (Buffer.isBuffer(req.body)) {
        fragmentData = req.body;
      }
    }

    const isTextType = ['application/json', 'application/yaml'].includes(type);

    // calculate the size of the fragmentText
    const buffsize = Buffer.byteLength(
      isTextType ? JSON.stringify(fragmentData) : fragmentData
    );

    // If fragmentText is missing, return an error
    if (!fragmentData) {
      return res.status(400).json({ error: 'Fragment text is required' });
    }

    const fragment = new Fragment({ ownerId: ownerId, type: type, size: buffsize });
    await fragment.save();

    await fragment.setData(fragmentData);

    const location = `${API_URL}/v1/fragments/${fragment.id}`;
    logger.info('Content-Type', fragment.mimeType)
    res
      .status(201)
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
    logger.error({ err }, `Error processing POST /fragments`);
    // console.error('Error processing POST /fragments:', err);
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
