import { environment } from '../environments/environment';

export const authConfig = {
  domain: environment.auth.domain,
  clientId: environment.auth.clientId,
  authorizationParams: {
    audience: environment.auth.audience,
    scope: environment.auth.scope,
    redirect_uri: window.location.origin,
  },
  httpInterceptor: {
    allowedList: environment.allowedList,
  },
};
