export const environment = {
  production: true,

  // URL pública del BACKEND en Render
  apiUri: 'https://ecommerce-backend.onrender.com',

  // Stripe (clave pública sí puede ir aquí)
  stripePublicKey: 'pk_test_51SZcQnB5nQdHrkcZBe4xF36k2jWH5YU3ZW9cSU4Q7NrSVY9iOP5RCw5ys7rCjFtnGt2GeIynRlPOicQcyjfh91zY00HExlMeiA',

  // Auth0
  auth: {
    domain: 'dev-nx0rrhsrxpvmud46.us.auth0.com',
    clientId: 'N7dm7HrIq2eta8RRhZ3x8aTzKDGp1p5y',
    audience: 'https://ecommerce-api',
    scope: 'openid profile email',

    // URL del FRONTEND en Render
    redirectUri: 'https://ecommerce-frontend.onrender.com',
  },

  // Endpoints permitidos para el interceptor
  allowedList: ['https://ecommerce-backend.onrender.com/api/*'],
};