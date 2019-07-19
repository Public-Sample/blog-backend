import AWS from 'aws-sdk';
import { fetchPoolUserByEvent } from '../../user';
import { corsResponseHeaders } from '../../headers';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const ACTION_LIKE = 'like';
const ACTION_UNLIKE = 'unlike';

const validate = (event) => {
  const errors = [];

  if (typeof event.queryStringParameters.action !== 'string') {
    errors.push({
      status: '400',
      title: 'BadRequest',
      detail: 'The `action` querystring value is required.',
    });
  } else {
    const action = event.queryStringParameters.action;

    if (action !== ACTION_LIKE && action !== ACTION_UNLIKE) {
      errors.push({
        status: '400',
        title: 'BadRequest',
        detail: `The 'action' querystring value must be one of ${ACTION_LIKE}, ${ACTION_UNLIKE}`,
      });
    }
  }

  return errors;
};

export const main = async (event) => {
  const errors = validate(event);

  if (errors.length > 0) {
    console.log(JSON.stringify(errors));

    return {
      statusCode: 400,
      headers: corsResponseHeaders,
      body: JSON.stringify({ errors })
    };
  }

  try {
    const postId = event.pathParameters.id;

    let action = '';
    if (event.queryStringParameters.action && typeof event.queryStringParameters.action === 'string') {
      action = event.queryStringParameters.action;
    }

    let updateExpression;

    switch (action) {
      case ACTION_LIKE:
        updateExpression = 'ADD likedBy :likedBy';
        break;
      case ACTION_UNLIKE:
        updateExpression = 'DELETE likedBy :likedBy';
        break;
    }

    const user = await fetchPoolUserByEvent(event);

    const params = {
      TableName: process.env.tableName,
      Key: { postId },
      UpdateExpression: updateExpression,            
      ExpressionAttributeValues: {
        ':likedBy': dynamoDb.createSet([user.Username])             
      },
      ReturnValues: 'ALL_NEW',
    };

    await dynamoDb.update(params).promise();

    return {
      statusCode: 204,
      headers: corsResponseHeaders,
      body: JSON.stringify({ data: { postId, action }}),
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
