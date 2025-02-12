export interface Participant {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

// Types pour le planning
export interface PlanningParticipant {
    id: string;
    firstName: string;
    lastName: string;
}

export interface TimeSlot {
    time: string;
    isAvailable: boolean;
    sessionId: string;
    participants: PlanningParticipant[];
}

export interface CourtPlanning {
    courtNumber: string;
    slots: TimeSlot[];
}

export interface DayPlanning {
    date: string;
    courts: CourtPlanning[];
} 