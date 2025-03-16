// src/routes/api/getConvertedData.js
const markdownit = require('markdown-it');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
// const { logger } = require('../../logger');

const md = new markdownit();

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const fragId = req.params.id;
    const fileExt = req.params.ext;
    const fragment = await Fragment.byId(ownerId, fragId);
    fragment.data = await fragment.getData();
    // logger.info(fragment);

    let convertedData = fragment.data;
    if (fileExt === 'html' && fragment.type === 'text/markdown') {
      // Convert Markdown to HTML
      convertedData = md.render(fragment.data.toString());
      fragment.type = 'text/html';
    }

    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Content-Length', Buffer.byteLength(fragment.data));

    res.status(200).send(convertedData);
  } catch (err) {
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
