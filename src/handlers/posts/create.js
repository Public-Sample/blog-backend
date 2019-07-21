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

const validate = (event) => {
  const { body } = event;
  const errors = [];

  if (!isJson(body)) {
    errors.push({
      status: '400',
      title: 'BadRequest',
      detail: 'Request body is empty or invalid json',
    });

    return errors;
  }

  const parsed = JSON.parse(body);
console.log(JSON.stringify(parsed));
  if (typeof parsed.data === 'undefined' || typeof parsed.data.content !== 'string') {
    errors.push({
      status: '400',
      title: 'BadRequest',
      detail: 'The `content` property must be provided.',
    });
  }

  return errors;
};

export const main = async (event, context) => {
  const errors = validate(event);

  if (errors.length > 0) {
    return {
      statusCode: 400,
      headers: corsResponseHeaders,
      body: JSON.stringify({ errors }),
    };
  }

  try {
    const parsedBody = JSON.parse(event.body);

    const user = await fetchPoolUserByEvent(event, context);

    const params = {
      TableName: process.env.tableName,
      Item: {
        authorId: user.Username,
        postId: uuid.v4(),
        content: parsedBody.data.content,
        createdAt: Date.now()
      }
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      headers: corsResponseHeaders,
      body: JSON.stringify(params.Item)
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
            detail: error.message,
          }
        ]
      })
    };
  }
};
