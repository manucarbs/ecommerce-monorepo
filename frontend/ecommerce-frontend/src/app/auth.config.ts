import { environment } from '../enviroments/environment';

export const authConfig = {
  domain: environment.auth.domain,
  clientId: environment.auth.clientId,
  authorizationParams: {
    redirect_uri: environment.auth.redirectUri,
  },
  httpInterceptor: {
    allowedList: environment.auth.allowedList || [],
  },
};
