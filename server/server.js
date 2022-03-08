'use strict';

require('dotenv').config()
const http = require('http');
const pathUtils = require('path');
const express = require('express');

const HOSTNAME = process.env.CLIENT_HOSTNAME;
const PORT = process.env.CLIENT_PORT;

let app = express()
let appDir = pathUtils.resolve(__dirname, "../dist/");

app.use(express.static(appDir));

app.get('*', function (_req, res) {
    res.sendFile(pathUtils.resolve(appDir, 'index.html'));
});

http.createServer(app).listen(PORT, HOSTNAME, function () {
    console.log(`Serve start on http://${HOSTNAME}:${PORT}`);
});