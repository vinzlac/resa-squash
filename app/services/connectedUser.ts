import { USER_ID } from './config';

class ConnectedUser {
  private static instance: ConnectedUser;
  private _id: string;

  private constructor() {
    this._id = USER_ID;
  }

  public static getInstance(): ConnectedUser {
    if (!ConnectedUser.instance) {
      ConnectedUser.instance = new ConnectedUser();
    }
    return ConnectedUser.instance;
  }

  get id(): string {
    return this._id;
  }
}

// Export d'une instance unique
export const connectedUser = ConnectedUser.getInstance(); 