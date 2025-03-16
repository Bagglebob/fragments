// src/routes/api/getMetadataById.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
// const { logger } = require('../../logger');

module.exports = async (req, res) => {
  // logger.info('Get Request to :id/info');
  try {
    const ownerId = req.user;
    const fragId = req.params.id;
    const fragment = await Fragment.byId(ownerId, fragId);
    const fragData = await fragment.getData();
    // logger.info(fragment);
    // console.log('FRAGMENT METADATA:', fragment);
    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Content-Length', Buffer.byteLength(fragData));

    res.status(200).send(fragment);
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err));
  }
};
