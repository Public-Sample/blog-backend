import uuid from "uuid";
import AWS from "aws-sdk";
import { fetchPoolUserByEvent } from '../../user';
import { corsResponseHeaders } from '../../headers';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const isJson = (input) => {
  if (typeof input !== 'string') {
    return false;
  }

  try {
    JSON.parse(input);

    return true;
  } catch (error) {
    return false;
  }
};

export const main = async (event) => {
  try {
    const user = await fetchPoolUserByEvent(event);

    const params = {
      TableName: process.env.tableName,
      Key: {
        'userId': user.Username,
        'postId': event.pathParameters.id,
      },
    };

    const response = await dynamoDb.get(params).promise();

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
}
