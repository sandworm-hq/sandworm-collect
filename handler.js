'use strict';

const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ddb = new AWS.DynamoDB();

module.exports.ingest = async (event) => {
  try {
    await ddb
      .batchWriteItem({
        RequestItems: {
          CollectedPermissions: JSON.parse(event.body).map((item) => ({
            PutRequest: {
              Item: AWS.DynamoDB.Converter.marshall({
                ...item,
                uuid: uuidv4(),
                timestamp: Date.now(),
              }),
            },
          })),
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
