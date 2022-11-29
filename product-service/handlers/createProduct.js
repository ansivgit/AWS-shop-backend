'use strict';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
};

const createProduct = async (product) => {
  try {
    const response = await dynamo
      .put({
        TableName: process.env.PRODUCTS_TABLE_NAME,
        Item: product,
      })
      .promise();
    return response.Items;
  }
  catch(error) {
    return error;
  }
};

const addProductStock = async (productStock) => {
  try {
    const response = await dynamo
      .put({
        TableName: process.env.STOCKS_TABLE_NAME,
        Item: productStock,
      })
      .promise();
    return response.Items;
  }
  catch(error) {
    return error;
  }
};

module.exports.createProduct = async (event) => {
  try {
    const {title, description, image = '', price, count} = JSON.parse(event.body);
    const productId = AWS.util.uuid.v4();

    const newProduct  = {
      id: productId,
      title,
      description,
      image,
      price,
    };

    const stockNewProduct = {
      product_id: productId,
      count,
    };

    await createProduct(newProduct);
    await addProductStock(stockNewProduct);

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(newProduct),
    };
  }
  catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify(error),
    };
  }
};
