export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    DOB: string;
    isAuthorized: boolean;
  };
}

export interface TeamRDecodedJwtToken {
  email: string;
  exp: number;
  iat: number;
  userId: string;
  customId: string;
  // autres champs du token si nécessaire
}

export interface AuthorizedUsersResponse {
  emails: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
} 