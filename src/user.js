import AWS from "aws-sdk";

const cognito = new AWS.CognitoIdentityServiceProvider();

export const fetchPoolUserByEvent = async (event) => {
  const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
  
  const parts = authProvider.split(':');
  const userPoolUserId = parts[parts.length - 1];

  const user = await cognito.adminGetUser({
    UserPoolId: process.env.userPoolId,
    Username: userPoolUserId,
  }).promise();

  return user;
}
