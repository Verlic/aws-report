'use strict';

const AWS = require('aws-sdk');

AWS.config.region = process.env['AWS_DEFAULT_REGION'] || 'us-west-1';

const awsReport = {
  pricing: require('./pricing'),
  scan: require('./scan'),
  bills: require('./bills'),
};

module.exports = awsReport;
