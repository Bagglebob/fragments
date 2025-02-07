// src/routes/api/post.js
// localhost:8080/v1/fragments POST endpoint
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// POST /fragments creates a fragment
// (only plain text support required at this point), with unit tests.
// See 4.3.
module.exports = async (req, res) => {
  // Load environment variables for API_URL
  try {
    logger.info('✅ Received request at POST /v1/fragments');
    const API_URL = process.env.API_URL || req.headers.host;

    const ownerId = req.user;
    logger.info(ownerId);

    const { type } = contentType.parse(req);

    // throw error if not supported type
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`Unsupported Content-Type: ${type}`);
      return res.status(415).json({ error: 'Unsupported media type' });
    }

    // check that req.body is buffer
    // if (!Buffer.isBuffer(req.body)) {
    //   console.error('Request body is not a valid Buffer.');
    //   return res.status(400).json({ error: 'Invalid request body' });
    // }

    // Read the posted fragment text from the request body
    const fragmentText = Buffer.from(req.body);
    // calculate the size of the fragmentText
    const buffsize = Buffer.byteLength(fragmentText);
    // If fragmentText is missing, return an error
    if (!fragmentText) {
      return res.status(400).json({ error: 'Fragment text is required' });
    }

    const fragment = new Fragment({ ownerId: ownerId, type: type, size: buffsize });
    await fragment.save();
    await fragment.setData(req.body);
    const location = `${API_URL}/v1/fragments/${fragment.id}`;

    res
      .status(201)
      .setHeader('Location', location)
      // .send(fragment);
      .json(createSuccessResponse(fragment));
  } catch (err) {
    console.error('Error processing POST /fragments:', err);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
