const express = require('express');
const app = express();

// Set the root path for serving static files
app.use(express.static('public')); //