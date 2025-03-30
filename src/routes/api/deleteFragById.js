// src/routes/api/deleteFragById.js
const { createErrorResponse } = require('../../response');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const fragId = req.params.id;
    // check if fragment exists (idk if this is necessary)
    // const fragment = await Fragment.byId(ownerId, fragId);
    // Delete the fragment data from S3
    await Fragment.delete(ownerId, fragId);

    res.status(200).json({
      message: 'Fragment deleted successfully',
      fragmentId: fragId
    });

  } catch (err) {
    logger.error('Error deleting fragment:', err);
    res.status(404).json(createErrorResponse(404, err));
  }
};
