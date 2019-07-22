### Sample Full Stack Project

#### Design & Solution
To satisfy the user's functional requirements, and to keep to best practices, the application is divided into a frontend, backend and data layer. The entire stack is hosted and can be managed within the AWS platform.

- `As a hamster, I want to sign up to a platform so I can connect with other the hamsters on the network`

This requirement is solved by the use of Cognito in the backend being called via Amplify in the frontend. The user is able to submit personal details and choose a password. Further into the process, the user is then asked to confirm their email address. After signup an entry will exist in the user pool, this can then be used later on for authentication and authorisation.

- `As a social hamster, I want to be able to share posts with hamsters in the network`
- `As a social hamster I want the hamsters in the network to like my posts`

These requirements are satisfied by allowing the user to create 'blog' resources (stored as documents in DynamoDB), which are 'owned' by the user that created them, but can be 'liked' by other users (by adding their userId to an attribute on the document). These operations are all done via a restful api.

#### Technical and Architectural Choice
Given the need for the successful full stack developer to use react and nodejs, I decided to make use of the AWS platform, and develop by using the react create app and serverless frameworks. To save time and avoid reinventing the wheel, I made significant use of the serverless-stack templates. I have previously developed using Serverless & AWS (including node as the lambda runtime), so this also made sense to choose for a refresher. Even better, the AWS hosting is currently in the 'free' tier, so cost is minimal for now.

I also considered using Nginx and EC2(NodeJS/Express) but felt that there would be less configuration for the setup as opposed to entirely using serverless. By also utilising Cognito, all the required technologies would remain with a single vendor (though there are advantages and disadvantages for this, eg support). Still, other providers can be utilised within the serverless framework. I have more experience with PHP/MySQL so there was also the opportunity for further learning.

Generally I try to conform my APIs somewhat closely to REST conventions, JSON API (https://jsonapi.org/format/) and implement JSON schema (https://json-schema.org/) which works well with Ajv.

React-bootstrap is used on the frontend to allow for a more adaptive layout.

#### Tradeoffs
When executing a deployment with serverless, code is packaged locally, and then uploaded to S3 in conjunction with CloudFormation invocation. This can all add up and can mean slower development if a developer is deploying in order to test what they're writing. This can be alleviated with local tests (or using the serverless offline plugin), though still, there can be overheads. The advantages of most of the AWS technologies is they either allow for automated horizontal scale, or must be written in such a way which works well with partitioning and sharding.

#### What's Not Done / Getting Production Ready
- SSL not yet setup, network communication is unencrypted
- Config should be filled via environment CI or via a stage specific service, eg s3
- MobX/Redux state management is not implemented. This would almost certainly be required for a production app.
- Only minimal tests included. Ideally coverage would be approx 90%+ with use of mocks, drop in replacements such as proxyquire and http interceptors such as nock.
- XSS, react string escapes much of the output, but this would need to be properly checked.
- Beautifucation/CSS, UI/UX review and fine tuning
- Serverless-IAM permissions need to be locked down further
- Use of DynamoDB scan operation is slow, this should be addressed by using a global secondary index or changing the design, or selecting a different database technology.
- Lambda: Layers should be utilised to reduce lambda deployment size
- Serverless build optimisation, use https://www.npmjs.com/package/serverless-build-plugin to reduce package size
- Strongly consider using Typescript
- Sorting/filter/pagination on backend api endpoints
- Browser compatiblity testing
- Add documentation generator, eg swagger (works well with JSON Schema)
- Currently the user particulars in the UI is just a userId whereas the would typically be a full name or email address. This detail should either be captured and managed via cognito user pools, within the app as a document in the db, or both. Though only one should be used as a source of truth.
- Styling, css and image usage on the frontend

Changes:
- Fixed an issue with storage and access of post documents
- Fixed an issue with state propagation 
- Started on integration tests against the backend api, work in progress pushed onto branch 'changes'
-- Involves making http requests against api-gateway
-- Attempted to make use of amplify, though this is targetted at web clients and though works in node, I haven't yet been able to get it to pass through identity provider config in the request headers, or the authorizer claims.
-- I was able to use cognito to generate the authorization token, and then sign the request using aws4
but was again experiencing issues with the lambda passthrough

#### Done Differently
- Lambda is a solid choice for horizontally scaled processing however, in this instance, it has added a lot of extra time cost as during experimental development the function must be packaged and deployed for testing. The serverless-offline test module isn't fully able to replicate the AWS environment properly to alleviate this.

If undertaking or extending this project, I'd consider constructing a docker container with nginx, mongo and replacing the frontend's auth with a social provider.

#### Hosted App
d1aljryb3xijfm.cloudfront.net
http://preface-frontend.s3-website-ap-southeast-2.amazonaws.com

CREATE POST
```
npx aws-api-gateway-cli-test \
--username='redacted' \
--password='redacted' \
--user-pool-id='ap-southeast-2_DmnyQTQw6' \
--app-client-id='3lub30cgufu4he9r42q7a8vuh' \
--cognito-region='ap-southeast-2' \
--identity-pool-id='ap-southeast-2:73e57f2f-51c3-40d5-8b4a-8c4e7bce226c' \
--invoke-url='https://3hrthhg4n5.execute-api.ap-southeast-2.amazonaws.com/dev' \
--api-gateway-region='ap-southeast-2' \
--path-template='/posts' \
--method='POST' \
--body='{"content":"hello world"}'
```

LIST POSTS
```
npx aws-api-gateway-cli-test \
--username='redacted' \
--password='redacted' \
--user-pool-id='ap-southeast-2_DmnyQTQw6' \
--app-client-id='3lub30cgufu4he9r42q7a8vuh' \
--cognito-region='ap-southeast-2' \
--identity-pool-id='ap-southeast-2:73e57f2f-51c3-40d5-8b4a-8c4e7bce226c' \
--invoke-url='https://3hrthhg4n5.execute-api.ap-southeast-2.amazonaws.com/dev' \
--api-gateway-region='ap-southeast-2' \
--path-template='/posts' \
--method='GET'
```

LIKE
```
npx aws-api-gateway-cli-test \
--username='redacted' \
--password='redacted' \
--user-pool-id='ap-southeast-2_DmnyQTQw6' \
--app-client-id='3lub30cgufu4he9r42q7a8vuh' \
--cognito-region='ap-southeast-2' \
--identity-pool-id='ap-southeast-2:73e57f2f-51c3-40d5-8b4a-8c4e7bce226c' \
--invoke-url='https://3hrthhg4n5.execute-api.ap-southeast-2.amazonaws.com/dev' \
--api-gateway-region='ap-southeast-2' \
--path-template='/posts/3a869e70-a08b-11e9-a2df-a3638694fd15' --method='PATCH' \
--additional-params "{\"queryParams\":{\"action\":\"like\"}}"
```

UNLIKE
```
npx aws-api-gateway-cli-test \
--username='redacted' \
--password='redacted' \
--user-pool-id='ap-southeast-2_DmnyQTQw6' \
--app-client-id='3lub30cgufu4he9r42q7a8vuh' \
--cognito-region='ap-southeast-2' \
--identity-pool-id='ap-southeast-2:73e57f2f-51c3-40d5-8b4a-8c4e7bce226c' \
--invoke-url='https://3hrthhg4n5.execute-api.ap-southeast-2.amazonaws.com/dev' \
--api-gateway-region='ap-southeast-2' \
--path-template='/posts/3a869e70-a08b-11e9-a2df-a3638694fd15' --method='PATCH' \
--additional-params "{\"queryParams\":{\"action\":\"unlike\"}}"
```

#### Frontend
```
cd preface-frontend
yarn start
npm run build
aws s3 sync build/ s3://preface-frontend
```

#### Environment
```
Serverless ~1.47.0
Node ~8.10 (Lambda runtime)
```
