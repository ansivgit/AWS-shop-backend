'use strict';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const headers = {
  "Access-Control-Allow-Origin": "*",
};

const getProductDescription = async (id) => {
  try {
    const product = await dynamo
      .get({
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Key: {
          id,
        },
      })
      .promise();
    return product?.Item;
  }
  catch(error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(error),
    };
  }
};

const getProductStock = async (id) => {
  try {
    const product = await dynamo
      .get({
        TableName: process.env.STOCKS_TABLE_NAME,
        Key: {
          product_id: id,
        },
      })
      .promise();
    return product?.Item;
  }
  catch(error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(error),
    };
  }
};

module.exports.getProductById = async (event) => {
  const { productId } = event.pathParameters;
  const productDescription = await getProductDescription(productId);
  const productStock = await getProductStock(productId);
  const newProduct = {...productDescription, count: productStock?.count};

  if (!productDescription)  {
    return {
      statusCode: 404,
      headers: headers,
      body: 'Product not found',
    }
  }

  return {
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(newProduct),
  };
};
