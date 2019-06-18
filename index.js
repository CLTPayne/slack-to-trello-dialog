require('dotenv').config();

const bodyParser = require('body-parser');
const qs = require('qs');
const express = require('express');
const app = express();

// Parse urlencoded bodies with the qs library
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());