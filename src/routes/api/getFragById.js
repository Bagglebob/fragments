// src/routes/api/getFragById.js
// localhost:8080/v1/fragments/:id endpoint
// const { createSuccessResponse, createErrorResponse } = require('../../response');
const { createErrorResponse } = require('../../response');

// const { logger } = require('../../logger');
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const fragId = req.params.id;
    const fragment = await Fragment.byId(ownerId, fragId);
    fragment.data = await fragment.getData();
    // res.status(200).json(
    //   createSuccessResponse({
    //     // status: 'ok',
    //     fragment: fragment.toString(),
    //   })
    // );
    // Code ABOVE enveloped the data in a json object
    res.status(200).send(fragment.data.toString());
  } catch (err) {
    createErrorResponse(404, err);
  }
};
