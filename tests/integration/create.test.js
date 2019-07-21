import { authenticateCognitoUser } from './getUserAuth';
global.fetch = require('node-fetch');
import { Auth, API } from "aws-amplify";
import Amplify from 'aws-amplify';
import config from './config';
import http from 'http';
import https from 'https';
import aws4 from 'aws4';
import util from 'util';
const requestPromise = util.promisify(https.request);

import AWS from 'aws-sdk';
AWS.config.region = 'ap-southeast-2';
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//   IdentityPoolId: 'ap-southeast-2:93f67058-34af-48ea-aa4d-866afc3381e2'
// });

const cognito = new AWS.CognitoIdentityServiceProvider();

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  API: {
    endpoints: [
      {
        name: "backend-v1",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION
      },
    ]
  }
});

describe('integration api test - create post', () => {
  test('test create', async () => {
    
    const username = 'testuser@example.com';
    const password = '#Testpass321';

    // Auth.configure(config);
    // const cognitoUser = await Auth.signIn(username, password);

    // console.log(cognitoUser);
    // API.configure(config);
    // let response;
    // try {
    //   response = await API.post("backend-v1", "/posts", {
    //     body: {
    //       data: {
    //         content: 'Integration test generation',
    //       },
    //     },
    //     headers: {
    //       Authorization: `${cognitoUser.signInUserSession.idToken.jwtToken}`,
    //     },
    //   });
    // } catch (error) {
    //   response = error;
    // }

    // console.log(response.response.data);
    // const result = await Auth.changePassword(cognitoUser, 'mypassword', 'mypassword');

    // console.log(cognitoUser);
    // console.log(response);
    // let authResult;
    // try {
    //   authResult = await authenticateCognitoUser();
    // } catch (error) {
    //   authResult = error;
    // }

    // console.log(authResult);
    // https://docs.aws.amazon.com/apigateway/api-reference/signing-requests/
    const auth = await cognito.adminInitiateAuth(
      {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
        ClientId: "3mdjs44cqn3drq8183fv66uli5",
        UserPoolId: 'ap-southeast-2_F3fx6pfBJ',
      }
    ).promise();
    // console.log(auth);

    const opts = {
      host: '022i33llf3.execute-api.ap-southeast-2.amazonaws.com',
      path: '/dev/posts',
      headers: {
        Authorization: auth.AuthenticationResult.IdToken,
        'Content-Type': 'application/json',
      }, 
      region: 'ap-southeast-2',
      method: 'POST',
      body: JSON.stringify({
        data: {
          content: 'Post content',
        },
      }),
    };

    await aws4.sign(opts);

    async function doRequest(opts) {
      console.log('Sending request');
      return new Promise(function (resolve, reject) {
        https.request(opts, function (error, res, body) {
          console.log('Got response');
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
      });
    }

    // async function request(o) {
    //   console.log('Starting request');
    //   console.log(o);

    //   const res = await https.request(o);
    //   console.log(res.data);
    //   res;
    // }
    
    await doRequest(opts);

    
    // // Force change password challenge
    // const challenge = await cognito.adminRespondToAuthChallenge(
    //   {
    //     ChallengeName: 'NEW_PASSWORD_REQUIRED',
    //     ChallengeResponses: {
    //       USERNAME: auth.ChallengeParameters.USER_ID_FOR_SRP,
    //       NEW_PASSWORD: '#Testpass321',
    //     },
    //     ClientId: "3mdjs44cqn3drq8183fv66uli5",
    //     UserPoolId: 'ap-southeast-2_F3fx6pfBJ',
    //     Session: auth.Session,
    //   }
    // ).promise();
  });
});

