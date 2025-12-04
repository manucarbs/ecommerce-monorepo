export const environment = {
  production: false,
  apiUri: 'http://localhost:8080',
  stripePublicKey:'pk_test_51SZcQnB5nQdHrkcZBe4xF36k2jWH5YU3ZW9cSU4Q7NrSVY9iOP5RCw5ys7rCjFtnGt2GeIynRlPOicQcyjfh91zY00HExlMeiA',
  auth: {
    domain: 'dev-4gecgtusfuow1ic0.us.auth0.com',
    clientId: 'RBCZ6RAdWEDIoPHyHC4NT2oIQ1Dcb1xB',
    audience: 'https://ecommerce-api',
    scope: 'openid profile email',
  },
  allowedList: ['http://localhost:8080/api/*'],
};
