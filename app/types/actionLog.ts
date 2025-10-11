// Types pour le logging des actions utilisateurs

export enum ActionType {
  CONNEXION = 'CONNEXION',
  ADD_BOOKING = 'ADD_BOOKING',
  DELETE_BOOKING = 'DELETE_BOOKING'
}

export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

// Détails spécifiques pour chaque type d'action
export interface ConnexionDetails {
  email: string;
}

export interface BookingDetails {
  court: number;
  date: string;
  time: string;
  userIds: string[];
}

// Union type pour tous les détails possibles
export type ActionDetails = ConnexionDetails | BookingDetails;

// Interface pour un log d'action
export interface ActionLog {
  id?: number;
  userId: string;
  actionType: ActionType;
  actionResult: ActionResult;
  actionTimestamp: Date;
  actionDetails: ActionDetails;
  createdAt?: Date;
}

