'use strict';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const headers = {
  "Access-Control-Allow-Origin": "*",
};

const scanTable = async (tableName) => {
  try {
    const table = await dynamo
      .scan({
        TableName: process.env[tableName],
      })
      .promise();
    return table?.Items;
  }
  catch(error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(error),
    };
  }
};

module.exports.getProductsList = async (event) => {
  const products = await scanTable('PRODUCTS_TABLE_NAME');
  const stocks = await scanTable('STOCKS_TABLE_NAME');

  if (!products || !products.length) {
    return {
      statusCode: 404,
      headers: headers,
      body: 'Something went wrong, trying later',
    }
  }

  if (!stocks || !stocks.length) {
    return {
      statusCode: 404,
      headers: headers,
      body: 'Stocks is unavailable, trying later',
    }
  }

  const joinedProductList = products?.map((product) => ({
    ...product,
    count: stocks?.find((stock) => stock.product_id === product.id)?.count || 0,
  }));

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(joinedProductList),
  };
};
