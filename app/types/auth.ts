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

export interface DecodedToken {
  email: string;
  exp: number;
  iat: number;
  // autres champs du token si nécessaire
}

export interface AuthorizedUsersResponse {
  emails: string[];
} 