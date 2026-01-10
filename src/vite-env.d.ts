/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts?: {
      oauth2?: {
        initTokenClient: (options: {
          client_id: string;
          scope: string;
          callback: (response: google.accounts.oauth2.TokenResponse) => void;
        }) => google.accounts.oauth2.TokenClient;
      };
      id?: {
        initialize: (options: {
          client_id: string;
          callback: (response: google.accounts.id.CredentialResponse) => void;
        }) => void;
        renderButton: (
          container: HTMLElement,
          options: {
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "large" | "medium" | "small";
            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
            shape?: "rectangular" | "pill" | "circle" | "square";
          }
        ) => void;
      };
    };
  };
}

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        expires_in: number;
        token_type: string;
        scope: string;
        error?: string;
        error_description?: string;
      }

      interface TokenClient {
        requestAccessToken: (options?: { prompt?: "" | "consent" | "none" }) => void;
      }
    }

    namespace id {
      interface CredentialResponse {
        credential: string;
        select_by?: string;
      }
    }
  }
}
