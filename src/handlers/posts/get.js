import AWS from "aws-sdk";
import { corsResponseHeaders } from '../../headers';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const main = async (event) => {
  try {
    const postId = event.pathParameters.id;

    const params = {
      TableName: process.env.tableName,
      Key: { postId },
    };

    const response = await dynamoDb.get(params).promise();

    if (typeof response.Item === 'undefined') {
      return {
        statusCode: 404,
        headers: corsResponseHeaders,
        body: JSON.stringify({
          errors: [
            {
              status: '404',
              title: 'NotFound',
              detail: `A post with id ${postId} does not exist.`,
            }
          ]
        })
      };
    }

    return {
      statusCode: 200,
      headers: corsResponseHeaders,
      body: JSON.stringify({ data: response.Item }),
    };
  } catch (error) {
    console.error(error);

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
