export interface TrUser {
    firstName: string;
    lastName: string;
    _id: string;
    DOB: string;
    email: string;
}

export interface TrLicensee {
    _id: string;
    user: TrUser[];
}


interface TrClub {
    _id: string;
    name: string;
    email: string;
    logoUrl: string;
    disciplineDescription: string;
    approved: boolean;
    sesameEntityName: string;
    sesameFacilityCode: string;
    sesameTypeCode: string;
    coverUrl: string;
    webCoverUrl: string;
  }
  
  interface TrCoach {
    fullName: string;
    email: string;
    phone: string;
  }
  
  export interface TrLocation {
    coordinates: number[];
    _id: string;
    type: string;
  }
  
  export interface TrSession {
    _id: string;
    status: string;
    participants: string[];
    yesParticipants: string[];
    guests: string[];
    noParticipants: string[];
    maybeParticipants: string[];
    sold: number;
    category: string;
    deleted: boolean;
    club: TrClub[];
    tag: string;
    nbOfTickets: number;
    sessionName: string;
    customId: string;
    clubId: string;
    discipline: string;
    subDiscipline: string;
    type: string;
    requiresTwoParticipants: boolean;
    level: string;
    time: string;
    endTime: string;
    videoUrl: string;
    description: string;
    info: string;
    totalQuantity: number;
    totalQuantityFree: number;
    price: number;
    priceForFederation: number;
    priceForMyLicensees: number;
    address: string;
    zipCode: string;
    city: string;
    place: string;
    coachs: TrCoach[];
    seasonId: string;
    location: TrLocation;
    date: string;
    slotId: string;
    coach: string;
    coachEmail: string;
    coachPhone: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TrTransaction {
    type: string;
    status: string;
    options: string;
    madeBy: string;
    user: string[];
    price: number;
    sessionId: string;
    customId: string;
    session: string[];
    clubId: string;
    date: string;
    discipline: string;
    zipCode: string;
    fees: number;
    couponId: null;
    coordinates: number[];
    distanceInKm: number;
    requiresTwoParticipants: boolean;
    friendUserId: string;
    codeSeason: number;
    nbOfTickets: number;
  }
  
  export interface TrBookingResponse {
    session: TrSession;
    transaction: TrTransaction;
    friendTransaction: TrTransaction;
  }
