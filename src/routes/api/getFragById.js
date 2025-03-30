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
    // res.status(200).json(
    //   createSuccessResponse({
    //     // status: 'ok',
    //     fragment: fragment.toString(),
    //   })
    // );
    // Code ABOVE enveloped the data in a json object

    res.setHeader('Content-Type', fragment.mimeType);
    res.setHeader('Content-Length', Buffer.byteLength(fragment.data));
    res.setHeader('Location', location);
    logger.info("IN GET FRAG BY ID ROUTE")
    // logger.info(res.getHeader('Content-Type'));
    const re = /^text\/[a-zA-Z]+$/;
    re.test(fragment.type)
      ? res.status(200).send(fragment.data.toString())
      : // needs to parse because it is a buffer, which is converted to a string,
      // which then needs to be converted to a json object
      res.status(200).json(JSON.parse(fragment.data.toString()));
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err));
  }
};
