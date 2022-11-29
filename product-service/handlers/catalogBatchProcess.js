const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();
const sns = new AWS.SNS();
const CREATE_PRODUCT_LAMBDA = `${process.env.SERVICE_PREFIX}-createProduct`;

const createProductNotification = async (product) => {
  try {
    await sns
      .publish(
        {
          Subject: 'Product creation',
          Message: JSON.stringify(product),
          TopicArn: process.env.SNS_ARN,
        },
        (error) => {
          if (error) throw error;
        }
      )
      .promise();
  }
  catch (error) {
    return JSON.stringify(error);
  }
};

module.exports.catalogBatchProcess = async (event) => {
  try {
    const records = event.Records;

    for (const record of records) {
      const params = {
        FunctionName: CREATE_PRODUCT_LAMBDA,
        Payload: JSON.stringify(record),
      };

      await lambda.invoke(params).promise();
      createProductNotification(record.body);
    }
    return 'Completed';
  }
  catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
