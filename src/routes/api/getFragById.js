// src/routes/api/getFragById.js
// localhost:8080/v1/fragments/:id endpoint
// const { createSuccessResponse, createErrorResponse } = require('../../response');
const { createErrorResponse } = require('../../response');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const API_URL = process.env.API_URL || req.headers.host;
    const ownerId = req.user;
    const fragId = req.params.id;
    const fragment = await Fragment.byId(ownerId, fragId);
    fragment.data = await fragment.getData();
    const location = `${API_URL}/v1/fragments/${fragment.id}`;

    res.setHeader('Content-Type', fragment.mimeType);
    res.setHeader('Content-Length', Buffer.byteLength(fragment.data));
    res.setHeader('Location', location);
    logger.info("IN GET FRAG BY ID ROUTE")
    // logger.info(res.getHeader('Content-Type'));

    // If the fragment is a text-based type (e.g., JSON, text, markdown)
    const isText = /^text\/[a-zA-Z]+$/.test(fragment.mimeType);

    // If it's an image or other binary content
    const isImage = /^image\//.test(fragment.mimeType);

    if (isText) {
      // Send text-based content as a string
      res.status(200).send(fragment.data.toString());
    } else if (isImage) {
      // For image or binary data, send the data as-is (raw binary)
      res.status(200).send(fragment.data);
    } else {
      // For any other content type (e.g., application/json)
      res.status(200).json(JSON.parse(fragment.data.toString()));
    }
  } catch (err) {
    logger.error(`Error in GET /v1/fragments/:id: ${err.message}`);
    return res.status(404).json(createErrorResponse(404, err));
  }
};
