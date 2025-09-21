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
  
  export interface TrNoCreditsError {
    status: string;
    name: string;
    message: string;
  }

  export interface TrBookingAttendee {
    userId: string;
    memberNumber: number;
    fullName: string;
    attendeeResponse: {
      response: string;
      absenceReason: string;
    };
    coachResponse: {
      response: string;
      absenceReason: string;
      isJustified: boolean;
      status: string;
    };
    deleted: boolean;
    bookingType: string;
  }

  export interface TrBookingSlot {
    slotName: string;
  }

  export interface TrBookingSession {
    _id: string;
    clubId: string;
    totalQuantity: number;
    totalQuantityFree: number;
    level: string;
    coachs: Array<{
      fullName: string;
      email: string;
      phone: string;
    }>;
    guests: unknown[];
    sold: number;
    slotId: string;
    date: string;
    time: string;
    endTime: string;
    category: string;
    type: string;
    discipline: string;
    subDiscipline: string;
    address: string;
    zipCode: string;
    city: string;
    club: Array<{
      _id: string;
      name: string;
      logoUrl: string;
      coverUrl: string;
      webCoverUrl: string;
    }>;
    tag: string;
    requiresTwoParticipants: boolean;
    sessionName: string;
    attendees: TrBookingAttendee[];
    slot: TrBookingSlot[];
  }

  export interface TrBookingClub {
    _id: string;
    name: string;
    logoUrl: string;
    coverUrl: string;
    webCoverUrl: string;
  }

  export interface TrBooking {
    _id: string;
    status: string;
    type: string;
    options: string;
    price: string;
    fees: string;
    friendUserId: string;
    passId: string;
    clubId: string;
    sessionId: string;
    club: TrBookingClub[];
    session: TrBookingSession[];
  }