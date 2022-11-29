const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const IMPORT_BUCKET = process.env.IMPORT_BUCKET;

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

const getSignedURL = async (bucket, fileName, expirySeconds) => {
  return s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: `uploaded/${fileName}`,
    Expires: expirySeconds,
    ContentType: 'text/csv',
  });
};

module.exports.importProductsFile = async (event) => {
  try {
    const fileName = event.queryStringParameters?.name;
    const signedUrl = await getSignedURL(IMPORT_BUCKET, fileName, 60);

    const response = {
      statusCode: 200,
      headers: headers,
      body: signedUrl
    };

    return response;
  }
  catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(error),
    };
  }
};
