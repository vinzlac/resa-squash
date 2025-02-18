export interface TeamRAuthResponse {
  token: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    DOB: string;
  };
}

export interface TeamRAuthRequest {
  credentials: {
    email: string;
    password: string;
  };
  customId: string;
  deviceInfo: {
    os: string;
    model: string;
    brand: string;
    version: string;
  };
  coachAuthentication: boolean;
} 