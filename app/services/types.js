// Définition des types pour le planning
export class DayPlanning {
  constructor(date, courts) {
    this.date = date;
    this.courts = courts;
  }
}

export class CourtPlanning {
  constructor(courtNumber, slots) {
    this.courtNumber = courtNumber;
    this.slots = slots;
  }
}

export class TimeSlot {
  constructor(time, endTime, isAvailable, sessionId, participants) {
    this.time = time;
    this.endTime = endTime;
    this.isAvailable = isAvailable;
    this.sessionId = sessionId;
    this.participants = participants || [];
  }
}

export class Participant {
  constructor(id, firstName, lastName, email, yes) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.yes = yes;
  }
} 