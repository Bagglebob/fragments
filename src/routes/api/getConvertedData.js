// src/routes/api/getConvertedData.js
const markdownit = require('markdown-it');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
// const { logger } = require('../../logger');
const { parse } = require('csv-parse/sync');
const yaml = require('js-yaml');
const sharp = require('sharp');
const md = new markdownit();
const removeMd = require('remove-markdown');
const { htmlToText } = require('html-to-text');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const fragId = req.params.id;
    const fileExt = req.params.ext;
    const fragment = await Fragment.byId(ownerId, fragId);
    fragment.data = await fragment.getData();
    // logger.info(fragment);

    let convertedData = fragment.data;
    // Markdown to .md, .html, .txt
    if (fragment.type === 'text/markdown') {
      if (fileExt === 'html') {
        // Convert Markdown to HTML
        convertedData = md.render(fragment.data.toString());
        fragment.type = 'text/html';
      } else if (fileExt === 'txt') {
        // Convert Markdown to plain text
        // convertedData = md.utils.escapeHtml(fragment.data.toString());
        convertedData = removeMd(fragment.data.toString());
        fragment.type = 'text/plain';
      }
      else if (fileExt === 'md') {
        convertedData = fragment.data.toString(); // Raw Markdown
        fragment.type = 'text/markdown';
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion of ${fragment.type} to .${fileExt}`));
      }
    }
    // HTML to .html, .txt
    else if (fragment.type === "text/html") {
      if (fileExt === 'html') {
        convertedData = fragment.data.toString();
        fragment.type = 'text/html';
      }
      else if (fileExt === 'txt') {
        convertedData = htmlToText(fragment.data.toString());
        fragment.type = 'text/plain';
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion of ${fragment.type} to .${fileExt}`));
      }
    }
    // CSV to .html, .json
    else if (fragment.type === "text/csv") {
      if (fileExt === 'csv') {
        convertedData = fragment.data.toString();
        fragment.type = 'text/csv';
      }
      else if (fileExt === 'txt') {
        convertedData = fragment.data.toString();
        fragment.type = 'text/plain';
      }
      else if (fileExt === 'json') {
        try {
          const records = parse(fragment.data.toString(), {
            // tells the parser to use the first row as the keys
            columns: true, // meaning that the first row should describe the data in the columns (name, age, etc.)
            skip_empty_lines: true
          });
          // JSON.stringify(value, replacer, space)
          convertedData = JSON.stringify(records, null, 2); // Indent each nested level by 2 spaces
          fragment.type = 'application/json';
        } catch (err) {
          return res.status(415).json(createErrorResponse(415, err.message));
        }
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion of ${fragment.type} to .${fileExt}`));
      }
    }
    // JSON to .json, .yaml, .yml, .txt
    else if (fragment.type === "application/json") {
      if (fileExt === 'json') {
        convertedData = fragment.data;
        fragment.type = 'application/json';
      } else if (fileExt === 'txt') {
        convertedData = JSON.stringify(fragment.data.toString());
        fragment.type = 'text/plain';
      }
      else if (fileExt === 'yaml' || fileExt === 'yml') {
        convertedData = yaml.dump(JSON.parse(fragment.data.toString()));
        fragment.type = 'application/yaml';
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion of ${fragment.type} to .${fileExt}`));
      }
    }
    // YAML to .yaml, .txt
    else if (fragment.type === "application/yaml") {
      if (fileExt === 'yaml') {
        convertedData = fragment.data;
        fragment.type = 'application/yaml';
      }
      else if (fileExt === 'txt') {
        convertedData = fragment.data.toString();
        fragment.type = 'text/plain';
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion of ${fragment.type} to .${fileExt}`));
      }
    }
    // IMAGES to .png, .jpg, .webp, .gif, .avif
    else if (fragment.type.startsWith("image/")) {
      if (fileExt === 'png') {
        convertedData = await sharp(fragment.data)
          .toFormat('png').toBuffer();
        fragment.type = 'image/png';
      }
      else if (fileExt === 'jpg') {
        convertedData = await sharp(fragment.data)
          .toFormat('jpg').toBuffer();
        fragment.type = 'image/jpg';
      }
      else if (fileExt === 'webp') {
        convertedData = await sharp(fragment.data)
          .toFormat('webp').toBuffer();
        fragment.type = 'image/webp';
      }
      else if (fileExt === 'gif') {
        convertedData = await sharp(fragment.data)
          .toFormat('gif').toBuffer();
        fragment.type = 'image/gif';
      }
      else if (fileExt === 'avif') {
        convertedData = await sharp(fragment.data)
          .toFormat('avif').toBuffer();
        fragment.type = 'image/avif';
      } else {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion of ${fragment.type} to .${fileExt}`));
      }
    }
    else {
      return res.status(415).json(createErrorResponse(415, `Unsupported type ${fragment.type}`));
    }

    res.setHeader('Content-Type', fragment.type);
    res.setHeader('Content-Length', Buffer.byteLength(fragment.data));

    res.status(200).send(convertedData);
  } catch (err) {
    return res.status(404).json(createErrorResponse(404, err.message));
  }
};
