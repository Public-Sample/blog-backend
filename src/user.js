import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider();

export const fetchPoolUserByEvent = async (event, context) => {
  const identity = event.requestContext.identity;
  const { cognitoAuthenticationProvider } = identity;

  console.log(JSON.stringify(event));
  console.log(JSON.stringify(context));

  let userPoolUserId;

  const parts = cognitoAuthenticationProvider.split(':');
  userPoolUserId = parts[parts.length - 1];

  const user = await cognito.adminGetUser({
    UserPoolId: process.env.userPoolId,
    Username: userPoolUserId,
  }).promise();

  return user;
};
