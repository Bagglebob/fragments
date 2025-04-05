// src/routes/api/getMetadataById.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
// const logger = require('../../logger');

module.exports = async (req, res) => {
  // logger.info('Get Request to :id/info');
  try {
    const API_URL = process.env.API_URL || req.headers.host;
    const ownerId = req.user;
    const fragId = req.params.id;
    const fragment = await Fragment.byId(ownerId, fragId);
    const fragData = await fragment.getData();
    const location = `${API_URL}/v1/fragments/${fragment.id}`;
    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Content-Length', Buffer.byteLength(fragData));
    res.setHeader('Location', location);
    res.status(200).json(createSuccessResponse(fragment));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err));
  }
};
