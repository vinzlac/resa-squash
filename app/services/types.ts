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
    yes: boolean;
}

export interface TimeSlot {
    time: string;
    endTime: string;
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