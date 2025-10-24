export const environment = {
  production: true, // o false, según prefieras
  auth: {
    domain: 'dev-nx0rrhsrxpvmud46.us.auth0.com',
    clientId: 'w6k3ugMLjh7p1HwvcADBCP7idB8Jc7tH',
    redirectUri: window.location.origin,
    allowedList: [
      // Aquí puedes agregar las URLs de tus APIs protegidas
      // Ejemplo:
      // 'https://api.miapp.com/*'
    ],
  },
};
