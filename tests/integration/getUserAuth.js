// import AWS from "aws-sdk";
global.fetch = require('node-fetch');

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');


const authenticate = async (poolData, username, authenticationDetails) => {
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username : username,
    Pool : userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  console.log('Calling authenticateUser');
  await cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      console.log('On success');
      console.log(result);
        var accessToken = result.getAccessToken().getJwtToken();
        
        /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer*/
        var idToken = result.idToken.jwtToken;

        return {accessToken, idToken};
    },

    onFailure: function(err) {
      console.log('On error');

      console.log(err);
        throw err;
    },

    newPasswordRequired: function(err) {
      console.log('On new password required');

      console.log(err);

      throw err;
    }
  });
};

export const authenticateCognitoUser = async () => {
  const username = 'testuser@example.com';
  const password = '#Mytest123';
  
  const authenticationData = {
    Username : username,
    Password : password,
  };

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  const poolData = {
    UserPoolId : 'ap-southeast-2_F3fx6pfBJ',
    ClientId : '3mdjs44cqn3drq8183fv66uli5'
  };

  console.log('Calling authenticate');

  try {
    return await authenticate(poolData, username, authenticationDetails);

  } catch (error) {
    console.error(error);

    throw error;
  }
};