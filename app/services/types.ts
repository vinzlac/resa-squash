export interface User {
    firstName: string;
    lastName: string;
    _id: string;
    DOB: string;
    email: string;
}

export interface Licensee {
    _id: string;
    user: User[];
}

export interface Session {
    _id: string;
    status: string;
    participants: string[];
    yesParticipants: string[];
    sold: number;
    club: Array<{
        _id: string;
        name: string;
        logoUrl: string;
        federationName: string;
        coverUrl: string;
        webCoverUrl: string;
    }>;
    sessionName: string;
    clubId: string;
    discipline: string;
    subDiscipline: string;
    type: string;
    requiresTwoParticipants: boolean;
    level: string;
    time: string;
    endTime: string;
    totalQuantity: number;
    totalQuantityFree: number;
    price: number;
    priceForFederation: number;
    priceForMyLicensees: number;
    zipCode: string;
    city: string;
    date: string;
    slotId: string;
    calcDistance: number;
    slot: Array<{
        slotName: string;
    }>;
}

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