// src/routes/api/get.js
// localhost:8080/v1/fragments endpoint
const { createSuccessResponse, createErrorResponse } = require('../../response');
// const { logger } = require('../../logger');
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // console.log(req);
    const ownerId = req.user;
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(ownerId, expand);

    res.status(200).json(
      createSuccessResponse({
        // status: 'ok',
        fragments: fragments,
      })
    );
  } catch (err) {
    createErrorResponse(404, err);
  }
};
