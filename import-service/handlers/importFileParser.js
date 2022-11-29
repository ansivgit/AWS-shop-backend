const AWS = require('aws-sdk');
const csvParser = require('csv-parser');

const s3 = new AWS.S3();
const sqs = new AWS.SQS();

const IMPORT_BUCKET = process.env.IMPORT_BUCKET;
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

const sendRecordToSqs = async (record) => {
  try {
    await sqs
      .sendMessage(
        {
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(record),
        },
        (error) => {
          if (error) {
            throw error;
          }
        }
      )
      .promise();
  } catch (error) {
    return JSON.stringify(error);
  }
};

module.exports.importFileParser = async (event) => {
  try {
    for (const file of event.Records) {
      const key = file.s3.object.key;

      const s3Stream = s3.getObject({
        Bucket: IMPORT_BUCKET,
        Key: key,
      }).createReadStream();

      await new Promise((resolve, reject) => {
        s3Stream.pipe(csvParser())
          .on('data', async (record) => {
            console.log('record2', JSON.stringify(record));
            if (data) await sendRecordToSqs(record);
          })
          .on('end', async () => {
            console.log(`${key} file parsed`);

            await s3.copyObject({
              Bucket: IMPORT_BUCKET,
              CopySource: `${IMPORT_BUCKET}/${key}`,
              Key: key.replace('uploaded', 'parsed'),
            }).promise();

            await s3.deleteObject({ Bucket: IMPORT_BUCKET, Key: key }).promise();

            resolve();
          })
          .on('error', (error) => {
            console.log(error);
            reject(error);
          });
      })
    }

    return {
      statusCode: 200,
      headers
    };
  }
  catch (error) {
    console.log('importFileParser error', error);

    return {
      statusCode: 500,
      headers,
      body: error?.message,
    };
  };
};
