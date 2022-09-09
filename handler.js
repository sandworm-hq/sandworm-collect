'use strict';

const { MongoClient, ServerApiVersion } = require('mongodb');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const clientPromise = new MongoClient(
  `mongodb+srv://${process.env.AWS_ACCESS_KEY_ID}:${encodeURIComponent(
    process.env.AWS_SECRET_ACCESS_KEY
  )}@sandwormdb.pafv8.mongodb.net/?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority&authMechanismProperties=AWS_SESSION_TOKEN:${encodeURIComponent(
    process.env.AWS_SESSION_TOKEN
  )}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  }
).connect();

module.exports.ingest = async (event) => {
  try {
    const client = await clientPromise;
    const collection = client.db('permissions').collection('raw');

    await collection.insertMany(
      JSON.parse(event.body).map((item) => ({ ...item, timestamp: Date.now() }))
    );

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
