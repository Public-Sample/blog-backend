import AWS from "aws-sdk";
import { corsResponseHeaders } from '../../headers';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const main = async (event) => {
  const params = {
    TableName: process.env.tableName,
  };

  try {
    const response = await dynamoDb.scan(params).promise();

    const items = response.Items;

    return {
      statusCode: 200,
      headers: corsResponseHeaders,
      body: JSON.stringify({ data: items })
    };
  } catch (error) {
    console.log(JSON.stringify(error));

    return {
      statusCode: 500,
      headers: corsResponseHeaders,
      body: JSON.stringify({
        errors: [
          {
            status: '500',
            title: 'InternalServerError',
            detail: error.message
          }
        ]
      })
    };
  }
};
