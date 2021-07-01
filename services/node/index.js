'use strict';

const express = require('express');

const PORT = 80;
const HOST = '0.0.0.0';

const app = express();
app.get('/', (req, res) => {
    res.json({
        "user_agent": process.env.npm_config_user_agent,
        "hostname": process.env.HOSTNAME,
        "aws_execution": process.env.AWS_EXECUTION_ENV,
        "aws_region": process.env.AWS_REGION
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);