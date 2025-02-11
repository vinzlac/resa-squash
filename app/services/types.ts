export interface Participant {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

// Types pour le planning
export interface PlanningParticipant {
    firstName: string;
    lastName: string;
}

export interface TimeSlot {
    time: string;
    isAvailable: boolean;
    participants: PlanningParticipant[];
    sessionId: string;
}

export interface CourtPlanning {
    courtNumber: string;
    slots: TimeSlot[];
}

export interface DayPlanning {
    date: string;
    courts: CourtPlanning[];
} 