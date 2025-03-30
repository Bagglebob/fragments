// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const rawBody = require('../../middleware/rawBody');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

// Get a fragment's data converted to a supported type
router.get('/fragments/:id.:ext', require('./getConvertedData'));

// Get a specific fragment by ID
router.get('/fragments/:id', require('./getFragById'));

// Get a specific fragment by ID
router.delete('/fragments/:id', require('./deleteFragById'));

// Get a fragment's metadata by ID
router.get('/fragments/:id/info', require('./getMetadataById'));

// Other routes (POST, DELETE, etc.) will go here later on...
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
